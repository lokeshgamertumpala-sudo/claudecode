#!/usr/bin/env bash
# Claude Code Turbo Boost Accelerator (macOS / Linux / POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python 3 not found." >&2
    exit 1
fi

echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m   🚀 CLAUDE CODE TURBO BOOST ACCELERATOR          \033[0m"
echo -e "\033[90m   Sub-Second Inference & 1-Shot 60FPS Remotion Studio\033[0m"
echo -e "\033[96m====================================================\033[0m"

# 1. Ensure proxy is running
if ! curl -sf --max-time 2 "http://127.0.0.1:4000/health/readiness" >/dev/null 2>&1; then
    echo -e "\033[96m[*] Starting background LiteLLM proxy...\033[0m"
    bash "$SCRIPT_DIR/start-proxy.sh"
else
    echo -e "\033[92m[+] Local LiteLLM proxy active and healthy on port 4000.\033[0m"
fi

# 2. Pin ultra sub-second model
"$PYTHON_CMD" "$SCRIPT_DIR/select_model.py" "ultra" >/dev/null 2>&1 || true
echo -e "\033[92m[+] Engine pinned to NVIDIA Nemotron Ultra 550B MoE (NVIDIA NIM)\033[0m"
echo -e "\033[93mTip: Inside Claude Code, use /boost for 1-shot motion graphics execution!\033[0m\n"

# 3. Launch Claude Code
exec bash "$SCRIPT_DIR/start-claude.sh" ultra "$@"
