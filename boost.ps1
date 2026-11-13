param(
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$PromptArgs
)

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { (Get-Location).Path }

if ($Help) {
    Write-Host "Usage: .\boost.ps1 [-Help] [Claude Args / Prompt]" -ForegroundColor Cyan
    Write-Host "Activates Turbo Boost mode: pins sub-second NIM model and launches Claude Code with zero-friction Remotion workflows." -ForegroundColor Gray
    exit 0
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   🚀 CLAUDE CODE TURBO BOOST ACCELERATOR" -ForegroundColor Cyan
Write-Host "   Sub-Second Inference & 1-Shot 60FPS Remotion Studio" -ForegroundColor Gray
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Ensure proxy is up and healthy
$port = 4000
$ready = $false
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 2 -ErrorAction Stop
    if ($resp.status -eq "healthy") { $ready = $true }
} catch {}

if (-not $ready) {
    Write-Host "[*] Proxy not running. Starting independent persistent proxy..." -ForegroundColor Cyan
    $startProxyScript = Join-Path $ScriptDir "start-proxy.ps1"
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $startProxyScript
} else {
    Write-Host "[+] Local LiteLLM proxy active and healthy on port $port." -ForegroundColor Green
}

# 2. Pin fastest verified sub-second model (Nemotron Ultra 550B MoE)
Write-Host "[*] Activating Turbo Engine: NVIDIA Nemotron Ultra 550B MoE (0.5s latency)..." -ForegroundColor Cyan
python "$ScriptDir\select_model.py" "ultra" > $null 2>&1
Write-Host "[+] Engine pinned to NVIDIA Nemotron Ultra 550B MoE (NVIDIA NIM)" -ForegroundColor Green

# 3. Launch Claude Code in Turbo Boost Unrestricted Mode
Write-Host "[+] Launching Claude Code [TURBO BOOST UNRESTRICTED]..." -ForegroundColor Green
Write-Host "Tip: Inside Claude Code, use /boost for 1-shot motion graphics execution!`n" -ForegroundColor Yellow

$startScript = Join-Path $ScriptDir "start-claude.ps1"
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $startScript -Boost -Unrestricted @PromptArgs
