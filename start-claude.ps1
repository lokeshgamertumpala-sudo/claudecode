# PowerShell Launcher for Claude Code with NVIDIA NIM (Complete 4-Model Terminal Access)
param(
    [Parameter(Position=0)]
    [string]$Model = "",
    [switch]$DangerouslySkipPermissions,
    [switch]$Unrestricted,
    [switch]$Boost,
    [switch]$Help
)

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { (Get-Location).Path }

if ($Help -or $Model -in @("-h", "--help", "help")) {
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "   Claude Code -> NVIDIA NIM Launcher Help" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "Usage: .\start-claude.ps1 [Model] [-Unrestricted]" -ForegroundColor Cyan
    Write-Host "`nModels:" -ForegroundColor Yellow
    Write-Host "  ultra    / 5  : NVIDIA Nemotron Ultra 550B MoE (550B MoE, TTFT 0.48s, Fast Reasoning) [DEFAULT]"
    Write-Host "  mistral  / 2  : Mistral Large 4 (1.05T MoE, 52B Active)"
    Write-Host "  step     / 3  : Step 5 Preview (600B MoE, 1M Context Window, Multimodal Reasoning)"
    Write-Host "  minimax  / 4  : MiniMax M3.1 Flash (428B MoE, Ultra-Fast Agentic & Code Specialist)"
    Write-Host "  deepseek / 6  : DeepSeek V4.1 Flash (High-speed reasoning & coding powerhouse)"
    Write-Host "  auto     / 1  : Auto Smart-Failover (Zero API Errors resilience mesh)"
    Write-Host "`nFlags:" -ForegroundColor Yellow
    Write-Host "  -Unrestricted : Run in full autonomous terminal mode (bypasses permission prompts)"
    exit 0
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   Claude Code -> NVIDIA NIM Enterprise Inference" -ForegroundColor Cyan
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
if (-not $litellmCmd) {
    Write-Error "LiteLLM executable not found. Please install it with 'pip install litellm[proxy]'."
    exit 1
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
$proxyReady = $false

$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 2 -ErrorAction Stop
        if ($response.status -eq "healthy") {
            Write-Host "[+] LiteLLM proxy is already running and healthy on port $port (instant reuse <5ms)." -ForegroundColor Green
            $proxyReady = $true
        }
    } catch {
        $proxyReady = $false
    }
}

if (-not $proxyReady) {
    Write-Host "[*] Proxy not running. Spawning detached persistent background daemon..." -ForegroundColor Cyan
    $startProxyScript = Join-Path $ScriptDir "start-proxy.ps1"
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $startProxyScript
    
    # Verify readiness
    for ($i = 0; $i -lt 10; $i++) {
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 2 -ErrorAction Stop
            if ($resp.status -eq "healthy") {
                $proxyReady = $true
                break
            }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }
    
    if (-not $proxyReady) {
        Write-Error "LiteLLM proxy failed to start. Check logs or config.yaml."
        exit 1
    }
    Write-Host "[+] Proxy is up and ready! Model: NVIDIA Nemotron Ultra 550B MoE (nvidia/nemotron-3-ultra-550b-a55b)" -ForegroundColor Green
}

# 5. Resolve or switch active model preference across all 5 flagship models
$activeModelPath = Join-Path $ScriptDir "active_model.txt"

$validModelTriggers = @(
    "1", "2", "3", "4", "5", "6", "7",
    "auto", "smart",
    "mistral", "mistral-large", "mistral-large-4", "mistral-4",
    "step", "step-5", "step5", "step-5-preview",
    "minimax", "m3.1", "minimax-m3.1", "m3.1-flash", "minimax-m3.1-flash",
    "ultra", "nemotron", "nemotron-ultra", "nemotron-ultra-550b", "ultra-550b",
    "deepseek", "deepseek-flash", "deepseek-v4.1", "deepseek-v4.1-flash", "flash",
    "laguna", "poolside",
    "kimi", "kimi-k3",
    "boost", "turbo", "fast"
)

$promptFromModelParam = $null
if ($Model) {
    if ($validModelTriggers -contains $Model.ToLower().Trim()) {
        # User passed a recognized model directly in terminal command line
        python "$ScriptDir\select_model.py" $Model
    } else {
        # Positional parameter is actually a prompt or flag for Claude Code
        $promptFromModelParam = $Model
    }
}

$activeModel = "nvidia/nemotron-3-ultra-550b-a55b"
if (Test-Path $activeModelPath) {
    $raw = (Get-Content $activeModelPath -Raw).Trim()
    if ($raw) { $activeModel = $raw }
}

$modelDisplayNames = @{
    "auto" = "Auto Smart-Failover (Zero API Errors)"
    "1" = "Auto Smart-Failover (Zero API Errors)"
    "mistralai/mistral-large-4-1t-a52b" = "Mistral Large 4 (1.05T MoE)"
    "mistral-large-4" = "Mistral Large 4 (1.05T MoE)"
    "mistral" = "Mistral Large 4 (1.05T MoE)"
    "2" = "Mistral Large 4 (1.05T MoE)"
    "stepfun-ai/step-5-preview" = "Step 5 Preview (600B MoE)"
    "step-5-preview" = "Step 5 Preview (600B MoE)"
    "step" = "Step 5 Preview (600B MoE)"
    "3" = "Step 5 Preview (600B MoE)"
    "minimaxai/minimax-m3.1-flash" = "MiniMax M3.1 Flash (428B MoE)"
    "minimax-m3.1-flash" = "MiniMax M3.1 Flash (428B MoE)"
    "minimax" = "MiniMax M3.1 Flash (428B MoE)"
    "4" = "MiniMax M3.1 Flash (428B MoE)"
    "nvidia/nemotron-3-ultra-550b-a55b" = "NVIDIA Nemotron Ultra 550B MoE"
    "nemotron-ultra" = "NVIDIA Nemotron Ultra 550B MoE"
    "ultra" = "NVIDIA Nemotron Ultra 550B MoE"
    "5" = "NVIDIA Nemotron Ultra 550B MoE"
    "deepseek-ai/deepseek-v4.1-flash" = "DeepSeek V4.1 Flash"
    "deepseek-v4.1-flash" = "DeepSeek V4.1 Flash"
    "deepseek" = "DeepSeek V4.1 Flash"
    "6" = "DeepSeek V4.1 Flash"
    "poolside/laguna-xs-2.1" = "Poolside Laguna XS 2.1"
    "laguna" = "Poolside Laguna XS 2.1"
    "7" = "Poolside Laguna XS 2.1"
    "moonshotai/kimi-k3" = "Mistral Large 4 (1.05T MoE)"
    "kimi" = "Mistral Large 4 (1.05T MoE)"
    "kimi-k3" = "Mistral Large 4 (1.05T MoE)"
    "nvidia/nemotron-3-super-120b-a12b" = "NVIDIA Nemotron Ultra 550B MoE"
    "nemotron-3-super-120b-a12b" = "NVIDIA Nemotron Ultra 550B MoE"
}

$activeLabel = if ($modelDisplayNames.ContainsKey($activeModel.ToLower())) { $modelDisplayNames[$activeModel.ToLower()] } else { $activeModel }

# Sync Claude Code settings so the real model label is displayed
python "$ScriptDir\select_model.py" $activeModel > $null 2>&1

# 6. Set Claude Code environment variables (routed locally to NVIDIA NIM)
$targetModel = "claude-sonnet-5"
$env:ANTHROPIC_BASE_URL = "http://127.0.0.1:$port"
$env:ANTHROPIC_API_KEY = "sk-litellm-proxy-key"
Remove-Item env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $null, "Process")
$env:ANTHROPIC_MODEL = $targetModel
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = $targetModel
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = $targetModel
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = $targetModel
$env:ANTHROPIC_CUSTOM_MODEL_OPTION = $targetModel
$env:ANTHROPIC_CUSTOM_MODEL_OPTION_NAME = $activeLabel
$env:ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION = "$activeLabel via local NIM proxy"
$env:CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT = "1"
Remove-Item env:CLAUDE_CODE_EFFORT_LEVEL -ErrorAction SilentlyContinue
[Environment]::SetEnvironmentVariable("CLAUDE_CODE_EFFORT_LEVEL", $null, "Process")
$env:CLAUDE_CODE_WORKFLOWS = "1"
$env:MAX_THINKING_TOKENS = "1024"
$env:ANTHROPIC_MAX_TOKENS = "8192"
$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "8192"
$env:CLAUDE_ENABLE_STREAM_WATCHDOG = "0"
$env:CLAUDE_ENABLE_BYTE_WATCHDOG = "0"
$env:CLAUDE_STREAM_IDLE_TIMEOUT_MS = "1800000"
$env:CLAUDE_BYTE_STREAM_IDLE_TIMEOUT_MS = "1800000"
$env:CLAUDE_STREAM_FIRST_BYTE_TIMEOUT_MS = "600000"
$env:CLAUDE_CODE_DISABLE_THINKING_LIMIT = "1"
$env:CLAUDE_CODE_WEBSEARCH_USE_CCR_PROXY = "1"
$env:CLAUDE_CODE_WEBFETCH_USE_CCR_PROXY = "1"

if ($Boost) {
    $Unrestricted = $true
}

$modeHeader = if ($Boost) { "TURBO BOOST ACCELERATED" } else { "RAPID EXECUTION" }
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Launching Claude Code [$modeHeader] ($activeLabel)..." -ForegroundColor Green
Write-Host "Engine: $activeLabel on NVIDIA NIM" -ForegroundColor Gray
Write-Host "Reasoning: $(if ($Boost) { 'TURBO BOOST (1024 snappy thinking budget)' } else { 'RAPID EXECUTION (1024 high-speed thinking budget, <10s reasoning)' })" -ForegroundColor Magenta
Write-Host "Workflows: ENABLED (Dynamic multi-agent orchestration)" -ForegroundColor Magenta
Write-Host "Streaming: 100% Active (Native Thinking & Real-Time Seconds Timer)" -ForegroundColor Gray
Write-Host "====================================================`n" -ForegroundColor Cyan

$claudeArgs = @("--model", $targetModel)
if ($DangerouslySkipPermissions -or $Unrestricted) {
    $claudeArgs += "--dangerously-skip-permissions"
}
if ($promptFromModelParam) {
    $claudeArgs += $promptFromModelParam
}
if ($args.Count -gt 0) {
    $claudeArgs += $args
}

& $claudeCmd $claudeArgs
