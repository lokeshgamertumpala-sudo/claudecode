#!/usr/bin/env bash
# macOS & Linux Terminal Launcher
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/launch.command" "$@"
