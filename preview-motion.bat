@echo off
setlocal
cd /d "%~dp0motion-studio"

echo ====================================================
echo   Remotion React Motion Graphics Studio (60 FPS)
echo ====================================================
echo   Port: 3100 (Clean dedicated port - zero conflict)
echo   URL:  http://localhost:3100
echo ====================================================

:: Guard against stale port 3100 listeners
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3100 ^| findstr LISTENING 2^>nul') do (
    if "%%a" neq "0" (
        echo [*] Cleaning stale process on port 3100 (PID: %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

start http://localhost:3100
call npx remotion preview src/index.ts --port 3100
