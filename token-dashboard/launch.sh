#!/usr/bin/env bash
# Claude Code Token Telemetry Dashboard Launcher (POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo "[WARN] Python was not found in PATH. Opening offline standalone dashboard..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$SCRIPT_DIR/index.html" >/dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
        open "$SCRIPT_DIR/index.html" >/dev/null 2>&1 &
    fi
    exit 0
fi

echo -e "\033[96m========================================================\033[0m"
echo -e "\033[96m   CLAUDE CODE TOKEN TELEMETRY DASHBOARD LAUNCHER       \033[0m"
echo -e "\033[90m   Port: 4050 | Background Server & Standalone Browser  \033[0m"
echo -e "\033[96m========================================================\033[0m"

# 1. Terminate any previous process specifically on port 4050
PORT=4050
PID=$(lsof -ti :$PORT 2>/dev/null || fuser $PORT/tcp 2>/dev/null || true)
if [ -n "$PID" ]; then
    echo -e "\033[93m[*] Terminating existing server on port $PORT (PID $PID)...\033[0m"
    kill -9 $PID 2>/dev/null || true
    sleep 1
fi

# 2. Launch server.py in background with log redirection
echo -e "\033[96m[*] Starting Python server on port $PORT...\033[0m"
nohup "$PYTHON_CMD" "$SCRIPT_DIR/server.py" > "$SCRIPT_DIR/server.log" 2>&1 &
SERVER_PID=$!
echo -e "\033[92m[+] Server process spawned (PID $SERVER_PID).\033[0m"

# 3. Wait for readiness probe
READY=0
for i in {1..20}; do
    if curl -sf --max-time 1 "http://127.0.0.1:$PORT/api/stats" >/dev/null 2>&1; then
        READY=1
        break
    fi
    sleep 0.5
done

if [ "$READY" -eq 1 ]; then
    echo -e "\033[92m[+] Server ready at http://localhost:$PORT\033[0m"
    echo -e "\033[96m[*] Launching default browser...\033[0m"
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:$PORT" >/dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
        open "http://localhost:$PORT" >/dev/null 2>&1 &
    elif command -v explorer.exe >/dev/null 2>&1; then
        explorer.exe "http://localhost:$PORT" >/dev/null 2>&1 &
    else
        echo -e "\033[93m[i] Open your browser and navigate to: http://localhost:$PORT\033[0m"
    fi
else
    echo -e "\033[91m[WARN] Server failed readiness check. Opening offline index.html...\033[0m"
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$SCRIPT_DIR/index.html" >/dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
        open "$SCRIPT_DIR/index.html" >/dev/null 2>&1 &
    fi
fi
