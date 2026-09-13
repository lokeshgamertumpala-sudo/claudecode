param(
    [Parameter(Position=0)]
    [string]$Target = ""
)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($Target) {
    python "$ScriptDir\select_model.py" $Target
} else {
    python "$ScriptDir\select_model.py"
}
