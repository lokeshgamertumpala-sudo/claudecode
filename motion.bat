@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "RAW_ARG1=%~1"
set "PROMPT_TEXT=%~2"
set "COMP_NAME=%~n1"

:: If first parameter contains spaces and second parameter is empty, treat first param as prompt
if not "%RAW_ARG1%"=="" (
    for /f "tokens=1,2" %%A in ("%RAW_ARG1%") do (
        if not "%%B"=="" (
            if "%PROMPT_TEXT%"=="" (
                set "PROMPT_TEXT=%RAW_ARG1%"
                set "COMP_NAME=AiExplainer"
            )
        )
    )
)

echo ====================================================
echo   🎬 1-SHOT AUTONOMOUS MOTION GRAPHICS ACCELERATOR
echo   Powered by Remotion 60FPS and NVIDIA NIM (Ultra 550B)
echo ====================================================

:: If no composition specified, show usage
if "%COMP_NAME%"=="" (
    echo.
    echo Usage:
    echo   motion.bat ^<CompositionName^> "[Optional Prompt]"
    echo.
    echo Examples:
    echo   motion.bat AiExplainer
    echo   motion.bat NeuralNetwork "Create a 60-second cinematic neural network explainer"
    echo   motion.bat BeyondEarth
    echo.
    echo Available Registered Compositions:
    echo   AiExplainer, BeyondEarth, OpenClaudeX, HourLongVideo, ItIsAi,
    echo   MinimalMotion, EarthRotation, GoodMorning, GoodEvening,
    echo   HiGreeting, KineticTypography, CyberpunkHUD, ParticleVortex,
    echo   LogoReveal, NeonPortal, VersatileShowcase
    echo.
    exit /b 0
)

:: Step 1: Health check local proxy
echo [*] Checking local inference proxy status...
powershell -NoProfile -Command "try { $r = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/health/readiness' -TimeoutSec 2 -ErrorAction Stop; if ($r.status -eq 'healthy') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Local LiteLLM proxy is not running on port 4000.
    echo [*] Starting local inference proxy in background...
    start /b powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-proxy.ps1" >nul 2>&1
    echo [*] Waiting for proxy readiness...
    powershell -NoProfile -Command "for ($i=0; $i -lt 10; $i++) { try { $r = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/health/readiness' -TimeoutSec 2 -ErrorAction Stop; if ($r.status -eq 'healthy') { exit 0 } } catch {}; Start-Sleep -Milliseconds 500 }; exit 1" >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] LiteLLM proxy failed to start or become healthy on port 4000.
        exit /b 1
    )
)
echo [+] Inference proxy confirmed healthy.

:: Step 2: Ensure fast model selected (Nemotron Ultra 550B MoE)
if exist "select_model.py" (
    python select_model.py ultra >nul 2>&1
    echo [+] Pinned to NVIDIA Nemotron Ultra 550B MoE [sub-second TTFT].
)

:: Step 3: If prompt provided, execute Claude Code in 1-shot autonomous mode
if not "%PROMPT_TEXT%"=="" (
    echo.
    echo ====================================================
    echo   Autonomous 1-Shot Synthesis: %COMP_NAME%
    echo   Prompt: "%PROMPT_TEXT%"
    echo ====================================================
    call powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" -Boost -Unrestricted -Prompt "Create 1-shot 60FPS Remotion composition %COMP_NAME%: %PROMPT_TEXT%. Follow .claude/skills/remotion-motion-graphics/SKILL.md: Turn 1 Write motion-studio/src/compositions/%COMP_NAME%.tsx, Turn 2 Edit Root.tsx, Turn 3 check-motion.bat %COMP_NAME%, Turn 4 render-motion.bat %COMP_NAME% out/%COMP_NAME%.mp4. Immediate tool calls only!"
)

:: Step 4: Run Fast Verification (<2s)
echo.
echo ====================================================
echo   Verifying Composition: %COMP_NAME%
echo ====================================================
call "%~dp0check-motion.bat" %COMP_NAME% 60
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fast verification failed for %COMP_NAME%.
    exit /b %ERRORLEVEL%
)

:: Step 5: Render Full 60FPS MP4 (<8s)
echo.
echo ====================================================
echo   Rendering 60FPS MP4: %COMP_NAME%
echo ====================================================
call "%~dp0render-motion.bat" %COMP_NAME% "out/%COMP_NAME%.mp4"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Render failed for %COMP_NAME%.
    exit /b %ERRORLEVEL%
)

echo.
echo ====================================================
echo   [SUCCESS] Motion Graphic Ready!
echo   MP4 Video: motion-studio\out\%COMP_NAME%.mp4
echo   Preview frame: motion-studio\out\_check_%COMP_NAME%.png
echo ====================================================
exit /b 0
