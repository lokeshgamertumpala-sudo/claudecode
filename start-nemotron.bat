@echo off
echo ====================================================
echo   Launching Claude Code with NVIDIA Nemotron 120B
echo ====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" nemotron %*
