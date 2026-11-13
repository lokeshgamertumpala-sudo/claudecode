#!/usr/bin/env bash
# Universal Zero-Error Integrity Check (macOS / Linux / POSIX)
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

echo -e "\033[96m======================================================\033[0m"
echo -e "\033[96m   🛡️ Running Universal Zero-Error Integrity Check   \033[0m"
echo -e "\033[96m======================================================\033[0m"

"$PYTHON_CMD" .agents/skills/zero-error-architect/scripts/universal_verifier.py "$@"
