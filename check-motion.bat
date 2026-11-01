@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0motion-studio"

:: Normalize and strip path/extension (.tsx) if passed
set "COMP_ID=%~n1"
set "FRAME=%~2"
if "%FRAME%"=="" set "FRAME=30"

if "%COMP_ID%"=="" (
    echo [!] Missing composition ID.
    echo Usage: check-motion.bat [CompositionId] [OptionalFrameNumber]
    echo Example: check-motion.bat EarthRotation 60
    echo Example: check-motion.bat MinimalMotion 45
    exit /b 1
)

:: Normalize aliases (clean hyphens and underscores first for uniform matching)
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
if /i "!COMP_ALIAS!"=="versatile" set "COMP_ID=VersatileShowcase"
if /i "!COMP_ALIAS!"=="showcase" set "COMP_ID=VersatileShowcase"
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
if /i "!COMP_ALIAS!"=="auroraflow" set "COMP_ID=AuroraFlow"
if /i "!COMP_ALIAS!"=="aurora" set "COMP_ID=AuroraFlow"
if /i "!COMP_ALIAS!"=="cosmicaurora" set "COMP_ID=CosmicAurora"
if /i "!COMP_ALIAS!"=="cosmic" set "COMP_ID=CosmicAurora"

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
