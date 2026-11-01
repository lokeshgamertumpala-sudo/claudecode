#!/usr/bin/env bash
# Launch Claude Code with DeepSeek V3 (macOS / Linux / POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m  Launching Claude Code with DeepSeek V3 (671B MoE) \033[0m"
echo -e "\033[96m====================================================\033[0m"

exec bash "$SCRIPT_DIR/start-claude.sh" v3 "$@"
