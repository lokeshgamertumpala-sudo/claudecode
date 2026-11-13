@echo off
setlocal
cd /d "%~dp0"
echo ====================================================
echo   Launching Claude Code with Step 5 Preview (600B MoE)
echo ====================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" step %*
endlocal
