@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0motion-studio"

:: Normalize and strip path/extension (.tsx) if passed
set "COMP_ID=%~n1"
set "OUT_FILE=%~2"

if "%COMP_ID%"=="" (
    echo [!] Missing composition ID.
    echo Usage: render-motion.bat [CompositionId] [OutputFile]
    echo Example: render-motion.bat MinimalMotion out/minimal-motion.mp4
    echo Example: render-motion.bat EarthRotation out/earth-rotation.mp4
    echo Example: render-motion.bat GoodMorning out/good-morning.mp4
    echo.
    echo Available compositions:
    echo   MinimalMotion, EarthRotation, GoodMorning, HiGreeting,
    echo   KineticTypography, CyberpunkHUD, ParticleVortex, LogoReveal,
    echo   NeonPortal, VerticalReel
    exit /b 1
)

:: Normalize composition aliases (clean hyphens and underscores first for uniform matching)
set "COMP_ALIAS=%COMP_ID:-=%"
set "COMP_ALIAS=!COMP_ALIAS:_=!"

if /i "!COMP_ALIAS!"=="minimal" set "COMP_ID=MinimalMotion"
if /i "!COMP_ALIAS!"=="minimalmotion" set "COMP_ID=MinimalMotion"
if /i "!COMP_ALIAS!"=="earth" set "COMP_ID=EarthRotation"
if /i "!COMP_ALIAS!"=="earthrotation" set "COMP_ID=EarthRotation"
if /i "!COMP_ALIAS!"=="goodmorning" set "COMP_ID=GoodMorning"
if /i "!COMP_ALIAS!"=="goodevening" set "COMP_ID=GoodEvening"
if /i "!COMP_ALIAS!"=="higreeting" set "COMP_ID=HiGreeting"
if /i "!COMP_ALIAS!"=="kinetictypography" set "COMP_ID=KineticTypography"
if /i "!COMP_ALIAS!"=="cyberpunkhud" set "COMP_ID=CyberpunkHUD"
if /i "!COMP_ALIAS!"=="particlevortex" set "COMP_ID=ParticleVortex"
if /i "!COMP_ALIAS!"=="logoreveal" set "COMP_ID=LogoReveal"
if /i "!COMP_ALIAS!"=="neonportal" set "COMP_ID=NeonPortal"
if /i "!COMP_ALIAS!"=="verticalreel" set "COMP_ID=VerticalReel"
if /i "!COMP_ALIAS!"=="versatileshowcase" set "COMP_ID=VersatileShowcase"
if /i "!COMP_ALIAS!"=="beyondearth" set "COMP_ID=BeyondEarth"
if /i "!COMP_ALIAS!"=="space" set "COMP_ID=BeyondEarth"
if /i "!COMP_ALIAS!"=="openclaudex" set "COMP_ID=OpenClaudeX"
if /i "!COMP_ALIAS!"=="claudex" set "COMP_ID=OpenClaudeX"
if /i "!COMP_ALIAS!"=="hourlongvideo" set "COMP_ID=HourLongVideo"
if /i "!COMP_ALIAS!"=="onehour" set "COMP_ID=HourLongVideo"
if /i "!COMP_ALIAS!"=="hourlongpreview" set "COMP_ID=HourLongPreview"
if /i "!COMP_ALIAS!"=="hourpreview" set "COMP_ID=HourLongPreview"
if /i "!COMP_ALIAS!"=="aiexplainer" set "COMP_ID=AiExplainer"
if /i "!COMP_ALIAS!"=="ai" set "COMP_ID=AiExplainer"
if /i "!COMP_ALIAS!"=="neuralnetwork" set "COMP_ID=AiExplainer"
if /i "!COMP_ALIAS!"=="aineuralnetwork" set "COMP_ID=AiExplainer"
if /i "!COMP_ALIAS!"=="explainer" set "COMP_ID=AiExplainer"
if /i "!COMP_ALIAS!"=="itisai" set "COMP_ID=ItIsAi"

:: Dynamic composition matching from src/compositions folder
set "CLEAN_COMP_ID=%COMP_ID:-=%"
set "CLEAN_COMP_ID=!CLEAN_COMP_ID:_=!"
for %%F in (src\compositions\*.tsx) do (
    set "FILE_NAME=%%~nF"
    set "FILE_CLEAN=!FILE_NAME:-=!"
    set "FILE_CLEAN=!FILE_CLEAN:_=!"
    if /i "%COMP_ID%"=="!FILE_NAME!" set "COMP_ID=!FILE_NAME!"
    if /i "!CLEAN_COMP_ID!"=="!FILE_CLEAN!" set "COMP_ID=!FILE_NAME!"
)

:: Default output path
if "%OUT_FILE%"=="" set "OUT_FILE=out/%COMP_ID%.mp4"

:: Strip redundant motion-studio/ or motion-studio\ if caller passed project-relative path
if "!OUT_FILE:~0,14!"=="motion-studio/" set "OUT_FILE=!OUT_FILE:~14!"
if "!OUT_FILE:~0,14!"=="motion-studio\" set "OUT_FILE=!OUT_FILE:~14!"

if not exist "out" mkdir "out"

:: Step 1: Rapid 500ms TypeScript Pre-Check
echo [*] Pre-checking TypeScript and syntax integrity...
call npx tsc --noEmit
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] TypeScript compilation failed. Fix errors above before rendering.
    exit /b %ERRORLEVEL%
)

echo ====================================================
echo   Rendering Remotion Composition: %COMP_ID%
echo   Output: %OUT_FILE%
echo   Concurrency: 12x Threads ^| GPU: Chromium ANGLE ^| Cache: Enabled
echo ====================================================

call npx remotion render src/index.ts "%COMP_ID%" "%OUT_FILE%" --concurrency=12 --gl=angle --bundle-cache

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Video rendered to: motion-studio\%OUT_FILE%
    exit /b 0
) else (
    echo.
    echo [ERROR] Render failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
