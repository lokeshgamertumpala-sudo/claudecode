: << 'BATCH_SCRIPT'
@echo off
setlocal
echo ================================================================
echo    Claude Code -> NVIDIA NIM 1-Click Launcher (Windows / macOS)
echo ================================================================
echo.
call "%~dp0start-claude.bat" %*
exit /b %errorlevel%
BATCH_SCRIPT

# ==============================================================================
# 🚀 1-Click Claude Code Launcher for MacBook (macOS) & Linux
# Run via: bash launch.bat OR ./launch.command
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/launch.command" "$@"
