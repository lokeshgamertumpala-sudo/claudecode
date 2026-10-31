@echo off
setlocal
cd /d "%~dp0"
echo ====================================================
echo   Launching Claude Code with Nemotron Ultra 550B MoE
echo ====================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" ultra %*
endlocal
