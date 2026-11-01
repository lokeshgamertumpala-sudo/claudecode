@echo off
setlocal
cd /d "%~dp0"
echo ====================================================
echo   Launching Claude Code with Meta Llama 3.3 70B
echo ====================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" llama %*
endlocal
