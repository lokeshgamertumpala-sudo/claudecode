# PowerShell wrapper for company intelligence search
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Query
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pyScript = Join-Path $ScriptDir "company_search.py"
python $pyScript $Query
