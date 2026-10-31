@echo off
setlocal
cd /d "%~dp0"
echo ====================================================
echo   Starting Detached Persistent LiteLLM Proxy Daemon
echo ====================================================
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-proxy.ps1" %*
if "%1" NEQ "--no-pause" (
    if "%ANTIGRAVITY_AGENT%"=="" pause
)
endlocal
