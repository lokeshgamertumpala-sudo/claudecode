#!/usr/bin/env bash
# Start the LiteLLM Proxy Daemon detached in the background (macOS / Linux / POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT=4000

# 1. Detect Python 3
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python 3 is required. Please install python3." >&2
    exit 1
fi

# 2. Check if proxy is already healthy
if curl -sf --max-time 2 "http://127.0.0.1:${PORT}/health/readiness" >/dev/null 2>&1; then
    echo -e "\033[92m[+] LiteLLM proxy is already running and healthy on port ${PORT}.\033[0m"
    if [ -f "active_model.txt" ]; then
        MODEL="$(cat active_model.txt | tr -d '\r\n')"
        echo -e "\033[96m[+] Active Model: ${MODEL:-Mistral Large 4}\033[0m"
    fi
    exit 0
fi

# 3. Load .env if present
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

if [ -z "$NVIDIA_API_KEY" ]; then
    echo -e "\033[93m[!] NVIDIA API key not detected in environment or .env.\033[0m"
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

# 4. Locate LiteLLM
LITELLM_CMD=""
if command -v litellm >/dev/null 2>&1; then
    LITELLM_CMD="litellm"
elif [ -x "$HOME/.local/bin/litellm" ]; then
    LITELLM_CMD="$HOME/.local/bin/litellm"
elif [ -x "/opt/homebrew/bin/litellm" ]; then
    LITELLM_CMD="/opt/homebrew/bin/litellm"
elif [ -x "/usr/local/bin/litellm" ]; then
    LITELLM_CMD="/usr/local/bin/litellm"
elif $PYTHON_CMD -c "import litellm" >/dev/null 2>&1; then
    LITELLM_CMD="$PYTHON_CMD -m litellm"
fi

if [ -z "$LITELLM_CMD" ]; then
    echo -e "\033[91m[ERROR] LiteLLM executable not found.\033[0m" >&2
    echo "Install with: pip install 'litellm[proxy]'" >&2
    exit 1
fi

echo -e "\033[96m[*] Starting LiteLLM proxy daemon in background on port ${PORT}...\033[0m"

# Clean any dead process binding port 4000 (macOS / Linux / Windows)
if command -v lsof >/dev/null 2>&1; then
    DEAD_PIDS=$(lsof -ti :${PORT} 2>/dev/null || true)
    if [ -n "$DEAD_PIDS" ]; then
        echo "$DEAD_PIDS" | xargs kill -9 2>/dev/null || true
        sleep 0.5
    fi
fi
if command -v netstat >/dev/null 2>&1 && command -v taskkill >/dev/null 2>&1; then
    for pid in $(netstat -ano 2>/dev/null | grep ":${PORT} " | grep "LISTENING" | awk '{print $5}'); do
        if [ -n "$pid" ] && [ "$pid" != "0" ]; then
            taskkill //F //PID "$pid" >/dev/null 2>&1 || true
        fi
    done
fi

# Launch detached daemon
nohup $LITELLM_CMD --config config.yaml --port ${PORT} --request_timeout 1800 --keepalive_timeout 1800 > proxy-stdout.log 2> proxy-stderr.log &
PROXY_PID=$!
disown $PROXY_PID 2>/dev/null || true

# 5. Wait for readiness
READY=0
echo -n "Verifying proxy readiness"
for i in {1..30}; do
    if curl -sf --max-time 1 "http://127.0.0.1:${PORT}/health/readiness" >/dev/null 2>&1; then
        READY=1
        break
    fi
    echo -n "."
    sleep 0.5
done
echo ""

if [ "$READY" -eq 1 ]; then
    echo -e "\033[92m[+] Proxy is running independently in the background on port ${PORT}!\033[0m"
    echo -e "\033[92m[+] Fast health endpoint: http://127.0.0.1:${PORT}/health/readiness\033[0m"
    if [ -f "active_model.txt" ]; then
        MODEL="$(cat active_model.txt | tr -d '\r\n')"
        echo -e "\033[96m[+] Active Model: ${MODEL:-Mistral Large 4}\033[0m"
    fi
    exit 0
else
    echo -e "\033[91m[ERROR] Proxy failed to respond on port ${PORT}. Check proxy-stderr.log.\033[0m" >&2
    exit 1
fi
