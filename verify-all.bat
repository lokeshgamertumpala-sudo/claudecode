@echo off
setlocal
echo ======================================================
echo    🛡️ Running Universal Zero-Error Integrity Check
echo ======================================================
python .agents\skills\zero-error-architect\scripts\universal_verifier.py %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Audit found issues. Please review above.
    exit /b %ERRORLEVEL%
)
echo.
echo ✅ Project integrity 100%% verified!
if "%1" NEQ "--no-pause" (
    pause
)
