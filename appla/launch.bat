@echo off
title STELLAR - Space Exploration Website
color 0A
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                    🚀 STELLAR LAUNCHER 🚀                    ║
echo  ║              Space Exploration Website v1.0                  ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  Starting local server...
echo.

cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  [OK] Python found - starting HTTP server on port 8080
    echo  [INFO] Opening http://localhost:8080 in your default browser
    echo.
    start "" "http://localhost:8080"
    python -m http.server 8080
    goto :eof
)

REM Check if Node.js/http-server is available
npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  [OK] Node.js found - starting http-server on port 8080
    echo  [INFO] Opening http://localhost:8080 in your default browser
    echo.
    start "" "http://localhost:8080"
    npx http-server -p 8080 -c-1
    goto :eof
)

REM Check if PHP is available
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  [OK] PHP found - starting built-in server on port 8080
    echo  [INFO] Opening http://localhost:8080 in your default browser
    echo.
    start "" "http://localhost:8080"
    php -S localhost:8080
    goto :eof
)

REM Fallback: Open directly in browser (file:// protocol)
echo  [WARN] No local server found - opening file directly
echo  [INFO] Some features (live ISS data, external APIs) may not work via file://
echo.
start "" "index.html"

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║  To enable all features, install Python or Node.js and       ║
echo  ║  re-run this launcher.                                       ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
pause