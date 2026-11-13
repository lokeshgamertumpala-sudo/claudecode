@echo off
REM NVIDIA Multi-Model Motion Graphics System Launcher
REM Sets up environment and runs the main CLI

echo ==========================================
echo NVIDIA Multi-Model Motion Graphics System
echo ==========================================
echo.

REM Load environment variables
if exist .env (
    echo Loading environment from .env...
    for /f "tokens=1,* delims==" %%a in (.env) do (
        set %%a=%%b
    )
) else (
    echo WARNING: .env not found. Copy .env.example to .env and add your API key.
)

REM Verify NVIDIA_API_KEY
if "%NVIDIA_API_KEY%"=="" (
    echo ERROR: NVIDIA_API_KEY not set!
    echo Please edit .env and add your NVIDIA API key from https://build.nvidia.com
    pause
    exit /b 1
)

echo NVIDIA_API_KEY: %NVIDIA_API_KEY:~0,10%...
echo.

REM Run the CLI with passed arguments
python main.py %*

pause