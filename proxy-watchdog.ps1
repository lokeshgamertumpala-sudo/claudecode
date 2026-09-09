# Continuous Watchdog Supervisor for LiteLLM Proxy
# Keeps the proxy alive 24/7, automatically reviving it if it stops or crashes.

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) { $ScriptDir = "C:\Users\NEW\OneDrive\Desktop\claudecode" }

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

$pythonScripts = "C:\Users\NEW\AppData\Local\Python\pythoncore-3.14-64\Scripts"
$litellmCmd = Join-Path $pythonScripts "litellm.exe"
if (-not (Test-Path $litellmCmd)) {
    $cmdLite = Get-Command litellm -ErrorAction SilentlyContinue
    if ($cmdLite) { $litellmCmd = $cmdLite.Source }
}

$port = 4000
$configFile = Join-Path $ScriptDir "config.yaml"
$outLog = Join-Path $ScriptDir "proxy-stdout.log"
$errLog = Join-Path $ScriptDir "proxy-stderr.log"
$watchdogLog = Join-Path $ScriptDir "watchdog.log"

"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Watchdog started. Monitoring port $port..." | Out-File $watchdogLog -Append -Encoding utf8

while ($true) {
    $alive = $false
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/v1/models" -Headers @{ Authorization = "Bearer sk-litellm-proxy-key" } -TimeoutSec 2 -ErrorAction Stop
        if ($resp) { $alive = $true }
    } catch {
        $alive = $false
    }

    if (-not $alive) {
        "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Proxy down! Reviving litellm on port $port..." | Out-File $watchdogLog -Append -Encoding utf8
        try {
            $proc = Start-Process -FilePath $litellmCmd `
                -ArgumentList "--config `"$configFile`" --port $port --host 127.0.0.1" `
                -WorkingDirectory $ScriptDir `
                -RedirectStandardOutput $outLog `
                -RedirectStandardError $errLog `
                -WindowStyle Hidden `
                -PassThru
                
            Start-Sleep -Seconds 3
            "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Revived litellm (PID: $($proc.Id))." | Out-File $watchdogLog -Append -Encoding utf8
        } catch {
            "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Failed to start litellm: $_" | Out-File $watchdogLog -Append -Encoding utf8
        }
    }

    Start-Sleep -Seconds 5
}
