@echo off
echo ====================================================
echo   Launching Claude Code with Auto Smart-Failover
echo ====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" auto %*
