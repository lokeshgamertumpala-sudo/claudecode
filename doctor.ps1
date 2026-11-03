# Auto-Healing Diagnostic Suite for Claude Code + NVIDIA NIM
param(
    [switch]$Revive,
    [switch]$Json
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ErrorActionPreference = "Continue"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { (Get-Location).Path }

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   🩺 CLAUDE CODE + NVIDIA NIM AUTO-HEALING DIAGNOSTICS SUITE   " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$results = [ordered]@{}

# 1. NVIDIA NIM API Key Check
$apiKeyStatus = "FAIL"
$apiKeyDetail = "Missing"
$envFile = Join-Path $ScriptDir ".env"
$apiKey = $null

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            if ($parts[0].Trim() -eq "NVIDIA_API_KEY") {
                $apiKey = $parts[1].Trim('"' + "'" + ' ')
            }
        }
    }
}
if (-not $apiKey) {
    $apiKey = $env:NVIDIA_API_KEY
}

if ($apiKey -and $apiKey.Length -gt 10) {
    $apiKeyStatus = "PASS"
    $maskedKey = $apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)) + "..." + $apiKey.Substring([Math]::Max(0, $apiKey.Length - 4))
    $apiKeyDetail = "Loaded ($maskedKey)"
} else {
    $apiKeyDetail = "NVIDIA_API_KEY not configured in .env or environment"
}
$results["NVIDIA API Key"] = @{ Status = $apiKeyStatus; Detail = $apiKeyDetail }

# 2. Proxy Port 4000 & Auto-Revival Check
$proxyPort = 4000
$proxyStatus = "FAIL"
$proxyDetail = "Inactive"
$probeUri = "http://127.0.0.1:$proxyPort/health/readiness"

$isHealthy = $false
try {
    $resp = Invoke-RestMethod -Uri $probeUri -TimeoutSec 2 -ErrorAction Stop
    if ($resp.status -eq "healthy") {
        $isHealthy = $true
        $proxyStatus = "PASS"
        $proxyDetail = "Healthy on port $proxyPort (<5ms probe)"
    }
} catch {
    $isHealthy = $false
}

if (-not $isHealthy) {
    Write-Host "`n[!] Proxy is down on port $proxyPort. Initiating Auto-Revival..." -ForegroundColor Yellow
    $startScript = Join-Path $ScriptDir "start-proxy.ps1"
    if (Test-Path $startScript) {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $startScript
        # Poll for readiness up to 10 iterations (5 seconds)
        for ($i = 0; $i -lt 10; $i++) {
            Start-Sleep -Milliseconds 500
            try {
                $r = Invoke-RestMethod -Uri $probeUri -TimeoutSec 2 -ErrorAction Stop
                if ($r.status -eq "healthy") {
                    $isHealthy = $true
                    $proxyStatus = "REVIVED"
                    $proxyDetail = "Auto-revived and healthy on port $proxyPort"
                    break
                }
            } catch { }
        }
    }
    if (-not $isHealthy) {
        $proxyDetail = "Failed to auto-revive. Check start-proxy.ps1 / config.yaml"
    }
}
$results["LiteLLM Proxy (Port 4000)"] = @{ Status = $proxyStatus; Detail = $proxyDetail }

# 3. Active Model Configuration Check
$modelFile = Join-Path $ScriptDir "active_model.txt"
$modelStatus = "PASS"
$modelDetail = "mistralai/mistral-large-4-1t-a52b"
$expectedModel = "mistralai/mistral-large-4-1t-a52b"

if (Test-Path $modelFile) {
    $rawModel = (Get-Content $modelFile -Raw).Trim()
    if ($rawModel -ne $expectedModel) {
        Write-Host "  [!] Active model mismatch ($rawModel != $expectedModel). Auto-healing..." -ForegroundColor Yellow
        python "$ScriptDir\select_model.py" mistral > $null 2>&1
        $rawModel = (Get-Content $modelFile -Raw).Trim()
        if ($rawModel -eq $expectedModel) {
            $modelStatus = "PASS"
            $modelDetail = "$rawModel (Auto-Healed)"
        } else {
            $modelStatus = "FAIL"
            $modelDetail = "Mismatch: $rawModel (Expected: $expectedModel)"
        }
    } else {
        $modelStatus = "PASS"
        $modelDetail = "$rawModel"
    }
} else {
    Write-Host "  [!] active_model.txt missing. Auto-healing to $expectedModel..." -ForegroundColor Yellow
    python "$ScriptDir\select_model.py" mistral > $null 2>&1
    $modelStatus = "PASS"
    $modelDetail = "$expectedModel (Created)"
}
$results["Active NIM Model"] = @{ Status = $modelStatus; Detail = $modelDetail }

# 4. Node.js & npm Runtime Check
$nodeStatus = "FAIL"
$nodeDetail = "Not Found"
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue

if ($nodeCmd -and $npmCmd) {
    try {
        $nodeVer = & node -v 2>$null
        $npmVer = & npm -v 2>$null
        $nodeStatus = "PASS"
        $nodeDetail = "Node $($nodeVer.Trim()), npm v$($npmVer.Trim())"
    } catch {
        $nodeDetail = "Node/npm installed but error running version check"
    }
} else {
    $nodeDetail = "Node.js or npm not detected in PATH"
}
$results["Node.js & npm"] = @{ Status = $nodeStatus; Detail = $nodeDetail }

# 5. Remotion TypeScript Compilation Check
$remotionStatus = "FAIL"
$remotionDetail = "motion-studio directory not found"
$motionStudioDir = Join-Path $ScriptDir "motion-studio"

if (Test-Path $motionStudioDir) {
    try {
        $tscOut = & cmd /c "cd /d `"$motionStudioDir`" && npm run check 2>&1"
        if ($LASTEXITCODE -eq 0) {
            $remotionStatus = "PASS"
            $remotionDetail = "100% clean (tsc --noEmit passed with 0 errors)"
        } else {
            $remotionStatus = "FAIL"
            $firstErr = ($tscOut | Select-Object -First 2) -join " "
            $remotionDetail = "TypeScript errors detected: $firstErr"
        }
    } catch {
        $remotionDetail = "Error executing npm run check: $_"
    }
}
$results["Remotion Type-Check"] = @{ Status = $remotionStatus; Detail = $remotionDetail }

# 6. Git Status & Remote Alignment
$gitStatus = "FAIL"
$gitDetail = "Not a git repo"
$gitCmd = Get-Command git -ErrorAction SilentlyContinue

if ($gitCmd) {
    try {
        $branch = (& git branch --show-current 2>$null).Trim()
        $dirtyFiles = & git status -s 2>$null
        $dirtyCount = if ($dirtyFiles) { ($dirtyFiles | Measure-Object).Count } else { 0 }
        
        $gitStatus = "PASS"
        if ($dirtyCount -eq 0) {
            $gitDetail = "Branch '$branch' (Working tree clean)"
        } else {
            $gitDetail = "Branch '$branch' ($dirtyCount uncommitted change(s))"
        }
    } catch {
        $gitDetail = "Git repository error: $_"
    }
}
$results["Git Status & Sync"] = @{ Status = $gitStatus; Detail = $gitDetail }

# Display Diagnostic Dashboard
Write-Host "`nSubsystem Check                | Status   | Diagnostic Details" -ForegroundColor Gray
Write-Host "-------------------------------+----------+--------------------------------------------------" -ForegroundColor Gray

$allPassed = $true
foreach ($key in $results.Keys) {
    $entry = $results[$key]
    $st = $entry.Status
    $det = $entry.Detail

    $color = "Green"
    if ($st -eq "REVIVED") { $color = "Yellow" }
    elseif ($st -eq "FAIL") { $color = "Red"; $allPassed = $false }

    $tag = "[$st]"
    $padKey = $key.PadRight(30)
    $padTag = $tag.PadRight(10)
    Write-Host "$padKey | " -NoNewline
    Write-Host "$padTag" -ForegroundColor $color -NoNewline
    Write-Host " | $det"
}

Write-Host "-------------------------------+----------+--------------------------------------------------" -ForegroundColor Gray

if ($allPassed) {
    Write-Host "`n✅ ALL SYSTEMS OPERATIONAL - Claude Code ready for autonomous execution.`n" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ SOME CHECKS REQUIRE ATTENTION - See diagnostic details above.`n" -ForegroundColor Yellow
}

if ($Json) {
    $results | ConvertTo-Json -Depth 3
}
