#!/usr/bin/env bash
# ==============================================================================
# LiteLLM Proxy Background Launcher for macOS & Linux
# Decoupled 24/7 Enterprise Proxy for Claude Code -> NVIDIA NIM Routing
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Load .env file
if [ -f "$SCRIPT_DIR/.env" ]; then
    echo "[*] Loading environment variables from .env..."
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

if [ -z "$NVIDIA_API_KEY" ]; then
    echo "[!] WARNING: NVIDIA_API_KEY is not set in environment or .env file."
    echo "    Please create a .env file with: NVIDIA_API_KEY=nvapi-your-key-here"
fi

export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8

PORT=4000
CONFIG_FILE="$SCRIPT_DIR/config.yaml"
LOG_FILE="$SCRIPT_DIR/proxy-stdout.log"
ERR_FILE="$SCRIPT_DIR/proxy-stderr.log"

# 2. Check if port 4000 is already active
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[+] Proxy is ALREADY running on port $PORT (PID: $(lsof -Pi :$PORT -sTCP:LISTEN -t))."
    echo "    Health check: http://127.0.0.1:$PORT/health/readiness"
    exit 0
fi

# 3. Locate litellm executable
LITELLM_CMD=""
if command -v litellm >/dev/null 2>&1; then
    LITELLM_CMD="$(command -v litellm)"
elif [ -f "$HOME/.local/bin/litellm" ]; then
    LITELLM_CMD="$HOME/.local/bin/litellm"
else
    # Fallback via python module
    if command -v python3 >/dev/null 2>&1; then
        LITELLM_CMD="python3 -m litellm"
    elif command -v python >/dev/null 2>&1; then
        LITELLM_CMD="python -m litellm"
    fi
fi

if [ -z "$LITELLM_CMD" ]; then
    echo "[-] ERROR: litellm is not installed or not on PATH."
    echo "    Run: pip install \"litellm[proxy]\""
    exit 1
fi

echo "[*] Starting LiteLLM proxy daemon on http://127.0.0.1:$PORT..."
nohup $LITELLM_CMD --config "$CONFIG_FILE" --port $PORT --host 127.0.0.1 > "$LOG_FILE" 2> "$ERR_FILE" &
PROXY_PID=$!

echo "[*] Waiting for proxy readiness..."
READY=0
for i in {1..20}; do
    sleep 0.5
    if curl -s "http://127.0.0.1:$PORT/health/readiness" | grep -q "healthy"; then
        READY=1
        break
    fi
done

if [ $READY -eq 1 ]; then
    echo "[+] Proxy started successfully in background! (PID: $PROXY_PID)"
    echo "    Readiness URL: http://127.0.0.1:$PORT/health/readiness"
    echo "    Logs: $LOG_FILE"
else
    echo "[-] Proxy started but did not respond healthy within 10s. Check logs:"
    tail -n 20 "$ERR_FILE"
    exit 1
fi
