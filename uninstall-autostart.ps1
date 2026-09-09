# Removes Claude Code Proxy Daemon from Windows Startup
$startupFolder = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupFolder "ClaudeCodeProxy.lnk"

if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Host "[+] Removed proxy from Windows Startup." -ForegroundColor Green
} else {
    Write-Host "[i] No startup shortcut found." -ForegroundColor Yellow
}
