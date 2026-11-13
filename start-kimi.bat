@echo off
setlocal
cd /d "%~dp0"
echo =========================================================================
echo   Moonshot AI Kimi K3.1 Pro (1M Context MoE)
echo =========================================================================

findstr /i "OPENROUTER_API_KEY DEEPINFRA_API_KEY" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo [+] External provider key detected.
    echo [+] Launching Claude Code directly with Moonshot AI Kimi K3.1 Pro...
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-claude.ps1" kimi %*
) else (
    echo As shown on NVIDIA's official catalog (build.nvidia.com/moonshotai/kimi-k3_1-pro):
    echo   "API access for this model is not available yet on NVIDIA NIM.
    echo    This endpoint is published for preview and playground use only."
    echo.
    echo To use Kimi K3.1 Pro in Claude Code CLI:
    echo   Add OPENROUTER_API_KEY=sk-or-v1-... to your .env file!
    echo.
    echo For 100%% free API access right now on NVIDIA NIM, run:
    echo   - Step 5 Preview (Exact same 1M context): .\start-step.bat
    echo   - MiniMax M3.1 Flash (Coding specialist): .\start-minimax.bat
    echo   - Nemotron Ultra 550B (Sub-second latency): .\start-ultra.bat
    echo.
    pause
)
endlocal
