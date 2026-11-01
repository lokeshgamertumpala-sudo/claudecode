@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0motion-studio"

set "COMP_ID=%~1"
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

:: Normalize composition aliases
if /i "%COMP_ID%"=="minimal" set "COMP_ID=MinimalMotion"
if /i "%COMP_ID%"=="minimalmotion" set "COMP_ID=MinimalMotion"
if /i "%COMP_ID%"=="minimal-motion" set "COMP_ID=MinimalMotion"
if /i "%COMP_ID%"=="earth" set "COMP_ID=EarthRotation"
if /i "%COMP_ID%"=="earth-rotation" set "COMP_ID=EarthRotation"
if /i "%COMP_ID%"=="earthrotation" set "COMP_ID=EarthRotation"
if /i "%COMP_ID%"=="good-morning" set "COMP_ID=GoodMorning"
if /i "%COMP_ID%"=="goodmorning" set "COMP_ID=GoodMorning"
if /i "%COMP_ID%"=="hi-greeting" set "COMP_ID=HiGreeting"
if /i "%COMP_ID%"=="higreeting" set "COMP_ID=HiGreeting"
if /i "%COMP_ID%"=="kinetic-typography" set "COMP_ID=KineticTypography"
if /i "%COMP_ID%"=="kinetictypography" set "COMP_ID=KineticTypography"
if /i "%COMP_ID%"=="cyberpunk-hud" set "COMP_ID=CyberpunkHUD"
if /i "%COMP_ID%"=="cyberpunkhud" set "COMP_ID=CyberpunkHUD"
if /i "%COMP_ID%"=="particle-vortex" set "COMP_ID=ParticleVortex"
if /i "%COMP_ID%"=="particlevortex" set "COMP_ID=ParticleVortex"
if /i "%COMP_ID%"=="logo-reveal" set "COMP_ID=LogoReveal"
if /i "%COMP_ID%"=="logoreveal" set "COMP_ID=LogoReveal"
if /i "%COMP_ID%"=="neon-portal" set "COMP_ID=NeonPortal"
if /i "%COMP_ID%"=="neonportal" set "COMP_ID=NeonPortal"
if /i "%COMP_ID%"=="vertical-reel" set "COMP_ID=VerticalReel"
if /i "%COMP_ID%"=="verticalreel" set "COMP_ID=VerticalReel"
if /i "%COMP_ID%"=="beyond-earth" set "COMP_ID=BeyondEarth"
if /i "%COMP_ID%"=="beyondearth" set "COMP_ID=BeyondEarth"
if /i "%COMP_ID%"=="space" set "COMP_ID=BeyondEarth"
if /i "%COMP_ID%"=="open-claudex" set "COMP_ID=OpenClaudeX"
if /i "%COMP_ID%"=="openclaudex" set "COMP_ID=OpenClaudeX"
if /i "%COMP_ID%"=="claudex" set "COMP_ID=OpenClaudeX"
if /i "%COMP_ID%"=="hour-long-video" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="hourlongvideo" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="one-hour" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="onehour" set "COMP_ID=HourLongVideo"
if /i "%COMP_ID%"=="hour-preview" set "COMP_ID=HourLongPreview"
if /i "%COMP_ID%"=="hourlongpreview" set "COMP_ID=HourLongPreview"
if /i "%COMP_ID%"=="aiexplainer" set "COMP_ID=AiExplainer"
if /i "%COMP_ID%"=="ai-explainer" set "COMP_ID=AiExplainer"
if /i "%COMP_ID%"=="ai" set "COMP_ID=AiExplainer"
if /i "%COMP_ID%"=="neuralnetwork" set "COMP_ID=AiExplainer"
if /i "%COMP_ID%"=="neural-network" set "COMP_ID=AiExplainer"
if /i "%COMP_ID%"=="ai-neural-network" set "COMP_ID=AiExplainer"
if /i "%COMP_ID%"=="explainer" set "COMP_ID=AiExplainer"
if /i "%COMP_ID%"=="itisai" set "COMP_ID=ItIsAi"
if /i "%COMP_ID%"=="it-is-ai" set "COMP_ID=ItIsAi"

:: Dynamic composition matching from src/compositions folder
for %%F in (src\compositions\*.tsx) do (
    if /i "%COMP_ID%"=="%%~nF" set "COMP_ID=%%~nF"
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
