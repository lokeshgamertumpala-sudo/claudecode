: << 'BATCH_SCRIPT'
@echo off
setlocal
echo ================================================================
echo    Claude Code -> NVIDIA NIM Launcher for MacBook / Windows
echo ================================================================
echo.
echo [!] NOTE: You are running 'launch-mac.bat' inside Windows CMD.
echo     On a MacBook (macOS):
echo     1. Double-click 'launch.command' or 'launch-mac.command' in Finder.
echo     2. OR run: ./launch.sh (or bash launch-mac.bat)
echo.
echo Launching Windows Claude Code launcher now...
echo.
call "%~dp0start-claude.bat" %*
exit /b %errorlevel%
BATCH_SCRIPT

# ==============================================================================
# 🚀 1-Click Claude Code Launcher for MacBook (macOS)
# Run via: bash launch-mac.bat OR ./launch.command
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/launch.command" "$@"
