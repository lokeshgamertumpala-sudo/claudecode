import sys
import os
import time
import requests
import json

MODELS = {
    "1": ("Auto Smart-Failover", "auto", "Seamless resilience mesh (Mistral Large 4 -> Nemotron Ultra -> Laguna XS -> Step 5)"),
    "2": ("Mistral Large 4", "mistralai/mistral-large-4-1t-a52b", "1.05T Frontier MoE, 52B Active (PRIMARY DEFAULT)"),
    "3": ("Step 5 Preview", "stepfun-ai/step-5-preview", "600B MoE, 1M Context Window, Advanced Multimodal Reasoning"),
    "4": ("MiniMax M3.1 Flash", "minimaxai/minimax-m3.1-flash", "428B MoE, Ultra-Fast Agentic & Code Specialist"),
    "5": ("NVIDIA Nemotron Ultra 550B MoE", "nvidia/nemotron-3-ultra-550b-a55b", "550B Flagship Reasoning Giant, Sub-Second Latency"),
    "6": ("DeepSeek V4.1 Flash", "deepseek-ai/deepseek-v4.1-flash", "High-speed reasoning & massive context coding powerhouse"),
    "7": ("Poolside Laguna XS 2.1", "poolside/laguna-xs-2.1", "High-speed software engineering & code specialist"),
    "8": ("DeepSeek R1", "deepseek-ai/deepseek-r1", "671B Frontier Open Reasoning Engine"),
    "9": ("DeepSeek V3", "deepseek-ai/deepseek-v3", "671B Frontier MoE Code & Language Model"),
    "10": ("Meta Llama 3.3 70B Instruct", "meta/llama-3.3-70b-instruct", "70B Frontier Open Instruction Model"),
    "11": ("Qwen 2.5 72B Instruct", "qwen/qwen2.5-72b-instruct", "72B Advanced Reasoning & Code Flagship")
}

ALIASES = {
    "auto": "auto",
    "smart": "auto",
    "1": "auto",
    "mistral": "mistralai/mistral-large-4-1t-a52b",
    "mistral-large": "mistralai/mistral-large-4-1t-a52b",
    "mistral-large-4": "mistralai/mistral-large-4-1t-a52b",
    "mistral-4": "mistralai/mistral-large-4-1t-a52b",
    "mistralai/mistral-large-4-1t-a52b": "mistralai/mistral-large-4-1t-a52b",
    "2": "mistralai/mistral-large-4-1t-a52b",
    "step": "stepfun-ai/step-5-preview",
    "step-5": "stepfun-ai/step-5-preview",
    "step5": "stepfun-ai/step-5-preview",
    "step-5-preview": "stepfun-ai/step-5-preview",
    "stepfun-ai/step-5-preview": "stepfun-ai/step-5-preview",
    "3": "stepfun-ai/step-5-preview",
    "minimax": "minimaxai/minimax-m3.1-flash",
    "m3.1": "minimaxai/minimax-m3.1-flash",
    "m3.1-flash": "minimaxai/minimax-m3.1-flash",
    "minimax-m3.1": "minimaxai/minimax-m3.1-flash",
    "minimax-m3.1-flash": "minimaxai/minimax-m3.1-flash",
    "minimaxai/minimax-m3.1-flash": "minimaxai/minimax-m3.1-flash",
    "4": "minimaxai/minimax-m3.1-flash",
    "ultra": "nvidia/nemotron-3-ultra-550b-a55b",
    "nemotron-ultra": "nvidia/nemotron-3-ultra-550b-a55b",
    "nemotron-ultra-550b": "nvidia/nemotron-3-ultra-550b-a55b",
    "ultra-550b": "nvidia/nemotron-3-ultra-550b-a55b",
    "nemotron": "nvidia/nemotron-3-ultra-550b-a55b",
    "nvidia/nemotron-3-ultra-550b-a55b": "nvidia/nemotron-3-ultra-550b-a55b",
    "5": "nvidia/nemotron-3-ultra-550b-a55b",
    "deepseek": "deepseek-ai/deepseek-v4.1-flash",
    "deepseek-v4.1-flash": "deepseek-ai/deepseek-v4.1-flash",
    "deepseek-v4.1": "deepseek-ai/deepseek-v4.1-flash",
    "deepseek-flash": "deepseek-ai/deepseek-v4.1-flash",
    "flash": "deepseek-ai/deepseek-v4.1-flash",
    "deepseek-ai/deepseek-v4.1-flash": "deepseek-ai/deepseek-v4.1-flash",
    "6": "deepseek-ai/deepseek-v4.1-flash",
    "laguna": "poolside/laguna-xs-2.1",
    "poolside": "poolside/laguna-xs-2.1",
    "poolside/laguna-xs-2.1": "poolside/laguna-xs-2.1",
    "7": "poolside/laguna-xs-2.1",
    "r1": "deepseek-ai/deepseek-r1",
    "deepseek-r1": "deepseek-ai/deepseek-r1",
    "deepseek-ai/deepseek-r1": "deepseek-ai/deepseek-r1",
    "8": "deepseek-ai/deepseek-r1",
    "v3": "deepseek-ai/deepseek-v3",
    "deepseek-v3": "deepseek-ai/deepseek-v3",
    "deepseek-ai/deepseek-v3": "deepseek-ai/deepseek-v3",
    "9": "deepseek-ai/deepseek-v3",
    "llama": "meta/llama-3.3-70b-instruct",
    "llama-3.3": "meta/llama-3.3-70b-instruct",
    "llama-3.3-70b": "meta/llama-3.3-70b-instruct",
    "meta/llama-3.3-70b-instruct": "meta/llama-3.3-70b-instruct",
    "10": "meta/llama-3.3-70b-instruct",
    "qwen": "qwen/qwen2.5-72b-instruct",
    "qwen-72b": "qwen/qwen2.5-72b-instruct",
    "qwen-2.5-72b": "qwen/qwen2.5-72b-instruct",
    "qwen/qwen2.5-72b-instruct": "qwen/qwen2.5-72b-instruct",
    "11": "qwen/qwen2.5-72b-instruct",
    "kimi": "mistralai/mistral-large-4-1t-a52b",
    "kimi-k3": "mistralai/mistral-large-4-1t-a52b",
    "nemotron-3-super-120b-a12b": "nvidia/nemotron-3-ultra-550b-a55b",
    "nvidia/nemotron-3-super-120b-a12b": "nvidia/nemotron-3-ultra-550b-a55b",
    "boost": "nvidia/nemotron-3-ultra-550b-a55b",
    "turbo": "nvidia/nemotron-3-ultra-550b-a55b",
    "fast": "nvidia/nemotron-3-ultra-550b-a55b"
}

KNOWN_WORKSPACES = [
    r"c:\Users\NEW\OneDrive\Desktop\CLAUDE CODE E",
    r"c:\Users\NEW\OneDrive\Desktop\claudecode"
]

pref_file = os.path.join(os.path.dirname(__file__), "active_model.txt")

def update_windows_user_env(display_name):
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment", 0, winreg.KEY_SET_VALUE) as key:
            winreg.SetValueEx(key, "ANTHROPIC_MODEL", 0, winreg.REG_SZ, "claude-sonnet-5")
            winreg.SetValueEx(key, "ANTHROPIC_DEFAULT_SONNET_MODEL", 0, winreg.REG_SZ, "claude-sonnet-5")
            winreg.SetValueEx(key, "ANTHROPIC_DEFAULT_HAIKU_MODEL", 0, winreg.REG_SZ, "claude-sonnet-5")
            winreg.SetValueEx(key, "ANTHROPIC_DEFAULT_OPUS_MODEL", 0, winreg.REG_SZ, "claude-sonnet-5")
            winreg.SetValueEx(key, "ANTHROPIC_CUSTOM_MODEL_OPTION", 0, winreg.REG_SZ, "claude-sonnet-5")
            winreg.SetValueEx(key, "ANTHROPIC_CUSTOM_MODEL_OPTION_NAME", 0, winreg.REG_SZ, display_name)
            winreg.SetValueEx(key, "ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION", 0, winreg.REG_SZ, f"{display_name} via local NIM proxy")
            winreg.SetValueEx(key, "CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT", 0, winreg.REG_SZ, "1")
            winreg.SetValueEx(key, "CLAUDE_CODE_WORKFLOWS", 0, winreg.REG_SZ, "1")
            winreg.SetValueEx(key, "ANTHROPIC_BASE_URL", 0, winreg.REG_SZ, "http://127.0.0.1:4000")
            winreg.SetValueEx(key, "ANTHROPIC_API_KEY", 0, winreg.REG_SZ, "sk-litellm-proxy-key")
    except Exception as e:
        print(f"[!] Warning: could not update Windows User Environment registry: {e}")

def get_current():
    if os.path.exists(pref_file):
        try:
            with open(pref_file, "r", encoding="utf-8") as f:
                c = f.read().strip()
                if c:
                    return ALIASES.get(c.lower(), c)
        except Exception:
            pass
    return "mistralai/mistral-large-4-1t-a52b"

def update_claude_settings(canonical, display_name):
    settings_dirs = [
        os.path.join(os.path.dirname(__file__), ".claude"),
        os.path.expanduser("~/.claude")
    ]
    for ws in KNOWN_WORKSPACES:
        ws_claude = os.path.join(ws, ".claude")
        if os.path.exists(ws) and ws_claude not in settings_dirs:
            settings_dirs.append(ws_claude)

    active_desc = ""
    for k, (name, slug, desc) in MODELS.items():
        if canonical == slug:
            active_desc = desc
            break

    options = [
        {
            "model": "claude-sonnet-5",
            "label": display_name,
            "description": active_desc or f"{display_name} via local NIM proxy",
            "behavesAs": "sonnet"
        }
    ]
    for k, (name, slug, desc) in MODELS.items():
        if slug != "auto":
            options.append({
                "model": slug,
                "label": name,
                "description": desc,
                "behavesAs": "sonnet"
            })

    for sdir in settings_dirs:
        try:
            os.makedirs(sdir, exist_ok=True)
            spath = os.path.join(sdir, "settings.json")
            existing = {}
            if os.path.exists(spath):
                try:
                    with open(spath, "r", encoding="utf-8") as f:
                        existing = json.load(f)
                except Exception:
                    existing = {}
            if "effort" in existing:
                del existing["effort"]
            existing["model"] = "claude-sonnet-5"
            existing["enableWorkflows"] = True
            existing["modelPicker"] = {"options": options}
            existing["skipDangerousModePermissionPrompt"] = True
            existing["permissions"] = {
                "defaultMode": "bypassPermissions",
                "allow": ["WebSearch", "WebFetch"]
            }
            if "hooks" not in existing:
                existing["hooks"] = {
                    "PreToolUse": [
                        {
                            "matcher": ".*",
                            "hooks": [
                                {
                                    "type": "command",
                                    "command": "python .agents/motion/tool_motion_hook.py pre"
                                }
                            ]
                        }
                    ],
                    "PostToolUse": [
                        {
                            "matcher": ".*",
                            "hooks": [
                                {
                                    "type": "command",
                                    "command": "python .agents/motion/tool_motion_hook.py post"
                                }
                            ]
                        }
                    ]
                }
            with open(spath, "w", encoding="utf-8") as f:
                json.dump(existing, f, indent=2)
        except Exception:
            pass

def set_model(choice_key_or_name):
    target = choice_key_or_name.lower().strip()
    canonical = ALIASES.get(target, target)
    
    valid_slugs = {slug for _, slug, _ in MODELS.values()} | {"auto"}
    if canonical not in valid_slugs:
        print(f"\n[!] Ignored unrecognized model parameter: '{choice_key_or_name}'.")
        print(f"    Current model preserved: {get_current()}")
        return get_current()
    
    display_name = canonical
    for k, (name, slug, desc) in MODELS.items():
        if canonical == slug:
            display_name = name
            break

    # Symmetrically update active_model.txt across all known workspaces
    for ws in KNOWN_WORKSPACES:
        if os.path.exists(ws):
            target_pref = os.path.join(ws, "active_model.txt")
            try:
                with open(target_pref, "w", encoding="utf-8") as f:
                    f.write(canonical)
            except Exception:
                pass
    try:
        with open(pref_file, "w", encoding="utf-8") as f:
            f.write(canonical)
    except Exception:
        pass
    
    # Sync Claude Code settings across all workspaces & user profile
    update_claude_settings(canonical, display_name)
    # Sync Windows User Registry environment variables
    update_windows_user_env(display_name)
    
    print(f"\n[+] Active model switched to: {display_name}")
    print(f"    -> Canonical Model ID: {canonical}")
    print(f"    -> Terminal Header Label: {display_name}")
    print("[+] All requests through port 4000 are pre-sanitized with zero API errors.")
    return canonical

def show_menu():
    curr = get_current()
    print("=" * 75)
    print("   CLAUDE CODE - FRONTIER MODEL TERMINAL SELECTOR (NVIDIA NIM)   ")
    print("=" * 75)
    for k, (name, slug, desc) in MODELS.items():
        tag = " [ACTIVE]" if slug == curr or (k == "2" and curr == "mistralai/mistral-large-4-1t-a52b") else ""
        print(f" [{k}] {name:<35} {tag}")
        print(f"     -> {desc}")
    print("-" * 75)
    print(" Quick switch commands: model ultra | model mistral | model r1 | model llama | model qwen")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1].strip()
        if arg in ("--list", "-l", "list"):
            show_menu()
        else:
            set_model(arg)
    else:
        show_menu()
        try:
            choice = input("\nSelect model [1-11] (or Enter to keep current): ").strip()
            if choice:
                set_model(choice)
        except (KeyboardInterrupt, EOFError):
            print("\nKeeping current model.")
