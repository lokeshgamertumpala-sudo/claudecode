@echo off
setlocal
cd /d "%~dp0"
echo ====================================================
echo   Launching Claude Code with DeepSeek R1 (671B MoE)
echo ====================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" r1 %*
endlocal
