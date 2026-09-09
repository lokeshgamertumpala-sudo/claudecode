# Start the Claude Code Proxy Daemon completely detached from any console / IDE
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$watchdogScript = Join-Path $ScriptDir "proxy-watchdog.ps1"

# Check if watchdog already running
$watchdog = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%proxy-watchdog.ps1%'" -ErrorAction SilentlyContinue
if (-not $watchdog) {
    Write-Host "[*] Spawning independent background watchdog via Windows WMI..." -ForegroundColor Cyan
    $cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$watchdogScript`""
    $res = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd }
    if ($res.ReturnValue -ne 0) {
        Write-Error "Failed to spawn watchdog process via WMI. Code: $($res.ReturnValue)"
        exit 1
    }
}

# Verify proxy health
$port = 4000
$ready = $false
Write-Host "Verifying independent proxy..." -NoNewline
for ($i = 0; $i -lt 15; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/v1/models" -Headers @{ Authorization = "Bearer sk-litellm-proxy-key" } -TimeoutSec 1 -ErrorAction Stop
        if ($resp) {
            $ready = $true
            break
        }
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Milliseconds 500
    }
}
Write-Host ""

if ($ready) {
    Write-Host "[+] Proxy is running 100% INDEPENDENTLY in the background on port $port!" -ForegroundColor Green
    Write-Host "[+] It is decoupled from any terminal, IDE, or Antigravity window." -ForegroundColor Green
} else {
    Write-Error "Proxy failed to respond on port $port."
}
