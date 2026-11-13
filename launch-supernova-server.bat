@echo off
title SUPERNOVA - Local Server
cd /d "C:\Users\NEW\OneDrive\Desktop\claudecode"
echo Starting HTTP server for SUPERNOVA...
echo.
echo Server will be available at: http://localhost:8080/supernova.html
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8080