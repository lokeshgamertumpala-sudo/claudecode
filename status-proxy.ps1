# Check Status of LiteLLM Proxy Daemon and Watchdog Supervisor
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { (Get-Location).Path }

$port = 4000

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   LiteLLM Proxy & Watchdog Service Status" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Check Watchdog process
$watchdog = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%proxy-watchdog.ps1%'" -ErrorAction SilentlyContinue
$watchdogRunning = [bool]$watchdog

# 2. Check Port 4000
$portListening = $false
$owningPid = $null
$conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conns) {
    $portListening = $true
    $owningPid = ($conns | Select-Object -First 1).OwningProcess
}

# 3. Check Proxy Readiness and Latency
$proxyHealthy = $false
$latencyMs = $null
if ($portListening) {
    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 3 -ErrorAction Stop
        $sw.Stop()
        $latencyMs = [math]::Round($sw.Elapsed.TotalMilliseconds, 1)
        if ($resp.status -eq "healthy") {
            $proxyHealthy = $true
        }
    } catch {
        $proxyHealthy = $false
    }
}

# 4. Check Active Model
$prefFile = Join-Path $ScriptDir "active_model.txt"
$model = "Mistral Large 4 (mistralai/mistral-large-4-1t-a52b) [Default]"
if (Test-Path $prefFile) {
    $m = (Get-Content $prefFile -Raw).Trim()
    if ($m) { $model = $m }
}

# Output report
if ($proxyHealthy) {
    Write-Host "Proxy Status : " -NoNewline
    Write-Host "HEALTHY & READY" -ForegroundColor Green
    Write-Host "Endpoint     : http://127.0.0.1:$port" -ForegroundColor Gray
    Write-Host "Process PID  : $owningPid" -ForegroundColor Gray
    Write-Host "Readiness    : ${latencyMs}ms response time" -ForegroundColor Green
} else {
    Write-Host "Proxy Status : " -NoNewline
    Write-Host "STOPPED / UNHEALTHY" -ForegroundColor Red
}

if ($watchdogRunning) {
    Write-Host "Watchdog     : " -NoNewline
    Write-Host "ACTIVE (Auto-Restart Enabled)" -ForegroundColor Green
    $wPids = ($watchdog | ForEach-Object { $_.ProcessId }) -join ", "
    Write-Host "Watchdog PID : $wPids" -ForegroundColor Gray
} else {
    Write-Host "Watchdog     : " -NoNewline
    Write-Host "STOPPED" -ForegroundColor Yellow
}

Write-Host "Active Model : $model" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

if ($proxyHealthy) {
    exit 0
} else {
    exit 1
}
