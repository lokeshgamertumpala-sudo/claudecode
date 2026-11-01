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

# 2. Terminate processes listening on port 4000
$port = 4000
$conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($conns) {
    $conns | ForEach-Object {
        $procId = $_.OwningProcess
        if ($procId -gt 0) {
            cmd.exe /c "taskkill /F /T /PID $procId" 2>$null
            Write-Host "[+] Stopped process tree (PID: $procId) on port $port." -ForegroundColor Green
        }
    }
}

# 3. Terminate all litellm.exe and python instances running litellm
$litellmProcs = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%litellm%'" -ErrorAction SilentlyContinue
if ($litellmProcs) {
    $litellmProcs | ForEach-Object {
        if ($_.ProcessId -ne $PID) {
            cmd.exe /c "taskkill /F /T /PID $($_.ProcessId)" 2>$null
            Write-Host "[+] Cleaned up stale litellm process (PID: $($_.ProcessId))." -ForegroundColor Green
        }
    }
}

Start-Sleep -Seconds 1
Write-Host "[+] Claude Code background services stopped cleanly." -ForegroundColor Green
