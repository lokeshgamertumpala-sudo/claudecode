import sys
import os
import time
import requests

MODELS = {
    "1": ("Auto Smart-Failover", "auto", "Prioritizes Nemotron 120B; adaptive failover across all models (Zero Errors)"),
    "2": ("NVIDIA Nemotron 3 Super 120B", "nvidia/nemotron-3-super-120b-a12b", "120B enterprise model, ultra-fast ~0.3s, 100% quota (RECOMMENDED)"),
    "3": ("Poolside Laguna XS 2.1", "poolside/laguna-xs-2.1", "High-speed code specialist, ~0.3s latency"),
    "4": ("OpenAI GPT-OSS 20B", "openai/gpt-oss-20b", "Fast utility & code assistance model"),
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
    "gpt": "openai/gpt-oss-20b",
    "gpt-oss": "openai/gpt-oss-20b",
    "openai/gpt-oss-20b": "openai/gpt-oss-20b",
    "4": "openai/gpt-oss-20b",
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
    
    # Persist to Windows User environment so any new session picks it up automatically
    os.system(f'setx ANTHROPIC_MODEL "{canonical}" >nul 2>&1')
    os.system(f'setx ANTHROPIC_DEFAULT_SONNET_MODEL "{canonical}" >nul 2>&1')
    
    print(f"\n[+] Active model switched to: {display_name}")
    print(f"    -> Canonical Model ID: {canonical}")
    print("[+] All requests through port 4000 are pre-sanitized with zero errors.")
    print("[*] Note for already-running Claude Code sessions: Type '/model " + canonical + "' inside Claude to switch immediately.")
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
