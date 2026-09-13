@echo off
setlocal
cd /d "%~dp0"
echo ====================================================
echo   ULTRA CODE: Full Power Autonomous Mode
echo ====================================================
call "%~dp0run-autonomous.bat" %*
endlocal
