#!/usr/bin/env bash
# Claude Code -> NVIDIA NIM Enterprise Launcher (macOS / Linux / POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODEL="${1:-}"
PORT=4000

# 1. Detect Python 3
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python 3 not found. Please install Python 3." >&2
    exit 1
fi

# Help flag
if [ "$MODEL" = "-h" ] || [ "$MODEL" = "--help" ] || [ "$MODEL" = "help" ]; then
    echo -e "\033[96m====================================================\033[0m"
    echo -e "\033[96m   Claude Code -> NVIDIA NIM Launcher Help (macOS)  \033[0m"
    echo -e "\033[96m====================================================\033[0m"
    echo "Usage: ./start-claude.sh [Model] [Claude flags/prompts]"
    echo ""
    echo "Models:"
    echo "  ultra    / 5  : NVIDIA Nemotron Ultra 550B MoE (Reasoning Giant) [DEFAULT]"
    echo "  mistral  / 2  : Mistral Large 4 (1.05T MoE, 52B Active, ~0.4s Latency)"
    echo "  step     / 3  : Step 5 Preview (600B MoE, 1M Context Window, Multimodal)"
    echo "  minimax  / 4  : MiniMax M3.1 Flash (428B MoE, Ultra-Fast Code Specialist)"
    echo "  deepseek / 6  : DeepSeek V4.1 Flash (High-speed reasoning)"
    echo "  laguna   / 7  : Poolside Laguna XS 2.1 (Software engineering & coding specialist)"
    echo "  r1       / 8  : DeepSeek R1 (671B Frontier Open Reasoning Engine)"
    echo "  v3       / 9  : DeepSeek V3 (671B Frontier MoE Code & Language Model)"
    echo "  llama    / 10 : Meta Llama 3.3 70B Instruct (70B Open Instruction Model)"
    echo "  qwen     / 11 : Qwen 2.5 72B Instruct (72B Reasoning & Code Flagship)"
    echo "  auto     / 1  : Auto Smart-Failover (Zero API Errors resilience mesh)"
    exit 0
fi

echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m   Claude Code -> NVIDIA NIM Enterprise Inference   \033[0m"
echo -e "\033[96m====================================================\033[0m"

# 2. Load .env file
if [ -f ".env" ]; then
    while IFS='=' read -r key val || [ -n "$key" ]; do
        key=$(echo "$key" | tr -d '[:space:]')
        if [ -n "$key" ] && [ "${key#\#}" = "$key" ]; then
            val=$(echo "$val" | tr -d '\r')
            export "$key=$val"
        fi
    done < .env
    if [ -n "$NVIDIA_API_KEY" ]; then
        export NVIDIA_NIM_API_KEY="$NVIDIA_API_KEY"
    fi
fi

# 3. Check NVIDIA API key
if [ -z "$NVIDIA_API_KEY" ]; then
    echo -e "\033[93m[!] NVIDIA API key not detected.\033[0m"
    echo "You can get an API key from https://build.nvidia.com"
    read -rsp "Enter your NVIDIA API Key (nvapi-...): " USER_KEY
    echo ""
    if [ -z "$USER_KEY" ]; then
        echo "[ERROR] No API key provided. Exiting." >&2
        exit 1
    fi
    export NVIDIA_API_KEY="$USER_KEY"
    export NVIDIA_NIM_API_KEY="$USER_KEY"
    read -rp "Save API key to .env for future sessions? (y/n) " SAVE_ENV
    case "$SAVE_ENV" in
        [Yy]*)
            echo "NVIDIA_API_KEY=$USER_KEY" > .env
            echo -e "\033[92m[+] Key saved to .env (protected by .gitignore)\033[0m"
            ;;
    esac
fi

# 4. Check if proxy is already running on port 4000
if ! curl -sf --max-time 2 "http://127.0.0.1:${PORT}/health/readiness" >/dev/null 2>&1; then
    echo -e "\033[96m[*] LiteLLM proxy not running. Spawning background supervisor...\033[0m"
    bash "$SCRIPT_DIR/start-proxy.sh"
else
    echo -e "\033[92m[+] LiteLLM proxy is already running and healthy on port ${PORT}.\033[0m"
fi

# 5. Resolve or switch active model preference
VALID_TRIGGERS=("1" "2" "3" "4" "5" "6" "7" "8" "9" "10" "11" "auto" "smart" "mistral" "mistral-large" "mistral-large-4" "step" "step-5" "minimax" "ultra" "nemotron" "deepseek" "flash" "laguna" "poolside" "r1" "deepseek-r1" "v3" "deepseek-v3" "llama" "llama-3.3" "llama-3.3-70b" "qwen" "qwen-72b" "qwen-2.5-72b" "boost" "turbo")

PROMPT_PARAM=""
if [ -n "$MODEL" ]; then
    MODEL_LOWER=$(echo "$MODEL" | tr '[:upper:]' '[:lower:]')
    MATCH=0
    for trig in "${VALID_TRIGGERS[@]}"; do
        if [ "$MODEL_LOWER" = "$trig" ]; then
            MATCH=1
            break
        fi
    done
    if [ "$MATCH" -eq 1 ]; then
        "$PYTHON_CMD" "$SCRIPT_DIR/select_model.py" "$MODEL" >/dev/null 2>&1 || true
        shift
    else
        PROMPT_PARAM="$MODEL"
        shift
    fi
fi

ACTIVE_MODEL="mistralai/mistral-large-4-1t-a52b"
if [ -f "active_model.txt" ]; then
    M_RAW="$(cat active_model.txt | tr -d '\r\n')"
    if [ -n "$M_RAW" ]; then
        ACTIVE_MODEL="$M_RAW"
    fi
fi

# Ensure Claude Code settings are synced
"$PYTHON_CMD" "$SCRIPT_DIR/select_model.py" "$ACTIVE_MODEL" >/dev/null 2>&1 || true

# 6. Locate Claude Code executable
CLAUDE_CMD=""
if command -v claude >/dev/null 2>&1; then
    CLAUDE_CMD="claude"
elif [ -x "/opt/homebrew/bin/claude" ]; then
    CLAUDE_CMD="/opt/homebrew/bin/claude"
elif [ -x "/usr/local/bin/claude" ]; then
    CLAUDE_CMD="/usr/local/bin/claude"
elif [ -x "$HOME/.npm-global/bin/claude" ]; then
    CLAUDE_CMD="$HOME/.npm-global/bin/claude"
else
    CLAUDE_CMD="npx -y @anthropic-ai/claude-code"
fi

# 7. Export Claude Code environment variables
export ANTHROPIC_BASE_URL="http://127.0.0.1:${PORT}"
export ANTHROPIC_API_KEY="sk-litellm-proxy-key"
unset ANTHROPIC_AUTH_TOKEN 2>/dev/null || true
export ANTHROPIC_MODEL="claude-sonnet-5"
export ANTHROPIC_DEFAULT_SONNET_MODEL="claude-sonnet-5"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="claude-sonnet-5"
export ANTHROPIC_DEFAULT_OPUS_MODEL="claude-sonnet-5"
export ANTHROPIC_CUSTOM_MODEL_OPTION="claude-sonnet-5"
export ANTHROPIC_CUSTOM_MODEL_OPTION_NAME="$ACTIVE_MODEL"
export ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION="$ACTIVE_MODEL via local NIM proxy"
export CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT="1"
unset CLAUDE_CODE_EFFORT_LEVEL 2>/dev/null || true
export CLAUDE_CODE_WORKFLOWS="1"
export MAX_THINKING_TOKENS="2048"
export ANTHROPIC_MAX_TOKENS="8192"
export CLAUDE_CODE_MAX_OUTPUT_TOKENS="8192"
export CLAUDE_ENABLE_STREAM_WATCHDOG="0"
export CLAUDE_ENABLE_BYTE_WATCHDOG="0"
export CLAUDE_STREAM_IDLE_TIMEOUT_MS="1800000"
export CLAUDE_BYTE_STREAM_IDLE_TIMEOUT_MS="1800000"
export CLAUDE_STREAM_FIRST_BYTE_TIMEOUT_MS="600000"
export CLAUDE_CODE_DISABLE_THINKING_LIMIT="1"
export CLAUDE_CODE_WEBSEARCH_USE_CCR_PROXY="1"
export CLAUDE_CODE_WEBFETCH_USE_CCR_PROXY="1"

echo -e "\033[92mLaunching Claude Code [FULL POWER MAXIMUM] (${ACTIVE_MODEL})...\033[0m"
echo -e "\033[90mEngine: ${ACTIVE_MODEL} on NVIDIA NIM\033[0m"
echo -e "\033[95mWorkflows: ENABLED (Dynamic multi-agent orchestration)\033[0m"
echo -e "\033[90mStreaming: 100% Active (Native Thinking & Real-Time Seconds Timer)\033[0m"
echo -e "\033[96m====================================================\033[0m\n"

CLAUDE_ARGS=("--model" "claude-sonnet-5" "--dangerously-skip-permissions")
if [ -n "$PROMPT_PARAM" ]; then
    CLAUDE_ARGS+=("$PROMPT_PARAM")
fi
if [ "$#" -gt 0 ]; then
    CLAUDE_ARGS+=("$@")
fi

exec $CLAUDE_CMD "${CLAUDE_ARGS[@]}"
