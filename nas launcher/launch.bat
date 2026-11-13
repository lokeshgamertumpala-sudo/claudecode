@echo off
title StellarForge AI - NASA Space Apps Challenge
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           STELLARFORGE AI - SATELLITE DESIGN VALIDATOR       ║
echo ║              NASA Space Apps Challenge 2024/2025             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version

REM Check if .env exists
if not exist .env (
    echo [INFO] Creating .env from .env.example...
    copy .env.example .env >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARN] .env.example not found, creating default .env
        echo NIM_URL=http://127.0.0.1:4000 > .env
        echo NIM_API_KEY= >> .env
        echo NIM_MODEL=nvidia/nemotron-3-ultra >> .env
        echo PORT=3000 >> .env
    )
)

REM Install dependencies if node_modules missing
if not exist node_modules (
    echo [INFO] Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Starting StellarForge AI server...
echo [INFO] Server will be available at http://localhost:3000
echo [INFO] Press Ctrl+C to stop
echo.

npm start