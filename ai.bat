@echo off
setlocal
cd /d "c:\Users\NEW\OneDrive\Desktop\claudecode"

python select_model.py %*
if "%~1"=="-l" goto :eof
if "%~1"=="--list" goto :eof
if "%~1"=="list" goto :eof

echo.
set /p "LAUNCH=Launch Claude Code now with this model? [Y/n]: "
if /i "%LAUNCH%"=="n" goto :eof
call run-autonomous.bat
