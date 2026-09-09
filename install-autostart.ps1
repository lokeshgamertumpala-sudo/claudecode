# Registers Claude Code Proxy Daemon to start automatically on Windows boot/login
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsPath = Join-Path $ScriptDir "launch-silent.vbs"
$startupFolder = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupFolder "ClaudeCodeProxy.lnk"

try {
    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "wscript.exe"
    $shortcut.Arguments = "`"$vbsPath`""
    $shortcut.WorkingDirectory = $ScriptDir
    $shortcut.Description = "Starts Claude Code LiteLLM Proxy Daemon automatically"
    $shortcut.Save()
    Write-Host "[+] Successfully installed to Windows Startup:" -ForegroundColor Green
    Write-Host "    $shortcutPath" -ForegroundColor Cyan
    Write-Host "[+] The proxy will now run automatically in the background whenever Windows starts." -ForegroundColor Green
} catch {
    Write-Error "Failed to create startup shortcut: $_"
}
