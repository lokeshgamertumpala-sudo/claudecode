@echo off
echo ====================================================
echo   Launching Claude Code with DeepSeek V4.1 Flash
echo ====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" deepseek %*
