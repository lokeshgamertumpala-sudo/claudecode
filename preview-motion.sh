#!/usr/bin/env bash
# Launch Remotion React Motion Graphics Studio on Port 3100 (macOS / Linux / Windows)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STUDIO_DIR="$SCRIPT_DIR/motion-studio"
cd "$STUDIO_DIR"

PORT=3100
URL="http://localhost:${PORT}"

echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m   Remotion React Motion Graphics Studio (60 FPS)   \033[0m"
echo -e "\033[96m====================================================\033[0m"
echo -e "   Port: ${PORT} (Clean dedicated port - zero conflict)"
echo -e "   URL:  ${URL}"
echo -e "\033[96m====================================================\033[0m"

# 1. Guard against stale port 3100 listeners (macOS / Linux / Windows)
if command -v lsof >/dev/null 2>&1; then
    STALE_PIDS=$(lsof -ti :${PORT} 2>/dev/null || true)
    if [ -n "$STALE_PIDS" ]; then
        echo -e "\033[93m[*] Cleaning stale process on port ${PORT} (PID: ${STALE_PIDS})...\033[0m"
        echo "$STALE_PIDS" | xargs kill -9 2>/dev/null || true
        sleep 0.5
    fi
fi
if command -v netstat >/dev/null 2>&1 && command -v taskkill >/dev/null 2>&1; then
    for pid in $(netstat -ano 2>/dev/null | grep ":${PORT} " | grep "LISTENING" | awk '{print $5}'); do
        if [ -n "$pid" ] && [ "$pid" != "0" ]; then
            echo -e "\033[93m[*] Cleaning stale Windows process on port ${PORT} (PID: ${pid})...\033[0m"
            taskkill //F //PID "$pid" >/dev/null 2>&1 || true
        fi
    done
fi

# 2. Open browser once preview server is listening (background listener)
OS_NAME="$(uname -s)"
(
    # Wait up to 10s for preview server to be responsive
    for i in {1..20}; do
        if curl -sf --max-time 1 "http://localhost:${PORT}" >/dev/null 2>&1; then
            break
        fi
        sleep 0.5
    done
    case "${OS_NAME}" in
        Darwin*)
            open "$URL" >/dev/null 2>&1 || true
            ;;
        Linux*)
            if command -v xdg-open >/dev/null 2>&1; then
                xdg-open "$URL" >/dev/null 2>&1 || true
            fi
            ;;
        CYGWIN*|MINGW*|MSYS*)
            start "$URL" >/dev/null 2>&1 || explorer "$URL" >/dev/null 2>&1 || true
            ;;
    esac
) &

# 3. Launch Remotion Studio
exec npx remotion preview src/index.ts --port ${PORT}
