@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules" (
    call npm install
)
call npx remotion preview src/index.ts --port 3100
