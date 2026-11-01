@echo off
echo ====================================================
echo   Launching Claude Code with Moonshot AI Kimi-K3
echo ====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" kimi %*
