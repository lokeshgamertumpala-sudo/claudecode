import sys
import time
import os
import requests
from litellm.integrations.custom_logger import CustomLogger
from typing import Any

class RequestSanitizer(CustomLogger):
    def __init__(self):
        super().__init__()
        self.kimi_healthy = False
        self.last_probe_time = 0.0
        self.probe_interval = 45.0  # probe every 45s
        self.api_key = None
        self._load_api_key()

    def _load_api_key(self):
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8-sig") as f:
                for line in f:
                    if "NVIDIA_API_KEY" in line:
                        self.api_key = line.strip().split("=", 1)[1].strip('"\' ')
                        break

    def check_kimi_health(self) -> bool:
        now = time.time()
        if now - self.last_probe_time < self.probe_interval:
            return self.kimi_healthy

        self.last_probe_time = now
        if not self.api_key:
            self._load_api_key()
        if not self.api_key:
            self.kimi_healthy = False
            return False

        try:
            # Quick 1-token probe to check if Kimi-K3 rate limit has cleared
            r = requests.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json={"model": "moonshotai/kimi-k3", "messages": [{"role": "user", "content": "1"}], "max_tokens": 1},
                timeout=3
            )
            if r.status_code == 200:
                print("[SMART-ROUTER] Moonshot Kimi-K3 is HEALTHY (200 OK) -> Routing to Kimi-K3!", flush=True)
                self.kimi_healthy = True
            else:
                print(f"[SMART-ROUTER] Moonshot Kimi-K3 is busy ({r.status_code}) -> Routing to Nemotron 120B!", flush=True)
                self.kimi_healthy = False
        except Exception as e:
            print(f"[SMART-ROUTER] Kimi-K3 probe exception ({e}) -> Routing to Nemotron 120B!", flush=True)
            self.kimi_healthy = False

        return self.kimi_healthy

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

        # 2. Smart Model Routing: Check user selection & health for zero errors
        req_model = data.get("model", "").lower()
        pref = self.get_selected_model()

        # Direct explicit requests take precedence
        if "nemotron" in req_model:
            data["model"] = "backup-nemotron"
        elif "laguna" in req_model:
            data["model"] = "backup-laguna"
        elif "gpt-oss" in req_model:
            data["model"] = "openai/gpt-oss-20b"
        else:
            # For general/claude/kimi requests, respect active_model.txt preference
            if "nemotron" in pref:
                data["model"] = "backup-nemotron"
            elif "laguna" in pref:
                data["model"] = "backup-laguna"
            elif "gpt-oss" in pref:
                data["model"] = "openai/gpt-oss-20b"
            elif "kimi" in pref:
                if self.check_kimi_health():
                    data["model"] = "moonshotai/kimi-k3"
                else:
                    data["model"] = "backup-nemotron"
            else:
                # Default "auto": Prioritize Kimi-K3, failover to Nemotron 120B
                if self.check_kimi_health():
                    data["model"] = "moonshotai/kimi-k3"
                else:
                    data["model"] = "backup-nemotron"

        return data

proxy_handler_instance = RequestSanitizer()

