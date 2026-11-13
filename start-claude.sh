#!/usr/bin/env bash
# ==============================================================================
# Claude Code -> NVIDIA NIM Launcher for macOS (MacBook) & Linux
# High-speed Enterprise Inference with Native Web Search & Autonomous Workflows
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Help message
if [ "$1" = "-h" ] || [ "$1" = "--help" ] || [ "$1" = "help" ]; then
    echo "===================================================="
    echo "   Claude Code -> NVIDIA NIM macOS / Linux Launcher"
    echo "===================================================="
    echo "Usage: ./start-claude.sh [model] [--dangerously-skip-permissions]"
    echo ""
    echo "Models:"
    echo "  nemotron / 2 : NVIDIA Nemotron 3 Super 120B (Enterprise ~0.3s - RECOMMENDED)"
    echo "  laguna   / 3 : Poolside Laguna XS 2.1 (Software Engineering Specialist)"
    echo "  deepseek / 4 : DeepSeek V4.1 Flash (Flagship Reasoning & Context)"
    echo "  kimi     / 5 : Moonshot AI Kimi-K3 (Deep Reasoning)"
    echo "  auto     / 1 : Auto Smart-Failover (Zero API Errors)"
    echo ""
    echo "Options:"
    echo "  -u, --unrestricted : Run with --dangerously-skip-permissions (Autonomous mode)"
    exit 0
fi

# 1. Load .env
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# 2. Check Python
PYTHON_CMD="python3"
if ! command -v python3 >/dev/null 2>&1; then
    if command -v python >/dev/null 2>&1; then
        PYTHON_CMD="python"
    else
        echo "[-] ERROR: python3 or python is not installed."
        exit 1
    fi
fi

# 3. Check claude CLI
if ! command -v claude >/dev/null 2>&1; then
    echo "[-] ERROR: 'claude' CLI is not found on PATH."
    echo "    Install via: npm install -g @anthropic-ai/claude-code"
    exit 1
fi

# 4. Check & auto-start LiteLLM Proxy on port 4000
PORT=4000
if ! curl -s "http://127.0.0.1:$PORT/health/readiness" | grep -q "healthy"; then
    echo "[*] Local proxy is not running on port $PORT. Launching proxy..."
    bash "$SCRIPT_DIR/start-proxy.sh"
fi

# 5. Model Selection
REQUESTED_MODEL="$1"
UNRESTRICTED=0
EXTRA_ARGS=()

for arg in "$@"; do
    if [ "$arg" = "-u" ] || [ "$arg" = "--unrestricted" ] || [ "$arg" = "--dangerously-skip-permissions" ]; then
        UNRESTRICTED=1
    elif [ "$arg" = "$REQUESTED_MODEL" ]; then
        continue
    else
        EXTRA_ARGS+=("$arg")
    fi
done

if [ -n "$REQUESTED_MODEL" ] && [ "$REQUESTED_MODEL" != "-u" ] && [ "$REQUESTED_MODEL" != "--unrestricted" ]; then
    $PYTHON_CMD "$SCRIPT_DIR/select_model.py" "$REQUESTED_MODEL" >/dev/null 2>&1 || true
fi

ACTIVE_MODEL="auto"
if [ -f "$SCRIPT_DIR/active_model.txt" ]; then
    ACTIVE_MODEL="$(cat "$SCRIPT_DIR/active_model.txt" | tr '[:upper:]' '[:lower:]' | xargs)"
fi

# 6. Configure Claude Code Environment Variables for NIM Routing
TARGET_MODEL="claude-sonnet-5"
export ANTHROPIC_BASE_URL="http://127.0.0.1:$PORT"
export ANTHROPIC_API_KEY="sk-litellm-proxy-key"
unset ANTHROPIC_AUTH_TOKEN || true
export ANTHROPIC_MODEL="$TARGET_MODEL"
export ANTHROPIC_DEFAULT_SONNET_MODEL="$TARGET_MODEL"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="$TARGET_MODEL"
export ANTHROPIC_DEFAULT_OPUS_MODEL="$TARGET_MODEL"
export ANTHROPIC_CUSTOM_MODEL_OPTION="$TARGET_MODEL"
export ANTHROPIC_CUSTOM_MODEL_OPTION_NAME="NVIDIA Nemotron 3 Super 120B"
export ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION="NVIDIA NIM enterprise proxy inference"
export CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT="1"
unset CLAUDE_CODE_EFFORT_LEVEL || true
export CLAUDE_CODE_WORKFLOWS="1"
export MAX_THINKING_TOKENS="2048"
export ANTHROPIC_MAX_TOKENS="8192"
export CLAUDE_CODE_DISABLE_THINKING_LIMIT="1"

# Web search & web fetch routing through local proxy worker endpoints
export CLAUDE_CODE_WEBSEARCH_USE_CCR_PROXY="1"
export CLAUDE_CODE_WEBFETCH_USE_CCR_PROXY="1"
export CLAUDE_CODE_SESSION_ID="session_local_worker"

echo "===================================================="
echo "Launching Claude Code on macOS / Linux..."
echo "Engine   : NVIDIA NIM Inference (Proxy :$PORT)"
echo "Active   : $ACTIVE_MODEL"
echo "Protocol : $TARGET_MODEL"
echo "Search   : Local Multi-Engine Search Proxy (Active)"
echo "===================================================="
echo ""

CLAUDE_FLAGS=("--model" "$TARGET_MODEL")
if [ $UNRESTRICTED -eq 1 ]; then
    CLAUDE_FLAGS+=("--dangerously-skip-permissions")
fi

exec claude "${CLAUDE_FLAGS[@]}" "${EXTRA_ARGS[@]}"
