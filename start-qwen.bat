@echo off
setlocal
cd /d "%~dp0"
echo ====================================================
echo   Launching Claude Code with Qwen 2.5 72B Instruct
echo ====================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" qwen %*
endlocal
