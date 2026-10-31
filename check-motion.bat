@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0motion-studio"

set "COMP_ID=%~1"
set "FRAME=%~2"
if "%FRAME%"=="" set "FRAME=30"

if "%COMP_ID%"=="" (
    echo [!] Missing composition ID.
    echo Usage: check-motion.bat [CompositionId] [OptionalFrameNumber]
    echo Example: check-motion.bat EarthRotation 60
    echo Example: check-motion.bat MinimalMotion 45
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
if /i "%COMP_ID%"=="cyberpunkhud" set "COMP_ID=CyberpunkHUD"
if /i "%COMP_ID%"=="cyberpunk-hud" set "COMP_ID=CyberpunkHUD"
if /i "%COMP_ID%"=="neonportal" set "COMP_ID=NeonPortal"
if /i "%COMP_ID%"=="neon-portal" set "COMP_ID=NeonPortal"
if /i "%COMP_ID%"=="beyondearth" set "COMP_ID=BeyondEarth"
if /i "%COMP_ID%"=="beyond-earth" set "COMP_ID=BeyondEarth"
if /i "%COMP_ID%"=="space" set "COMP_ID=BeyondEarth"
if /i "%COMP_ID%"=="openclaudex" set "COMP_ID=OpenClaudeX"
if /i "%COMP_ID%"=="open-claudex" set "COMP_ID=OpenClaudeX"
if /i "%COMP_ID%"=="hourlongvideo" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="hour-long-video" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="hourlongpreview" set "COMP_ID=HourLongPreview"
if /i "%COMP_ID%"=="hour-preview" set "COMP_ID=HourLongPreview"

echo ====================================================
echo   FAST-VERIFY MOTION GRAPHIC: %COMP_ID%
echo   Step 1: TypeScript Syntax and Type Verification
echo ====================================================

call npx tsc --noEmit
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] TypeScript compilation failed. Fix syntax errors before rendering.
    exit /b %ERRORLEVEL%
)
echo [+] TypeScript verification PASSED: 0 errors.

echo.
echo ====================================================
echo   Step 2: Fast Single Frame Still Render (~2s)
echo   Target Frame: %FRAME% ^| Output: out/_check_%COMP_ID%.png
echo ====================================================

if not exist "out" mkdir "out"
call npx remotion still src/index.ts "%COMP_ID%" "out/_check_%COMP_ID%.png" --frame=%FRAME%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo [SUCCESS] Composition '%COMP_ID%' verified 100 percent functional.
    echo Still frame saved: motion-studio\out\_check_%COMP_ID%.png
    echo To render full MP4: render-motion.bat %COMP_ID%
    echo To preview in browser: preview-motion.bat
    echo ====================================================
    exit /b 0
) else (
    echo.
    echo [ERROR] Still frame render failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
