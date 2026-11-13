@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo    [ALL-ROUND CLAUDE CODE MULTI-AGENT VERIFICATION RUNNER]
echo ======================================================================

python test_all_round_verification.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Verification suite failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo [SUCCESS] All verification tests passed cleanly.
exit /b 0
