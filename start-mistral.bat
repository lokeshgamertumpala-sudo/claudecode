@echo off
setlocal
cd /d "%~dp0"
echo ====================================================
echo   Launching Claude Code with Mistral Large 4 (Default)
echo ====================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" mistral %*
endlocal
