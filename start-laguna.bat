@echo off
echo ====================================================
echo   Launching Claude Code with Poolside Laguna XS 2.1
echo ====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" laguna %*
