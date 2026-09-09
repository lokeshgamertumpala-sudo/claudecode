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
"""

class RequestSanitizer(CustomLogger):
    def __init__(self):
        super().__init__()
        self.api_key = None
        self._load_api_key()
        
        # Priority order for autonomous zero-downtime routing
        # (litellm_slug, nim_model_id, human_name)
        self.model_pool = [
            ("moonshotai/kimi-k3", "moonshotai/kimi-k3", "Moonshot Kimi-K3"),
            ("backup-nemotron", "nvidia/nemotron-3-super-120b-a12b", "Nemotron 120B"),
            ("backup-laguna", "poolside/laguna-xs-2.1", "Poolside Laguna XS 2.1"),
            ("openai/gpt-oss-20b", "openai/gpt-oss-20b", "OpenAI GPT-OSS 20B"),
        ]

        # Health tracker per NIM model: { nim_id: { "healthy": bool, "last_probe": float, "cooldown_until": float } }
        self.health = {}
        for _, nim_id, _ in self.model_pool:
            self.health[nim_id] = {
                "healthy": True,
                "last_probe": 0.0,
                "cooldown_until": 0.0
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
        # If currently in cooldown after a recent 429/503/timeout, do not use
        if now < record.get("cooldown_until", 0.0):
            return False
        return True

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
                        new_content.append({"type": "text", "text": "Displaying model selector: 1. Auto Smart-Failover, 2. Kimi-K3, 3. Nemotron 120B, 4. Laguna XS, 5. GPT-OSS."})
                    else:
                        new_content.append(part)
                elif part_type == "tool_result":
                    res_content = str(part.get("content", ""))
                    if "No such tool available: ai" in res_content:
                        new_content.append({"type": "text", "text": "Model selector acknowledged."})
                    else:
                        if isinstance(part.get("content"), list):
                            part["content"] = self.sanitize_content(part["content"])
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

    def resolve_target_model(self, pref: str) -> str:
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
            "gpt": ("openai/gpt-oss-20b", "openai/gpt-oss-20b"),
            "gpt-oss": ("openai/gpt-oss-20b", "openai/gpt-oss-20b"),
            "openai/gpt-oss-20b": ("openai/gpt-oss-20b", "openai/gpt-oss-20b"),
        }

        # If user explicitly locked a model and it's healthy, use it
        if pref in mapping:
            slug, nim_id = mapping[pref]
            if self.is_model_healthy(nim_id):
                return slug
            print(f"[SMART-ROUTER] Preferred model '{pref}' is currently throttled (429/cooldown). Auto-rerouting to prevent API error...", flush=True)

        # In 'auto' mode or if preferred model is down: pick first healthy from priority pool
        for slug, nim_id, name in self.model_pool:
            if self.is_model_healthy(nim_id):
                return slug

        # Ultimate fallback if all are in cooldown: Laguna XS 2.1 (fastest response)
        return "backup-laguna"

    async def async_pre_call_hook(self, user_api_key_dict: Any, cache: Any, data: dict, call_type: str):
        if not isinstance(data, dict):
            return None
        
        # 1. Sanitize messages to prevent multimodal crash
        messages = data.get("messages")
        if messages and isinstance(messages, list):
            for msg in messages:
                if not isinstance(msg, dict):
                    continue
                content = msg.get("content")
                if isinstance(content, list):
                    msg["content"] = self.sanitize_content(content)

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
            if isinstance(top_system, str) and "[CRITICAL ARCHITECTURAL CONTRACT" not in top_system:
                data["system"] = ARCHITECTURAL_COHESION_DIRECTIVE.strip() + "\n\n" + top_system
            elif isinstance(top_system, list):
                has_dir = any(isinstance(p, dict) and "[CRITICAL ARCHITECTURAL CONTRACT" in p.get("text", "") for p in top_system)
                if not has_dir:
                    top_system.insert(0, {"type": "text", "text": ARCHITECTURAL_COHESION_DIRECTIVE.strip() + "\n\n"})

        # 4. Dynamic zero-error model resolution
        pref = self.get_selected_model()
        target_model = self.resolve_target_model(pref)
        data["model"] = target_model

        return data

    async def async_post_call_failure_hook(self, request_data: dict, original_exception: Exception, user_api_key_dict: Any):
        # When any model encounters an upstream failure (e.g. 429 / 503 / timeout), place in cooldown
        if not isinstance(request_data, dict):
            return
        model_used = str(request_data.get("model", "")).lower()
        now = time.time()
        for slug, nim_id, name in self.model_pool:
            if slug.lower() in model_used or nim_id.lower() in model_used:
                if nim_id in self.health:
                    self.health[nim_id]["healthy"] = False
                    self.health[nim_id]["cooldown_until"] = now + 60.0
                    print(f"[SMART-ROUTER] Failure detected on {name} ({original_exception}). Cooldown for 60s.", flush=True)
                break

proxy_handler_instance = RequestSanitizer()
