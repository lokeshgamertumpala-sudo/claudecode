# Continuous Watchdog Supervisor for LiteLLM Proxy
# Keeps a single instance of LiteLLM proxy alive 24/7 without duplicate process collisions.

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { (Get-Location).Path }

# Guard against duplicate watchdogs
$currentPid = $PID
$otherWatchdogs = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%proxy-watchdog.ps1%'" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessId -ne $currentPid }
if ($otherWatchdogs) {
    exit 0
}

# 1. Load .env file and set Process & User environment variables
$envFile = Join-Path $ScriptDir ".env"
[Environment]::SetEnvironmentVariable("PYTHONUTF8", "1", "Process")
[Environment]::SetEnvironmentVariable("PYTHONIOENCODING", "utf-8", "Process")
[Environment]::SetEnvironmentVariable("PYTHONUTF8", "1", "User")
[Environment]::SetEnvironmentVariable("PYTHONIOENCODING", "utf-8", "User")

if (Test-Path $envFile) {
    Get-Content $envFile -Encoding utf8 | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $varName = $parts[0].Trim()
            $varVal = $parts[1].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($varName, $varVal, "Process")
            [Environment]::SetEnvironmentVariable($varName, $varVal, "User")
        }
    }
    if ($env:NVIDIA_API_KEY) {
        $env:NVIDIA_NIM_API_KEY = $env:NVIDIA_API_KEY
        [Environment]::SetEnvironmentVariable("NVIDIA_NIM_API_KEY", $env:NVIDIA_API_KEY, "User")
    }
}

$litellmCandidates = @(
    "C:\Users\NEW\AppData\Local\Python\bin\litellm.exe",
    "C:\Users\NEW\AppData\Local\Python\pythoncore-3.14-64\Scripts\litellm.exe"
)
$litellmCmd = $null
foreach ($cand in $litellmCandidates) {
    if (Test-Path $cand) {
        $litellmCmd = $cand
        break
    }
}
if (-not $litellmCmd) {
    $cmdLite = Get-Command litellm -ErrorAction SilentlyContinue
    if ($cmdLite) { $litellmCmd = $cmdLite.Source }
}

$port = 4000
$configFile = Join-Path $ScriptDir "config.yaml"
$outLog = Join-Path $ScriptDir "proxy-stdout.log"
$errLog = Join-Path $ScriptDir "proxy-stderr.log"
$watchdogLog = Join-Path $ScriptDir "watchdog.log"

function Clean-StaleProxyProcesses {
    param([int]$targetPort)
    $conns = Get-NetTCPConnection -LocalPort $targetPort -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        $conns | ForEach-Object {
            $pId = $_.OwningProcess
            if ($pId -gt 0 -and $pId -ne $PID) {
                cmd.exe /c "taskkill /F /T /PID $pId" 2>$null
            }
        }
    }
    $stale = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%litellm%'" -ErrorAction SilentlyContinue
    if ($stale) {
        $stale | ForEach-Object {
            if ($_.ProcessId -ne $PID) {
                cmd.exe /c "taskkill /F /T /PID $($_.ProcessId)" 2>$null
            }
        }
    }
    Start-Sleep -Seconds 1
}

# Start with 2 failures so first loop revives immediately if proxy is not yet running
$consecutiveFailures = 2

while ($true) {
    $alive = $false

    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 10 -ErrorAction Stop
            if ($resp.status -eq "healthy") {
                $alive = $true
            }
        } catch {
            $alive = $false
        }
    }

    if ($alive) {
        $consecutiveFailures = 0
    } else {
        # Check if there are active client streams connected to port 4000
        $activeConns = Get-NetTCPConnection -LocalPort $port -State Established -ErrorAction SilentlyContinue
        if ($activeConns) {
            # Proxy is actively serving client connections; do not treat temporary probe timeout as dead proxy
            "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Health check slow ($($activeConns.Count) active connection(s) streaming), preserving live session." | Out-File $watchdogLog -Append -Encoding utf8
            $consecutiveFailures = 0
        } else {
            $consecutiveFailures++
            "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Health check failed ($consecutiveFailures/6)." | Out-File $watchdogLog -Append -Encoding utf8

            if ($consecutiveFailures -ge 6) {
                "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Proxy down after 6 consecutive failures. Cleaning stale processes and reviving on port $port..." | Out-File $watchdogLog -Append -Encoding utf8
                Clean-StaleProxyProcesses -targetPort $port

                try {
                    $proc = Start-Process -FilePath $litellmCmd `
                        -ArgumentList "--config `"$configFile`" --port $port --host 127.0.0.1 --request_timeout 1800 --keepalive_timeout 1800" `
                        -WorkingDirectory $ScriptDir `
                        -RedirectStandardOutput $outLog `
                        -RedirectStandardError $errLog `
                        -WindowStyle Hidden `
                        -PassThru
                    
                    $started = $false
                    for ($k = 0; $k -lt 15; $k++) {
                        Start-Sleep -Seconds 1
                        try {
                            $testResp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 2 -ErrorAction Stop
                            if ($testResp.status -eq "healthy") {
                                $started = $true
                                break
                            }
                        } catch {}
                    }

                    if ($started) {
                        "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Revived litellm successfully (PID: $($proc.Id))." | Out-File $watchdogLog -Append -Encoding utf8
                    } else {
                        "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Litellm process started (PID: $($proc.Id)), waiting for warm-up." | Out-File $watchdogLog -Append -Encoding utf8
                    }
                } catch {
                    "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Failed to start litellm: $_" | Out-File $watchdogLog -Append -Encoding utf8
                }
                $consecutiveFailures = 0
            }
        }
    }

    Start-Sleep -Seconds 5
}
