@echo off
echo ===============================================
echo   Med-Assist HealthTech Prototype
echo ===============================================
echo.
echo Installing dependencies...
npm install
if errorlevel 1 (
    echo.
    echo Error: Failed to install dependencies.
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)
echo.
echo Starting Expo development server...
echo.
npm start