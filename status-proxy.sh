#!/usr/bin/env bash
# Check Status of LiteLLM Proxy Daemon (macOS / Linux / POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT=4000

echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m   LiteLLM Proxy Service Status (macOS & Windows)   \033[0m"
echo -e "\033[96m====================================================\033[0m"

OWNING_PID=""
if command -v lsof >/dev/null 2>&1; then
    OWNING_PID=$(lsof -ti :${PORT} 2>/dev/null || true)
fi
if [ -z "$OWNING_PID" ] && command -v netstat >/dev/null 2>&1; then
    OWNING_PID=$(netstat -ano 2>/dev/null | grep ":${PORT} " | grep "LISTENING" | awk '{print $5}' | head -n 1 || true)
fi

HEALTHY=0
LATENCY_MS=""

if curl -sf --max-time 3 "http://127.0.0.1:${PORT}/health/readiness" >/dev/null 2>&1; then
    HEALTHY=1
    START=$(python3 -c "import time; print(int(time.time() * 1000))" 2>/dev/null || python -c "import time; print(int(time.time() * 1000))" 2>/dev/null || echo 0)
    curl -sf "http://127.0.0.1:${PORT}/health/readiness" >/dev/null 2>&1
    END=$(python3 -c "import time; print(int(time.time() * 1000))" 2>/dev/null || python -c "import time; print(int(time.time() * 1000))" 2>/dev/null || echo 0)
    LATENCY_MS=$((END - START))
fi

MODEL="Mistral Large 4 (mistralai/mistral-large-4-1t-a52b) [Default]"
if [ -f "active_model.txt" ]; then
    M_RAW="$(cat active_model.txt | tr -d '\r\n')"
    if [ -n "$M_RAW" ]; then
        MODEL="$M_RAW"
    fi
fi

if [ "$HEALTHY" -eq 1 ]; then
    echo -e "Proxy Status : \033[92mHEALTHY & READY\033[0m"
    echo -e "Endpoint     : \033[90mhttp://127.0.0.1:${PORT}\033[0m"
    if [ -n "$OWNING_PID" ]; then
        echo -e "Process PID  : \033[90m${OWNING_PID}\033[0m"
    fi
    echo -e "Readiness    : \033[92m${LATENCY_MS:-<5}ms response time\033[0m"
else
    echo -e "Proxy Status : \033[91mSTOPPED / UNHEALTHY\033[0m"
fi

echo -e "Active Model : \033[96m${MODEL}\033[0m"
echo -e "\033[96m====================================================\033[0m"

if [ "$HEALTHY" -eq 1 ]; then
    exit 0
else
    exit 1
fi
