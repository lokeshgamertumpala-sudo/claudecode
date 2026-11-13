@echo off
setlocal enabledelayedexpansion

title Claude Code Token Telemetry Dashboard
echo ========================================================
echo    CLAUDE CODE TOKEN TELEMETRY DASHBOARD LAUNCHER
echo    Port: 4050 ^| Background Server & Standalone Browser
echo ========================================================

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: 1. Check Python availability
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Python was not found in PATH. Opening offline standalone dashboard...
    start index.html
    exit /b 0
)

:: 2. Terminate any previous process listening specifically on port 4050
echo [*] Checking port 4050 availability...
powershell -NoProfile -Command "try { $conns = Get-NetTCPConnection -LocalPort 4050 -ErrorAction SilentlyContinue; if ($conns) { $conns | ForEach-Object { $p = $_.OwningProcess; if ($p -gt 0) { Write-Host \"[*] Terminating existing process on port 4050 (PID $p)...\"; cmd.exe /c \"taskkill /F /T /PID $p\" 2>$null } } } } catch {}"

:: 3. Launch server.py in background minimized window
echo [*] Starting Python Token Telemetry Server (server.py) on port 4050...
start /min "Claude Code Token Server" python server.py

:: 4. Readiness Probe Loop
echo [*] Waiting for server readiness at http://127.0.0.1:4050/api/stats...
set "READY=0"
for /l %%i in (1, 1, 20) do (
    curl -sf --max-time 1 http://127.0.0.1:4050/api/stats >nul 2>&1
    if !errorlevel! EQU 0 (
        set "READY=1"
        goto :server_ready
    )
    timeout /t 1 /nobreak >nul 2>&1
)

:server_ready
if "%READY%"=="1" (
    echo [+] Server is LIVE and healthy on http://localhost:4050!
    echo [*] Launching dashboard in default browser...
    start http://localhost:4050
    echo ========================================================
    echo    Dashboard running at: http://localhost:4050
    echo    (To stop the server, close the minimized server window)
    echo ========================================================
) else (
    echo [WARN] Server did not respond within 20s. Opening index.html in offline mode...
    start index.html
)

timeout /t 2 /nobreak >nul 2>&1
endlocal
