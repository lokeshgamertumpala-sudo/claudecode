# Autonomous Runner for Claude Code - Built to run for hours/days without stopping
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "====================================================" -ForegroundColor Magenta
Write-Host "   Claude Code AUTONOMOUS RUNNER (Unrestricted Mode)" -ForegroundColor Magenta
Write-Host "====================================================" -ForegroundColor Magenta

# 1. Start Watchdog if not already running
$watchdogRunning = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%proxy-watchdog.ps1%'" -ErrorAction SilentlyContinue
if (-not $watchdogRunning) {
    Write-Host "[*] Launching 24/7 Self-Healing Proxy Watchdog..." -ForegroundColor Cyan
    $watchdogScript = Join-Path $ScriptDir "proxy-watchdog.ps1"
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$watchdogScript`""
    Start-Sleep -Seconds 2
}

# 2. Verify proxy readiness
$port = 4000
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health/readiness" -TimeoutSec 1 -ErrorAction Stop
        if ($resp.status -eq "healthy") { $ready = $true; break }
    } catch {
        Start-Sleep -Milliseconds 500
    }
}

if (-not $ready) {
    Write-Error "Could not connect to local proxy. Please check your .env file."
    exit 1
}
Write-Host "[+] Self-healing proxy is online and healthy on port $port." -ForegroundColor Green

# 3. Locate Claude CLI (instant fast-path)
$claudeCandidate = "C:\Users\NEW\AppData\Roaming\npm\claude.cmd"
if (Test-Path $claudeCandidate) {
    $claudeCmd = $claudeCandidate
} else {
    $cmdClaude = Get-Command claude.cmd -ErrorAction SilentlyContinue
    $claudeCmd = if ($cmdClaude) { $cmdClaude.Source } else { "claude" }
}

# 4. Configure Protocol & Active Backend Engine
$activeModelFile = Join-Path $ScriptDir "active_model.txt"
$backendEngine = "auto"
if (Test-Path $activeModelFile) {
    $raw = (Get-Content $activeModelFile -Raw).Trim()
    if ($raw) { $backendEngine = $raw }
}

# Use standard Claude protocol model so Claude Code CLI runs without unrecognized_model warnings
$chosenModel = "claude-sonnet-4-5"

# Set Environment Variables for Current Process
$env:ANTHROPIC_BASE_URL = "http://127.0.0.1:$port"
$env:ANTHROPIC_API_KEY = "sk-litellm-proxy-key"

# Unset ANTHROPIC_AUTH_TOKEN for process to avoid conflict warning (never touch User registry to prevent WM_SETTINGCHANGE hangs)
Remove-Item env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $null, "Process")

$env:ANTHROPIC_MODEL = $chosenModel
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = $chosenModel
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = $chosenModel
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = $chosenModel
$env:ANTHROPIC_CUSTOM_MODEL_OPTION = $chosenModel
$env:ANTHROPIC_CUSTOM_MODEL_OPTION_NAME = "NVIDIA Nemotron 120B"
$env:ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION = "NVIDIA Nemotron 3 Super 120B via local NIM proxy"
$env:CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT = "1"

# 5. Autonomous Flags:
# --dangerously-skip-permissions: Never blocks or waits for user keystrokes on shell commands/file edits
# --autocompact auto: Automatically prunes and manages token context over long multi-hour runs
# --model: Explicitly passes the chosen model so Claude Code UI reflects your selection immediately
$baseFlags = @("--dangerously-skip-permissions", "--autocompact", "auto", "--model", $chosenModel)

Write-Host "`n[+] Configuration Active:" -ForegroundColor Cyan
Write-Host "    - Permissions: Auto-Approved (Unrestricted Overnight Mode)" -ForegroundColor Gray
Write-Host "    - Context Window: Auto-Compacted for infinite multi-day runs" -ForegroundColor Gray
Write-Host "    - Protocol Model: $chosenModel" -ForegroundColor Green
Write-Host "    - Inference Engine: NVIDIA Nemotron 120B (nvidia/nemotron-3-super-120b-a12b)" -ForegroundColor Green
Write-Host "    - Proxy: Self-Healing 24/7 Daemon Active on port $port`n" -ForegroundColor Gray

Write-Host "====================================================" -ForegroundColor Magenta
Write-Host "Starting Claude Code Session ($chosenModel via Nemotron 120B)..." -ForegroundColor Green
Write-Host "====================================================`n" -ForegroundColor Magenta

if ($args.Count -gt 0) {
    & $claudeCmd @baseFlags $args
} else {
    & $claudeCmd @baseFlags
}
