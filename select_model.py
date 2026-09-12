import sys
import os
import time
import requests

MODELS = {
    "1": ("Auto Smart-Failover", "auto", "Prioritizes Nemotron 120B; adaptive failover across all models (Zero Errors)"),
    "2": ("NVIDIA Nemotron 3 Super 120B", "nvidia/nemotron-3-super-120b-a12b", "120B enterprise model, ultra-fast ~0.3s, 100% quota (RECOMMENDED)"),
    "3": ("Poolside Laguna XS 2.1", "poolside/laguna-xs-2.1", "High-speed code specialist, ~0.3s latency"),
    "4": ("DeepSeek V4 Pro", "deepseek-ai/deepseek-v4-pro-0813", "DeepSeek V4 Pro reasoning & coding flagship on NVIDIA NIM"),
    "5": ("Moonshot AI Kimi-K3", "moonshotai/kimi-k3", "Deep reasoning & coding (rate-limited on free tier)")
}

ALIASES = {
    "auto": "auto",
    "smart": "auto",
    "1": "auto",
    "nemotron": "nvidia/nemotron-3-super-120b-a12b",
    "nvidia": "nvidia/nemotron-3-super-120b-a12b",
    "nvidia/nemotron-3-super-120b-a12b": "nvidia/nemotron-3-super-120b-a12b",
    "2": "nvidia/nemotron-3-super-120b-a12b",
    "laguna": "poolside/laguna-xs-2.1",
    "poolside": "poolside/laguna-xs-2.1",
    "poolside/laguna-xs-2.1": "poolside/laguna-xs-2.1",
    "3": "poolside/laguna-xs-2.1",
    "deepseek": "deepseek-ai/deepseek-v4-pro-0813",
    "deepseek-v4-pro": "deepseek-ai/deepseek-v4-pro-0813",
    "deepseek-v4pro": "deepseek-ai/deepseek-v4-pro-0813",
    "v4pro": "deepseek-ai/deepseek-v4-pro-0813",
    "deepseek-ai/deepseek-v4-pro-0813": "deepseek-ai/deepseek-v4-pro-0813",
    "4": "deepseek-ai/deepseek-v4-pro-0813",
    "kimi": "moonshotai/kimi-k3",
    "kimi-k3": "moonshotai/kimi-k3",
    "moonshotai/kimi-k3": "moonshotai/kimi-k3",
    "5": "moonshotai/kimi-k3"
}

pref_file = os.path.join(os.path.dirname(__file__), "active_model.txt")

def get_current():
    if os.path.exists(pref_file):
        try:
            with open(pref_file, "r", encoding="utf-8") as f:
                c = f.read().strip()
                if c:
                    return ALIASES.get(c.lower(), c)
        except Exception:
            pass
    return "auto"

def update_claude_settings(canonical, display_name):
    import json
    settings_dirs = [
        os.path.join(os.path.dirname(__file__), ".claude"),
        os.path.expanduser("~/.claude")
    ]
    active_desc = ""
    for k, (name, slug, desc) in MODELS.items():
        if canonical == slug:
            active_desc = desc
            break

    options = [
        {
            "model": "claude-sonnet-4-5",
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
            existing["effort"] = "max"
            existing["enableWorkflows"] = True
            existing["modelPicker"] = {"options": options}
            with open(spath, "w", encoding="utf-8") as f:
                json.dump(existing, f, indent=2)
        except Exception:
            pass

def set_model(choice_key_or_name):
    target = choice_key_or_name.lower().strip()
    canonical = ALIASES.get(target, target)
    
    display_name = canonical
    for k, (name, slug, desc) in MODELS.items():
        if canonical == slug:
            display_name = name
            break

    with open(pref_file, "w", encoding="utf-8") as f:
        f.write(canonical)
    
    # Sync Claude Code settings so the real model name displays in the terminal
    update_claude_settings(canonical, display_name)
    
    print(f"\n[+] Active model switched to: {display_name}")
    print(f"    -> Canonical Model ID: {canonical}")
    print(f"    -> Terminal Header Label: {display_name}")
    print("[+] All requests through port 4000 are pre-sanitized with zero errors.")
    return canonical

def show_menu():
    curr = get_current()
    print("=" * 65)
    print("           CLAUDE CODE - AI MODEL SELECTOR (NVIDIA NIM)          ")
    print("=" * 65)
    for k, (name, slug, desc) in MODELS.items():
        tag = " [ACTIVE]" if slug == curr or (k == "1" and curr == "auto") else ""
        print(f" [{k}] {name:<32} {tag}")
        print(f"     -> {desc}")
    print("-" * 65)

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
            choice = input("\nSelect model [1-5] (or Enter to keep current): ").strip()
            if choice:
                set_model(choice)
        except (KeyboardInterrupt, EOFError):
            print("\nKeeping current model.")
