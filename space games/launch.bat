@echo off
title ORBITFORGE AI - Space Mission Design Platform
color 0A

echo.
echo  ██████╗ ██████╗ ███████╗███████╗██████╗ ███████╗███████╗██████╗ ███████╗██████╗
echo  ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗
echo  ██████╔╝██████╔╝█████╗  ███████╗██████╔╝███████╗█████╗  ██████╔╝█████╗  ██████╔╝
echo  ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║██╔═══╝ ╚════██║██╔══╝  ██╔══██╗██╔══╝  ██╔══██╗
echo  ██║     ██║  ██║███████╗███████║██║     ███████║███████╗██║  ██║███████╗██║  ██║
echo  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo  AI-Assisted Space Mission Design & Engineering Simulation Platform
echo  Powered by NVIDIA Nemotron Ultra 550B MoE via NIM Enterprise Inference
echo.
echo ================================================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version

echo.
echo [INFO] Checking project dependencies...
if not exist "node_modules" (
    echo [INFO] Installing dependencies (this may take a minute)...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Dependencies already installed.
)

echo.
echo [INFO] Checking for .env file...
if not exist ".env" (
    echo [WARN] No .env file found. Creating from .env.example...
    copy .env.example .env >nul
    echo [INFO] Please edit .env and add your NVIDIA_API_KEY for AI features.
    echo.
)

echo [INFO] Starting ORBITFORGE AI development servers...
echo.
echo ================================================================================
echo  Dashboard:     http://localhost:5173
echo  API Server:    http://localhost:3001
echo  Health Check:  http://localhost:3001/api/health
echo ================================================================================
echo.
echo Press Ctrl+C to stop all servers.
echo.

REM Start both client and server concurrently
npm run dev

pause