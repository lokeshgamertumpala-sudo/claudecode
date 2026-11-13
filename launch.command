#!/usr/bin/env bash
# ==============================================================================
# 🚀 1-Click Claude Code Launcher for MacBook (macOS)
# Double-click in Finder to start Claude Code with NVIDIA NIM & Web Search
# ==============================================================================

# Ensure directory is the script's actual directory even when double-clicked in Finder
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure common macOS user binary directories and Homebrew are on PATH
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:$HOME/.local/bin:$HOME/.npm-global/bin:$PATH"

# Load NVM if present
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.nvm/nvm.sh" 2>/dev/null || true
fi

# Ensure UTF-8 locale on macOS
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8

clear
echo "================================================================"
echo "    Claude Code Enterprise Launcher for MacBook (macOS)"
echo "    Powered by NVIDIA NIM | Sub-second Latency | Multi-Model"
echo "================================================================"
echo ""

# 1. Check Python
PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
else
    echo "[-] ERROR: Python 3 was not found on your system."
    echo "    Install Python using Homebrew (brew install python) or download"
    echo "    from https://www.python.org/downloads/macos/"
    echo ""
    read -p "Press [Enter] to exit..."
    exit 1
fi

echo "[+] Python runtime: $($PYTHON_BIN --version 2>&1)"

# 2. Check Node & Claude CLI
if ! command -v claude >/dev/null 2>&1; then
    echo "[-] ERROR: Claude Code CLI ('claude') is not installed or not on PATH."
    echo "    Would you like to install it now via npm? (y/n)"
    read -r install_claude
    if [ "$install_claude" = "y" ] || [ "$install_claude" = "Y" ]; then
        if ! command -v npm >/dev/null 2>&1; then
            echo "[-] Node.js / npm not found. Please install Node.js 18+ from https://nodejs.org"
            read -p "Press [Enter] to exit..."
            exit 1
        fi
        npm install -g @anthropic-ai/claude-code
    else
        echo "Please install Claude Code with: npm install -g @anthropic-ai/claude-code"
        read -p "Press [Enter] to exit..."
        exit 1
    fi
fi

echo "[+] Claude Code CLI found: $(command -v claude)"

# 3. Environment & NVIDIA API Key Check
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    if [ -f "$SCRIPT_DIR/.env.example" ]; then
        echo "[!] No .env file found. Creating from .env.example..."
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
    fi
fi

if [ -f "$SCRIPT_DIR/.env" ]; then
    # shellcheck disable=SC2046
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

if [ -z "$NVIDIA_API_KEY" ] || [ "$NVIDIA_API_KEY" = "nvapi-your-actual-api-key-here" ] || [ "$NVIDIA_API_KEY" = "your_nvidia_api_key_here" ]; then
    echo ""
    echo "================================================================"
    echo "  NVIDIA API Key Required"
    echo "================================================================"
    echo "Get your free API key at: https://build.nvidia.com"
    echo ""
    read -r -p "Please paste your NVIDIA API key (starts with nvapi-): " user_key
    if [ -n "$user_key" ]; then
        export NVIDIA_API_KEY="$user_key"
        echo "NVIDIA_API_KEY=$user_key" > "$SCRIPT_DIR/.env"
        echo "[+] API key saved to .env file."
    else
        echo "[-] ERROR: No API key provided. Cannot route to NVIDIA NIM."
        read -p "Press [Enter] to exit..."
        exit 1
    fi
fi

# 4. Check & Install Python Dependencies
if ! $PYTHON_BIN -c "import litellm, yaml, fastapi, uvicorn" >/dev/null 2>&1; then
    echo "[*] Installing missing dependencies from requirements.txt..."
    $PYTHON_BIN -m pip install -r "$SCRIPT_DIR/requirements.txt"
fi

# 5. Ensure LiteLLM Proxy is Running
PORT=4000
if ! curl -s --max-time 1 "http://127.0.0.1:$PORT/health/readiness" | grep -q "healthy"; then
    echo "[*] Local proxy is not running. Starting background proxy on port $PORT..."
    bash "$SCRIPT_DIR/start-proxy.sh"
    
    # Wait for proxy
    PROXY_UP=0
    for i in {1..20}; do
        if curl -s --max-time 1 "http://127.0.0.1:$PORT/health/readiness" | grep -q "healthy"; then
            PROXY_UP=1
            break
        fi
        sleep 0.5
    done

    if [ $PROXY_UP -eq 1 ]; then
        echo "[+] Proxy daemon healthy and ready on http://127.0.0.1:$PORT"
    else
        echo "[-] WARNING: Proxy took longer than expected to become ready."
        echo "    Check logs at $SCRIPT_DIR/proxy-stdout.log"
    fi
else
    echo "[+] Proxy daemon already running on port $PORT (healthy)"
fi

# 6. Active Model Identification
ACTIVE_MODEL="auto"
if [ -f "$SCRIPT_DIR/active_model.txt" ]; then
    ACTIVE_MODEL="$(tr '[:upper:]' '[:lower:]' < "$SCRIPT_DIR/active_model.txt" | xargs)"
fi

# 7. Configure Claude Code Environment Variables
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

# Web search & web fetch routing
export CLAUDE_CODE_WEBSEARCH_USE_CCR_PROXY="1"
export CLAUDE_CODE_WEBFETCH_USE_CCR_PROXY="1"
export CLAUDE_CODE_SESSION_ID="session_local_worker"

echo ""
echo "================================================================"
echo "  Claude Code Starting..."
echo "  Model Engine : NVIDIA NIM (Active: $ACTIVE_MODEL)"
echo "  Proxy URL    : http://127.0.0.1:$PORT"
echo "  Web Search   : Active (Dual DuckDuckGo + Wikipedia Proxy)"
echo "================================================================"
echo ""

# Launch Claude Code (pass any arguments given)
claude --model "$TARGET_MODEL" "$@"
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "[-] Claude Code exited with code $EXIT_CODE"
    read -p "Press [Enter] to close..."
fi
