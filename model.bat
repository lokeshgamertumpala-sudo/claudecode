@echo off
if "%~1"=="" (
    python "%~dp0select_model.py"
) else (
    python "%~dp0select_model.py" %*
)
