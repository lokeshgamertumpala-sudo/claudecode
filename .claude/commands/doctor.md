---
description: Real-time system diagnostic report and auto-healing verification
---

# 🩺 System Diagnostics & Health Suite (/doctor)

Arguments: $ARGUMENTS

You are operating under the **Auto-Healing Diagnostics Protocol**.
Your goal is to inspect all critical environment components, verify proxy readiness, validate API keys, test Remotion TypeScript compilation, check Git sync, and auto-revive any inactive background processes.

---

## ⚡ 1. Execution Procedure

Run the repository's dedicated doctor diagnostic suite:
```cmd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File doctor.ps1
```

The diagnostic suite automatically tests:
1. **NVIDIA NIM API Key**: Verifies key existence and format in `.env` / environment.
2. **LiteLLM Proxy Health (Port 4000)**: Probes `/health/readiness` (<5ms probe) and automatically spawns a background daemon if stopped.
3. **Active Model Selection**: Reports active model slug and friendly name from `active_model.txt`.
4. **Node.js & npm Runtime**: Verifies installed Node and npm binaries.
5. **Remotion TypeScript Compilation**: Runs `npm run check` (`tsc --noEmit`) in `motion-studio`.
6. **Git Status & Sync**: Checks uncommitted files and branch alignment with `origin/main`.

---

## 📋 2. Diagnostics Report

Display the diagnostic output table with color-coded status for each subsystem.
If any component requires user attention (e.g. missing API key), provide exact remediation steps.
