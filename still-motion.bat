@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0motion-studio"

set "COMP_ID=%~1"
set "FRAME=%~2"
set "OUT_FILE=%~3"

if "%FRAME%"=="" set "FRAME=30"
if "%OUT_FILE%"=="" set "OUT_FILE=out/%COMP_ID%-f%FRAME%.png"

if "%COMP_ID%"=="" (
    echo [!] Missing composition ID.
    echo Usage: still-motion.bat [CompositionId] [FrameNumber] [OutputFile]
    echo Example: still-motion.bat EarthRotation 60 out/earth-frame60.png
    exit /b 1
)

:: Normalize aliases
if /i "%COMP_ID%"=="minimal" set "COMP_ID=MinimalMotion"
if /i "%COMP_ID%"=="minimalmotion" set "COMP_ID=MinimalMotion"
if /i "%COMP_ID%"=="minimal-motion" set "COMP_ID=MinimalMotion"
if /i "%COMP_ID%"=="earth" set "COMP_ID=EarthRotation"
if /i "%COMP_ID%"=="earthrotation" set "COMP_ID=EarthRotation"
if /i "%COMP_ID%"=="earth-rotation" set "COMP_ID=EarthRotation"
if /i "%COMP_ID%"=="goodmorning" set "COMP_ID=GoodMorning"
if /i "%COMP_ID%"=="good-morning" set "COMP_ID=GoodMorning"
if /i "%COMP_ID%"=="higreeting" set "COMP_ID=HiGreeting"
if /i "%COMP_ID%"=="hi-greeting" set "COMP_ID=HiGreeting"

:: Strip redundant motion-studio/ prefix if passed
if "!OUT_FILE:~0,14!"=="motion-studio/" set "OUT_FILE=!OUT_FILE:~14!"
if "!OUT_FILE:~0,14!"=="motion-studio\" set "OUT_FILE=!OUT_FILE:~14!"

if not exist "out" mkdir "out"

echo ====================================================
echo   Rendering Single Still Frame: %COMP_ID%
echo   Frame: %FRAME% ^| Output: %OUT_FILE%
echo ====================================================

call npx remotion still src/index.ts "%COMP_ID%" "%OUT_FILE%" --frame=%FRAME%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Still frame rendered: motion-studio\%OUT_FILE%
    exit /b 0
) else (
    echo.
    echo [ERROR] Still render failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
