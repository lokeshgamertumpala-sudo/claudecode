@echo off
setlocal
echo ======================================================
echo    🛡️ SafeNest - Autonomous Prototype Launcher
echo ======================================================
echo.
cd /d "%~dp0safenest"

echo Starting lightweight local server on http://localhost:5173...
start "" "http://localhost:5173"
python -m http.server 5173
