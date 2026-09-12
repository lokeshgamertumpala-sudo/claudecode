# PowerShell Launcher for Claude Code with NVIDIA NIM (Nemotron 120B)
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   Claude Code -> NVIDIA NIM (Nemotron 120B)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Load .env file if present
$envFile = Join-Path $ScriptDir ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $varName = $parts[0].Trim()
            $varVal = $parts[1].Trim()
            [Environment]::SetEnvironmentVariable($varName, $varVal, "Process")
        }
    }
    if ($env:NVIDIA_API_KEY) {
        $env:NVIDIA_NIM_API_KEY = $env:NVIDIA_API_KEY
    }
}

# 2. Check NVIDIA API key
if (-not $env:NVIDIA_API_KEY) {
    Write-Host "`n[!] NVIDIA API key not detected." -ForegroundColor Yellow
    Write-Host "You can get an API key from https://build.nvidia.com" -ForegroundColor Gray
    
    $secureKey = Read-Host -Prompt "Enter your NVIDIA API Key (nvapi-...)" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
    $plainKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    
    if (-not $plainKey) {
        Write-Error "No API key provided. Exiting."
        exit 1
    }
    
    $env:NVIDIA_API_KEY = $plainKey
    
    $savePrompt = Read-Host "Save API key to .env for future sessions? (Y/N)"
    if ($savePrompt -match "^[yY]") {
        "NVIDIA_API_KEY=$plainKey" | Out-File -FilePath $envFile -Encoding utf8
        Write-Host "[+] Key saved to .env (protected by .gitignore)" -ForegroundColor Green
    }
}

# 3. Locate LiteLLM and Claude
$pythonScripts = "C:\Users\NEW\AppData\Local\Python\pythoncore-3.14-64\Scripts"
$cmdLite = Get-Command litellm -ErrorAction SilentlyContinue
$litellmCmd = if ($cmdLite) { $cmdLite.Source } else { $null }
if (-not $litellmCmd) {
    $litellmCandidate = Join-Path $pythonScripts "litellm.exe"
    if (Test-Path $litellmCandidate) {
        $litellmCmd = $litellmCandidate
    } else {
        Write-Error "LiteLLM executable not found. Please install it with 'pip install litellm[proxy]'."
        exit 1
    }
}

$cmdClaude = Get-Command claude.cmd -ErrorAction SilentlyContinue
$claudeCmd = if ($cmdClaude) { $cmdClaude.Source } else { $null }
if (-not $claudeCmd) {
    $claudeCandidate = "C:\Users\NEW\AppData\Roaming\npm\claude.cmd"
    if (Test-Path $claudeCandidate) {
        $claudeCmd = $claudeCandidate
    } else {
        $claudeCmd = "claude"
    }
}

# 4. Check if proxy is already running on port 4000
$port = 4000
$proxyStartedByUs = $false
$proxyReady = $false

$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 3 -ErrorAction Stop
        if ($response.status -eq "healthy") {
            Write-Host "[+] LiteLLM proxy is already running and healthy on port $port." -ForegroundColor Green
            $proxyReady = $true
        }
    } catch {
        $proxyReady = $false
    }
}

if (-not $proxyReady) {
    # Clean any stale process holding the port
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        $conns | ForEach-Object {
            $pId = $_.OwningProcess
            if ($pId -gt 0 -and $pId -ne $PID) { cmd.exe /c "taskkill /F /T /PID $pId" 2>$null }
        }
    }
    $stale = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%litellm%'" -ErrorAction SilentlyContinue
    if ($stale) {
        $stale | ForEach-Object {
            if ($_.ProcessId -ne $PID) { cmd.exe /c "taskkill /F /T /PID $($_.ProcessId)" 2>$null }
        }
    }
    Start-Sleep -Seconds 1

    Write-Host "[*] Starting LiteLLM proxy with high-speed NIM routing..." -ForegroundColor Cyan
    $env:PYTHONUTF8 = "1"
    $env:PYTHONIOENCODING = "utf-8"
    $configFile = Join-Path $ScriptDir "config.yaml"
    
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $litellmCmd
    $psi.Arguments = "--config `"$configFile`" --port $port --host 127.0.0.1"
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.EnvironmentVariables["PYTHONUTF8"] = "1"
    $psi.EnvironmentVariables["PYTHONIOENCODING"] = "utf-8"
    $psi.EnvironmentVariables["NVIDIA_API_KEY"] = $env:NVIDIA_API_KEY
    $psi.EnvironmentVariables["NVIDIA_NIM_API_KEY"] = $env:NVIDIA_API_KEY
    
    $proxyProcess = [System.Diagnostics.Process]::Start($psi)
    $proxyStartedByUs = $true
    
    Write-Host "Waiting for proxy to be ready..." -NoNewline
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 500
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 1 -ErrorAction Stop
            if ($resp.status -eq "healthy") {
                $proxyReady = $true
                break
            }
        } catch {
            Write-Host "." -NoNewline
        }
    }
    Write-Host ""
    
    if (-not $proxyReady) {
        Write-Error "LiteLLM proxy failed to start within timeout. Check logs or config.yaml."
        if ($proxyStartedByUs -and $proxyProcess -and -not $proxyProcess.HasExited) {
            cmd.exe /c "taskkill /F /T /PID $($proxyProcess.Id)" 2>$null
        }
        exit 1
    }
    Write-Host "[+] Proxy is up and ready! Model: NVIDIA Nemotron 120B (nvidia/nemotron-3-super-120b-a12b)" -ForegroundColor Green
}

# 5. Set active model preference (Auto Smart-Failover: Nemotron 120B 0.5s sub-second + DeepSeek Flash high-capacity)
$activeModelPath = Join-Path $ScriptDir "active_model.txt"
if (-not (Test-Path $activeModelPath) -or (Get-Content $activeModelPath).Trim() -eq "") {
    "auto" | Out-File -FilePath $activeModelPath -Encoding utf8
}

# 6. Set Claude Code environment variables (routed locally to NVIDIA NIM)
$targetModel = "claude-sonnet-4-5"
$env:ANTHROPIC_BASE_URL = "http://127.0.0.1:$port"
$env:ANTHROPIC_API_KEY = "sk-litellm-proxy-key"
Remove-Item env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $null, "Process")
$env:ANTHROPIC_MODEL = $targetModel
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = $targetModel
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = $targetModel
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = $targetModel
$env:ANTHROPIC_CUSTOM_MODEL_OPTION = $targetModel
$env:ANTHROPIC_CUSTOM_MODEL_OPTION_NAME = "NVIDIA Nemotron 120B"
$env:ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION = "NVIDIA Nemotron 3 Super 120B via local NIM proxy"
$env:CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT = "1"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Launching Claude Code with High-Speed NIM Engine..." -ForegroundColor Green
Write-Host "Routing: Auto Smart-Failover (Nemotron 120B + DeepSeek Flash)" -ForegroundColor Gray
Write-Host "Streaming: 100% Active (Native Thinking & Real-Time Seconds Timer)" -ForegroundColor Gray
Write-Host "====================================================`n" -ForegroundColor Cyan

$claudeArgs = @("--model", $targetModel)
if ($args.Count -gt 0) {
    $claudeArgs += $args
}

& $claudeCmd $claudeArgs
