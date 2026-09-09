# Script to stop both the background watchdog and the LiteLLM proxy
Write-Host "[*] Stopping Claude Code background watchdog and proxy..." -ForegroundColor Cyan

# 1. Terminate any running watchdog instances
$watchdogs = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%proxy-watchdog.ps1%'" -ErrorAction SilentlyContinue
if ($watchdogs) {
    $watchdogs | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "[+] Stopped watchdog supervisor (PID: $($_.ProcessId))." -ForegroundColor Green
    }
} else {
    Write-Host "[i] No watchdog supervisor running." -ForegroundColor Gray
}

# 2. Terminate litellm processes
$port = 4000
$conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($conns) {
    $conns | ForEach-Object {
        $procId = $_.OwningProcess
        if ($procId -gt 0) {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host "[+] Stopped proxy process (PID: $procId) on port $port." -ForegroundColor Green
        }
    }
} else {
    Write-Host "[i] No proxy running on port $port." -ForegroundColor Gray
}

# Fallback: kill any orphaned litellm.exe
Get-Process litellm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "[+] Claude Code background services stopped." -ForegroundColor Green
