@echo off
REM Run 3D Renderer Tests
REM This script opens the test runner in the default browser

echo Opening 3D Renderer Test Suite...
echo.

set "TEST_URL=%~dp0js\3d\test-runner.html"

REM Check if the file exists
if not exist "%TEST_URL%" (
    echo ERROR: Test runner not found at:
    echo %TEST_URL%
    echo.
    echo Make sure the test files are in the correct location.
    pause
    exit /b 1
)

echo Found test runner at:
echo %TEST_URL%
echo.
echo Opening test runner in your default browser...
echo.

start "" "%TEST_URL%"

echo Tests launched successfully!
echo.
echo The test runner will automatically run and display results.
echo.
echo Tests include:
echo   - Renderer Initialization
echo   - Lighting Setup
echo   - Add Crowd Unit
echo   - Add Enemy Types
echo   - Add Gate
echo   - Add Projectile
echo   - Update Function
echo   - Window Resize Handling
echo.
pause