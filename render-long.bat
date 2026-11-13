@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0motion-studio"

set "COMP_ID=%~1"
set "OUT_FILE=%~2"
set "FRAME_RANGE=%~3"

if "%COMP_ID%"=="" (
    echo ====================================================
    echo   LONG-FORM VIDEO HIGH-CAPACITY RENDERER (UP TO 1 HR)
    echo ====================================================
    echo Usage: render-long.bat [CompositionId] [OutputFile] [OptionalFrameRange]
    echo.
    echo Examples:
    echo   render-long.bat HourLongVideo out/1-hour-epic.mp4
    echo   render-long.bat HourLongPreview out/1-hour-preview.mp4
    echo   render-long.bat OpenClaudeX out/open-claudex-full.mp4
    echo   render-long.bat HourLongVideo out/test-10min.mp4 --frames=0-36000
    echo.
    echo Defaulting to: HourLongPreview out/hour-preview.mp4
    set "COMP_ID=HourLongPreview"
    set "OUT_FILE=out/hour-preview.mp4"
)

:: Normalize composition aliases
if /i "%COMP_ID%"=="hour" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="one-hour" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="1-hour" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="hourlong" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="hourlongvideo" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="hour-preview" set "COMP_ID=HourLongPreview"
if /i "%COMP_ID%"=="preview" set "COMP_ID=HourLongPreview"
if /i "%COMP_ID%"=="openclaudex" set "COMP_ID=OpenClaudeX"
if /i "%COMP_ID%"=="open-claudex" set "COMP_ID=OpenClaudeX"
if /i "%COMP_ID%"=="beyondearth" set "COMP_ID=BeyondEarth"
if /i "%COMP_ID%"=="beyond-earth" set "COMP_ID=BeyondEarth"

if "%OUT_FILE%"=="" set "OUT_FILE=out/%COMP_ID%.mp4"
if "!OUT_FILE:~0,14!"=="motion-studio/" set "OUT_FILE=!OUT_FILE:~14!"
if "!OUT_FILE:~0,14!"=="motion-studio\" set "OUT_FILE=!OUT_FILE:~14!"

if not exist "out" mkdir "out"

echo ====================================================
echo   LONG-FORM REMOTION RENDER PIPELINE
echo   Composition: %COMP_ID%
echo   Output: motion-studio\%OUT_FILE%
echo   Concurrency: 8x Cores ^| GPU: Chromium ANGLE ^| V8 Heap Guard
echo ====================================================

echo [*] Pre-checking TypeScript and composition types...
call npx tsc --noEmit
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] TypeScript compilation failed. Fix errors before rendering.
    exit /b %ERRORLEVEL%
)

:: Collect all remaining flags (such as --frames 0-300)
set "EXTRA_FLAGS="
shift
shift
:collect_args
if not "%~1"=="" (
    set "EXTRA_FLAGS=!EXTRA_FLAGS! %1"
    shift
    goto collect_args
)

echo [*] Starting uninterrupted render stream...
call npx remotion render src/index.ts "%COMP_ID%" "%OUT_FILE%" --concurrency=8 --gl=angle --bundle-cache --pixel-format=yuv420p !EXTRA_FLAGS!

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo   [SUCCESS] Long-form video rendered cleanly!
    echo   File: motion-studio\%OUT_FILE%
    echo ====================================================
    exit /b 0
) else (
    echo.
    echo [ERROR] Long-form render encountered error code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
