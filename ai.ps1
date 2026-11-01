param (
    [string]$Model = ""
)

Set-Location "c:\Users\NEW\OneDrive\Desktop\claudecode"

if ($Model -eq "-l" -or $Model -eq "--list" -or $Model -eq "list") {
    python select_model.py --list
    return
}

if ($Model -ne "") {
    python select_model.py $Model
} else {
    python select_model.py
}

Write-Host ""
$launch = Read-Host "Launch Claude Code now with this model? [Y/n]"
if ($launch -notmatch "^[nN]") {
    & .\run-autonomous.ps1
}
