#!/usr/bin/env bash
# macOS 1-Click Finder Launcher (Double-clickable)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/launch.command" "$@"
