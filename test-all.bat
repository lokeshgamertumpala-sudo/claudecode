@echo off
setlocal
cd /d "%~dp0"
echo ======================================================================
echo    Running Master Verification Test Suite (test_all.py)
echo ======================================================================
python test_all.py %*
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Test suite failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
echo [SUCCESS] All verification tests passed cleanly!
exit /b 0
