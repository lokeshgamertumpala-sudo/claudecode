@echo off
setlocal
echo ====================================================
echo   🛡️  APEX CODER - SUITE VERIFICATION RUNNER
echo ====================================================
echo.

python .agents/skills/apex-coder/tests/test_apex_coder.py
if errorlevel 1 (
    echo.
    echo [ERROR] Apex Coder test suite failed.
    exit /b 1
)

echo.
echo ====================================================
echo   [SUCCESS] Apex Coder Verified 100% Operational!
echo ====================================================
exit /b 0
