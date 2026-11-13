@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0status-proxy.ps1" %*
if "%1" NEQ "--no-pause" (
    if "%ANTIGRAVITY_AGENT%"=="" pause
)
endlocal
