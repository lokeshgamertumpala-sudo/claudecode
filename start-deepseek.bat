@echo off
echo ====================================================
echo   Launching Claude Code with DeepSeek V4
echo ====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" deepseek %*
