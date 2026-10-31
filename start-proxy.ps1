# Start the LiteLLM Proxy Daemon completely detached from any console / IDE
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { (Get-Location).Path }

$port = 4000
$watchdogScript = Join-Path $ScriptDir "proxy-watchdog.ps1"

# 1. Check if proxy is already healthy
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 2 -ErrorAction Stop
    if ($resp.status -eq "healthy") {
        Write-Host "[+] LiteLLM proxy is already running and healthy on port $port." -ForegroundColor Green
        
        # Check active model
        $prefFile = Join-Path $ScriptDir "active_model.txt"
        $model = "Mistral Large 4 (Primary Default)"
        if (Test-Path $prefFile) {
            $m = (Get-Content $prefFile -Raw).Trim()
            if ($m) { $model = $m }
        }
        Write-Host "[+] Active Model: $model" -ForegroundColor Cyan
        exit 0
    }
} catch {}

# 2. Check if watchdog is already running; if not, spawn it detached via WMI
$watchdog = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%proxy-watchdog.ps1%'" -ErrorAction SilentlyContinue
if (-not $watchdog) {
    Write-Host "[*] Spawning independent persistent proxy supervisor daemon via WMI..." -ForegroundColor Cyan
    $cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$watchdogScript`""
    $res = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd }
    if ($res.ReturnValue -ne 0) {
        Write-Error "Failed to spawn watchdog supervisor via WMI. ReturnCode: $($res.ReturnValue)"
        exit 1
    }
} else {
    Write-Host "[*] Proxy watchdog supervisor is already running; waiting for proxy revival..." -ForegroundColor Cyan
}

# 3. Wait for proxy to report healthy
$ready = $false
Write-Host "Verifying independent proxy readiness..." -NoNewline
for ($i = 0; $i -lt 30; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 1 -ErrorAction Stop
        if ($resp.status -eq "healthy") {
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
    Write-Host "[+] Decoupled from any terminal, IDE, or subagent process tree." -ForegroundColor Green
    Write-Host "[+] Fast health endpoint: http://127.0.0.1:$port/health/readiness" -ForegroundColor Gray
    
    $prefFile = Join-Path $ScriptDir "active_model.txt"
    $model = "Mistral Large 4"
    if (Test-Path $prefFile) {
        $m = (Get-Content $prefFile -Raw).Trim()
        if ($m) { $model = $m }
    }
    Write-Host "[+] Active Model: $model" -ForegroundColor Cyan
    exit 0
} else {
    Write-Error "Proxy failed to respond on port $port within timeout. Check proxy-stderr.log and watchdog.log."
    exit 1
}
