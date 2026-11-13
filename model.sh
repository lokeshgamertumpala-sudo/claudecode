#!/usr/bin/env bash
# ==============================================================================
# Model Switcher CLI for macOS & Linux
# Usage: ./model.sh [nemotron|laguna|deepseek|kimi|auto]
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_CMD="python3"
if ! command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python"
fi

exec $PYTHON_CMD "$SCRIPT_DIR/select_model.py" "$@"
