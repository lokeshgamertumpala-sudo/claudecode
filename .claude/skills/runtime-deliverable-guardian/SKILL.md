---
name: runtime-deliverable-guardian
description: Guarantees zero blank-screen browser failures, zero file:// CORS traps, zero runaway orphaned background dev processes, and 1-click frictionless execution for web apps, games, and UI deliverables.
---

# 🛡️ Runtime Deliverable & Process Guardian

This skill prevents the 4 fatal failure modes that cause web deliverables, prototypes, and user interfaces to fail upon delivery:
1. **The Blank Screen / CORS Trap** (opening `file://.../index.html` yields an empty white page).
2. **Absolute Root Path Failure** (`/assets/...` or `/src/...` resolving to drive root `C:\`).
3. **The "Folder In Use" Process Orphanage Trap** (background Vite/Node/Webpack processes left running, locking directories on Windows).
4. **The Frictionless 1-Click Deliverable Standard** (user should never have to manually type CLI commands to view a deliverable).

---

## 🛑 Rule 1: Zero Blank-Screen Browser Failures

When building web applications, single-page apps (React, Vue, Svelte, Vanilla), or canvas games:
- **NEVER** leave raw `<script type="module" src="/src/main.jsx">` in production HTML. Browsers cannot parse uncompiled JSX and will block unbundled ES modules on `file://` protocols.
- **Relative Path Mandate**: In `vite.config.js`, always configure `base: './'`. In HTML, always use relative paths:
  ```html
  <!-- CORRECT -->
  <script src="./dist/bundle.js"></script>
  <link rel="stylesheet" href="./dist/styles.css">

  <!-- FORBIDDEN (Resolves to C:\assets\... on local disk) -->
  <script src="/assets/app.js"></script>
  ```
- **Single-Page Routing**: For local apps, use `HashRouter` instead of `BrowserRouter` so routes work without requiring server-side URL rewriting or crashing on `file:///C:/...`.

---

## ⚡ Rule 2: The 1-Click Deliverable Standard

For every frontend app, game, or prototype created:
1. **Always Supply a 1-Click Batch Launcher**:
   - Provide `launch-<app>.bat` (or `play-game.bat`).
   - The launcher should spin up a lightweight local server (e.g. `python -m http.server <port>` or `npx vite preview`) and immediately launch the default browser:
     ```cmd
     @echo off
     setlocal
     cd /d "%~dp0"
     echo Starting local server on http://localhost:5173...
     start "" "http://localhost:5173"
     python -m http.server 5173
     ```
2. **Alternatively, Provide a True Standalone Build**:
   - Bundle into an IIFE (`format: 'iife'`) with inlined or relative assets so double-clicking `index.html` renders immediately with zero server required.

---

## 🔒 Rule 3: Single-Instance Process Discipline & Clean Teardown

Never leave background dev processes running untracked:
- **Check Before Launch**: Before starting a dev server, probe if the target port is already occupied.
- **Never Cascade Multiple Instances**: If port 3000 is occupied, do NOT let Vite cascade through 3001, 3002, 3003, 3004. Find the stale process and terminate it.
- **Process-Tree Termination**: Clean stale dev processes using full process-tree termination:
  ```powershell
  taskkill /F /T /PID <PID>
  ```
- **No Background Zombie Processes**: When doing test builds or smoke tests, ensure child processes are terminated immediately upon test completion.

---

## 🔍 Verification Protocol

Run the deliverable auditor anytime you create or modify a web app:
```bash
python .agents/skills/runtime-deliverable-guardian/scripts/audit_deliverable.py <target_directory>
```
Ensure 0 errors and 0 process locks before presenting work to the user.
