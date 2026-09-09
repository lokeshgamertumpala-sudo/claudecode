Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""C:\Users\NEW\OneDrive\Desktop\claudecode\proxy-watchdog.ps1""", 0, False
Set WshShell = Nothing
