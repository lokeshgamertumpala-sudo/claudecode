#!/usr/bin/env bash
# Stop the LiteLLM Proxy Daemon cleanly (macOS / Linux / POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT=4000

echo -e "\033[96m[*] Stopping Claude Code background LiteLLM proxy...\033[0m"

# 1. Kill processes on port 4000
if command -v lsof >/dev/null 2>&1; then
    PORT_PIDS=$(lsof -ti :${PORT} 2>/dev/null || true)
    if [ -n "$PORT_PIDS" ]; then
        echo "$PORT_PIDS" | xargs kill -9 2>/dev/null || true
        echo -e "\033[92m[+] Stopped process on port ${PORT} (PID: ${PORT_PIDS}).\033[0m"
    fi
fi
if command -v netstat >/dev/null 2>&1 && command -v taskkill >/dev/null 2>&1; then
    for pid in $(netstat -ano 2>/dev/null | grep ":${PORT} " | grep "LISTENING" | awk '{print $5}'); do
        if [ -n "$pid" ] && [ "$pid" != "0" ]; then
            taskkill //F //PID "$pid" >/dev/null 2>&1 || true
            echo -e "\033[92m[+] Stopped Windows process on port ${PORT} (PID: ${pid}).\033[0m"
        fi
    done
fi

# 2. Kill litellm processes
if command -v pkill >/dev/null 2>&1; then
    pkill -9 -f "litellm" 2>/dev/null || true
fi

sleep 0.5
echo -e "\033[92m[+] LiteLLM background proxy stopped cleanly.\033[0m"
