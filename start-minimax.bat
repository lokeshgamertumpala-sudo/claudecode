@echo off
setlocal
cd /d "%~dp0"
echo ====================================================
echo   Launching Claude Code with MiniMax M3.1 Flash
echo ====================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" minimax %*
endlocal
