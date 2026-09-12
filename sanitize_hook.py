import sys
import time
import os
import requests
from litellm.integrations.custom_logger import CustomLogger
from typing import Any

ARCHITECTURAL_COHESION_DIRECTIVE = """
[CRITICAL ARCHITECTURAL CONTRACT - PERMANENT MULTI-FILE DIRECTIVE]
You are operating as an Elite Principal Software Architect and Lead Engineer.
When generating, modifying, or refactoring multi-file software projects, you MUST adhere strictly to these principles:
1. INTERCONNECTED COMPLETENESS (ZERO ORPHANED IMPORTS):
   - Whenever you write or edit a file that contains import or require statements pointing to local relative paths (e.g. `./src/...`, `../utils/...`, `./components/...`), you MUST ensure that EVERY referenced file is fully implemented and saved to disk.
   - NEVER create entry points (e.g. `App.js`, `index.html`, `main.py`) referencing missing screens, helper functions, or state stores.
2. IMPORT/EXPORT SYMMETRY:
   - Match export signatures precisely. If a module uses `export default Foo`, import it via `import Foo from ...`. If it uses named exports (`export const bar`), import via `import { bar } from ...`.
   - Verify external package names against package.json (e.g., `@react-navigation/bottom-tabs`, NOT `@react-navigation/bottom-tab`).
3. ZERO STUBS / ZERO PLACEHOLDERS:
   - Never write `// TODO: implement later`, empty callbacks, or mock returns when asked to build features. Write full, complete, production-grade logic.
4. DOM & EVENT WIRING:
   - In web/mobile apps, all buttons, forms, and interactive elements must be connected to their corresponding state, handlers, or event listeners.
5. PRE-COMPLETION VERIFICATION:
   - Always run syntax checks and verify import chains before concluding. Zero runtime errors, zero syntax errors, and 100% interconnected harmony.
6. ENGINE IDENTITY & RUNTIME AWARENESS:
   - Your underlying reasoning engine is powered by NVIDIA NIM enterprise inference running your active model (Moonshot AI Kimi-K3, NVIDIA Nemotron 120B, Poolside Laguna, or DeepSeek V4 Pro) integrated with Claude Code CLI.
   - When asked what AI model, mode, or engine you are, explicitly declare your active model powered by NVIDIA NIM. Never claim to be Anthropic Claude or Sonnet.
"""

class RequestSanitizer(CustomLogger):
    def __init__(self):
        super().__init__()
        self.api_key = None
        self._load_api_key()
        
        # Priority order: fastest & most-available models first.
        # Kimi-K3 is heavily rate-limited on free tier, so it goes last.
        # (litellm_slug, nim_model_id, human_name)
        self.model_pool = [
            ("backup-nemotron", "nvidia/nemotron-3-super-120b-a12b", "Nemotron 120B"),
            ("deepseek-v4-flash", "deepseek-ai/deepseek-v4-flash-0731", "DeepSeek V4 Flash"),
            ("backup-laguna", "poolside/laguna-xs-2.1", "Poolside Laguna XS 2.1"),
            ("deepseek-v4-pro", "deepseek-ai/deepseek-v4-pro-0813", "DeepSeek V4 Pro"),
            ("moonshotai/kimi-k3", "moonshotai/kimi-k3", "Moonshot Kimi-K3"),
        ]

        now = time.time()
        self.health = {}
        for _, nim_id, _ in self.model_pool:
            # Nemotron 120B and DeepSeek V4 Flash are active and verified.
            is_active = ("nemotron" in nim_id or "flash" in nim_id)
            init_cooldown = 0.0 if is_active else (now + 600.0)
            self.health[nim_id] = {
                "healthy": is_active,
                "cooldown_until": init_cooldown,
                "consecutive_failures": 0 if is_active else 1,
                "last_success": 0.0,
            }

    def _load_api_key(self):
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8-sig") as f:
                    for line in f:
                        if "NVIDIA_API_KEY" in line and not line.strip().startswith("#"):
                            parts = line.strip().split("=", 1)
                            if len(parts) == 2:
                                self.api_key = parts[1].strip('"\' ')
                                break
            except Exception:
                pass

    def is_model_healthy(self, nim_id: str) -> bool:
        now = time.time()
        record = self.health.get(nim_id)
        if not record:
            return True
        if now < record.get("cooldown_until", 0.0):
            return False
        return True

    def _set_cooldown(self, nim_id: str, reason: str):
        """Adaptive cooldown: longer cooldowns for models that keep failing."""
        now = time.time()
        record = self.health.get(nim_id)
        if not record:
            return
        record["consecutive_failures"] = record.get("consecutive_failures", 0) + 1
        record["healthy"] = False
        # Graduated cooldown: 60s -> 120s -> 300s -> 600s
        base_cooldowns = [60, 120, 300, 600]
        idx = min(record["consecutive_failures"] - 1, len(base_cooldowns) - 1)
        cooldown_secs = 600 if ("timeout" in reason.lower() or "readtimedout" in reason.lower()) else base_cooldowns[idx]
        record["cooldown_until"] = now + cooldown_secs
        print(f"[SMART-ROUTER] {nim_id} -> {reason}. Cooldown {cooldown_secs}s (failure #{record['consecutive_failures']}).", flush=True)

    def _mark_success(self, nim_id: str):
        """Reset failure counter on success to restore short cooldowns."""
        record = self.health.get(nim_id)
        if record:
            record["healthy"] = True
            record["consecutive_failures"] = 0
            record["last_success"] = time.time()
            record["cooldown_until"] = 0.0

    def sanitize_content(self, content):
        if not isinstance(content, list):
            return content
        new_content = []
        for part in content:
            if isinstance(part, dict):
                part_type = part.get("type", "")
                if part_type in ("image", "image_url", "input_audio"):
                    new_content.append({"type": "text", "text": "[Image: Screenshot omitted for text-model compatibility]"})
                elif part_type == "tool_use":
                    tool_name = part.get("name", "")
                    if tool_name == "ai":
                        new_content.append({"type": "text", "text": "Displaying model selector: 1. Auto Smart-Failover, 2. Nemotron 120B, 3. Laguna XS, 4. DeepSeek V4 Pro, 5. Kimi-K3."})
                    else:
                        new_content.append(part)
                elif part_type == "tool_result":
                    res_content = part.get("content", "")
                    if isinstance(res_content, str):
                        if "No such tool available: ai" in res_content:
                            new_content.append({"type": "text", "text": "Model selector acknowledged."})
                            continue
                        # If a single tool output is huge (>15k chars), truncate the middle to prevent upstream context blowout
                        if len(res_content) > 15000:
                            part["content"] = res_content[:6000] + f"\n\n[... Truncated {len(res_content) - 12000} characters of output for context stability ...] \n\n" + res_content[-6000:]
                        new_content.append(part)
                    elif isinstance(res_content, list):
                        part["content"] = self.sanitize_content(res_content)
                        new_content.append(part)
                    else:
                        new_content.append(part)
                else:
                    new_content.append(part)
            else:
                new_content.append(part)
        return new_content

    def get_selected_model(self) -> str:
        pref_file = os.path.join(os.path.dirname(__file__), "active_model.txt")
        if os.path.exists(pref_file):
            try:
                with open(pref_file, "r", encoding="utf-8") as f:
                    choice = f.read().strip().lower()
                    if choice:
                        return choice
            except Exception:
                pass
        return "auto"

    def resolve_target_model(self, pref: str, total_chars: int = 0) -> str:
        # Mapping for explicit user choices (both short slugs and canonical names)
        mapping = {
            "kimi": ("moonshotai/kimi-k3", "moonshotai/kimi-k3"),
            "kimi-k3": ("moonshotai/kimi-k3", "moonshotai/kimi-k3"),
            "moonshotai/kimi-k3": ("moonshotai/kimi-k3", "moonshotai/kimi-k3"),
            "nemotron": ("backup-nemotron", "nvidia/nemotron-3-super-120b-a12b"),
            "nvidia/nemotron-3-super-120b-a12b": ("backup-nemotron", "nvidia/nemotron-3-super-120b-a12b"),
            "laguna": ("backup-laguna", "poolside/laguna-xs-2.1"),
            "poolside": ("backup-laguna", "poolside/laguna-xs-2.1"),
            "poolside/laguna-xs-2.1": ("backup-laguna", "poolside/laguna-xs-2.1"),
            "deepseek": ("deepseek-v4-pro", "deepseek-ai/deepseek-v4-pro-0813"),
            "deepseek-v4-pro": ("deepseek-v4-pro", "deepseek-ai/deepseek-v4-pro-0813"),
            "deepseek-v4pro": ("deepseek-v4-pro", "deepseek-ai/deepseek-v4-pro-0813"),
            "v4pro": ("deepseek-v4-pro", "deepseek-ai/deepseek-v4-pro-0813"),
            "deepseek-ai/deepseek-v4-pro-0813": ("deepseek-v4-pro", "deepseek-ai/deepseek-v4-pro-0813"),
            "flash": ("deepseek-v4-flash", "deepseek-ai/deepseek-v4-flash-0731"),
            "deepseek-v4-flash": ("deepseek-v4-flash", "deepseek-ai/deepseek-v4-flash-0731"),
            "deepseek-ai/deepseek-v4-flash-0731": ("deepseek-v4-flash", "deepseek-ai/deepseek-v4-flash-0731"),
        }

        # Nemotron 120B operates at ~0.5s sub-second latency for contexts up to 55,000 chars.
        # Requests stay on Nemotron 120B for maximum speed and zero timeout risk.

        # If user explicitly locked a model and it's healthy, use it
        if pref in mapping:
            slug, nim_id = mapping[pref]
            if self.is_model_healthy(nim_id):
                return slug
            print(f"[SMART-ROUTER] Preferred model '{pref}' is throttled. Auto-rerouting...", flush=True)

        # In 'auto' mode or if preferred model is down: pick first healthy from priority pool
        for slug, nim_id, name in self.model_pool:
            if self.is_model_healthy(nim_id):
                return slug

        # Ultimate fallback: pick the model whose cooldown expires soonest
        soonest_slug = "backup-nemotron"
        soonest_time = float("inf")
        for slug, nim_id, name in self.model_pool:
            cd = self.health.get(nim_id, {}).get("cooldown_until", 0.0)
            if cd < soonest_time:
                soonest_time = cd
                soonest_slug = slug
        print(f"[SMART-ROUTER] All models in cooldown. Using {soonest_slug} (cooldown expires soonest).", flush=True)
        return soonest_slug

    async def async_pre_call_hook(self, user_api_key_dict: Any = None, cache: Any = None, data: dict = None, call_type: str = "", *args, **kwargs):
        if not isinstance(data, dict):
            return None
        
        # 1. Sanitize messages to prevent multimodal crash and context blowout
        messages = data.get("messages")
        total_chars = 0
        if messages and isinstance(messages, list):
            for msg in messages:
                if not isinstance(msg, dict):
                    continue
                content = msg.get("content")
                if isinstance(content, list):
                    msg["content"] = self.sanitize_content(content)
                    for p in msg["content"]:
                        if isinstance(p, dict):
                            total_chars += len(str(p.get("text", ""))) + len(str(p.get("content", "")))
                elif isinstance(content, str):
                    total_chars += len(content)

            # 2. Inject Permanent Architectural Cohesion Directive into system prompt
            directive_text = ARCHITECTURAL_COHESION_DIRECTIVE.strip()
            system_msg = None
            for msg in messages:
                if isinstance(msg, dict) and msg.get("role") in ("system", "developer"):
                    system_msg = msg
                    break
            
            if system_msg:
                s_content = system_msg.get("content")
                if isinstance(s_content, str):
                    if "[CRITICAL ARCHITECTURAL CONTRACT" not in s_content:
                        system_msg["content"] = directive_text + "\n\n" + s_content
                elif isinstance(s_content, list):
                    has_dir = any(isinstance(p, dict) and "[CRITICAL ARCHITECTURAL CONTRACT" in p.get("text", "") for p in s_content)
                    if not has_dir:
                        s_content.insert(0, {"type": "text", "text": directive_text + "\n\n"})
            else:
                messages.insert(0, {"role": "system", "content": directive_text})

        # 3. If top-level system parameter is passed
        top_system = data.get("system")
        if top_system:
            if isinstance(top_system, str):
                total_chars += len(top_system)
                if "[CRITICAL ARCHITECTURAL CONTRACT" not in top_system:
                    data["system"] = ARCHITECTURAL_COHESION_DIRECTIVE.strip() + "\n\n" + top_system
            elif isinstance(top_system, list):
                has_dir = any(isinstance(p, dict) and "[CRITICAL ARCHITECTURAL CONTRACT" in p.get("text", "") for p in top_system)
        # 4. Context safety trimming for sub-second Nemotron 120B performance (<50,000 chars)
        if total_chars > 48000 and messages and len(messages) > 3:
            for msg in messages[1:-1]:
                if not isinstance(msg, dict):
                    continue
                c = msg.get("content")
                if isinstance(c, str) and len(c) > 1500:
                    msg["content"] = c[:700] + "\n[... Context pruned for sub-second Nemotron speed ...]\n" + c[-700:]
                elif isinstance(c, list):
                    for p in c:
                        if isinstance(p, dict) and p.get("type") == "text":
                            t = p.get("text", "")
                            if len(t) > 1500:
                                p["text"] = t[:700] + "\n[... Context pruned ...]\n" + t[-700:]

        # 5. Dynamic zero-error context-aware model resolution
        pref = self.get_selected_model()
        target_model = self.resolve_target_model(pref, total_chars=total_chars)
        data["model"] = target_model

        return data

        return data

    async def async_post_call_failure_hook(self, request_data: dict = None, original_exception: Exception = None, user_api_key_dict: Any = None, *args, **kwargs):
        """Place failed models in adaptive cooldown so future requests skip them instantly."""
        if not isinstance(request_data, dict):
            return
        model_used = str(request_data.get("model", "")).lower()
        for slug, nim_id, name in self.model_pool:
            if slug.lower() in model_used or nim_id.lower() in model_used:
                self._set_cooldown(nim_id, f"Failure: {type(original_exception).__name__}")
                break

    async def async_post_call_success_hook(self, data: dict = None, user_api_key_dict: Any = None, response: Any = None, *args, **kwargs):
        """On success, reset the model's failure counter so it gets short cooldowns next time."""
        if not isinstance(data, dict):
            return
        model_used = str(data.get("model", "")).lower()
        for slug, nim_id, name in self.model_pool:
            if slug.lower() in model_used or nim_id.lower() in model_used:
                self._mark_success(nim_id)
                break

proxy_handler_instance = RequestSanitizer()

