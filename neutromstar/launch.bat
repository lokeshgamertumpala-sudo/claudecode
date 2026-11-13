@echo off
title Neutromstar - Interactive Solar System Explorer
echo Starting Neutromstar Solar System Explorer...
echo.

where python >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python server with live reload...
    python server.py
    goto :eof
)

where node >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Node.js http-server...
    npx http-server -p 8080 -o
    goto :eof
)

echo No Python or Node found. Opening file directly (limited functionality)...
start "" "index.html"
pause