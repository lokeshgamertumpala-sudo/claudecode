---
description: Clean temporary files, build caches, test artifacts, and orphaned logs
---

# 🧹 Workspace Cleanup Protocol (/clean)

Target / Scope: $ARGUMENTS

You are operating under the **Clean Workspace Protocol**.
Your goal is to inspect and remove all transient artifacts, compiler caches, temporary logs, and build debris while strictly preserving core source code and configurations.

---

## ⚡ 1. Cleanup Checklist

Execute the following cleanup tasks:

### A. Python Bytecode & Caches
Remove all `__pycache__` directories, `*.pyc`, `*.pyo`, and `.pytest_cache`:
```powershell
Get-ChildItem -Path . -Include __pycache__, .pytest_cache -Recurse -Directory -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
Get-ChildItem -Path . -Include *.pyc, *.pyo -Recurse -File -Force -ErrorAction SilentlyContinue | Remove-Item -Force
```

### B. Remotion & Node Build Caches
Clean temporary frame caches in `motion-studio/.remotion/`:
```powershell
if (Test-Path "motion-studio\.remotion") { Remove-Item -Path "motion-studio\.remotion" -Recurse -Force -ErrorAction SilentlyContinue }
```

### C. Temporary Logs
Clean transient proxy log outputs older than today or truncated stderr logs:
```powershell
Get-ChildItem -Path . -Include proxy-stderr.log, proxy-stdout.log -File -Force -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.Length -gt 10MB) { Clear-Content $_.FullName }
}
```

---

## 📋 2. Verification

Run `git status -s` to confirm no unintended deletions occurred and display a summary of cleaned items and reclaimed disk space.
