@echo off
title Nexus Clash: Crowd Command - 3D Arcade Strategy
echo.
echo =============================================
echo    NEXUS CLASH: CROWD COMMAND - 3D EDITION
echo    A MobControl-like 3D Arcade Strategy Game
echo =============================================
echo.
echo Launching 3D game...
echo.

REM Check if we're in the right directory
cd /d "%~dp0games"

REM Try to open the 3D game in the default browser
start "" "index_3d.html"

echo.
echo Game launched in your default browser!
echo If it doesn't open automatically, please open:
echo %cd%\index_3d.html
echo.
echo Features:
echo - Full 3D gameplay with depth and spatial awareness
echo - Realistic lighting and materials
echo - 3D entity models (crowd, enemies, gates, projectiles)
echo - Immersive visual effects and particle systems
echo - All original gameplay mechanics preserved
echo - Complete weapon/upgrade/system
echo.
pause