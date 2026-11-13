# 🚀 Claude Code with NVIDIA NIM: Complete Setup Guide (Windows & macOS)

A complete, production-grade guide to setting up and running **Claude Code CLI** powered by **NVIDIA NIM Enterprise Inference** through a local LiteLLM proxy with native multi-source web search, autonomous execution, and zero Anthropic API key requirements.

---

## 📑 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Prerequisites](#-prerequisites)
  - [Windows](#windows-prerequisites)
  - [macOS (MacBook M1/M2/M3/M4 & Intel)](#macos-macbook-prerequisites)
- [API Key Setup](#-api-key-setup)
- [Windows Quickstart](#-windows-quickstart)
- [macOS (MacBook) Quickstart](#-macos-macbook-quickstart)
- [Model Selection & Roster](#-model-selection--roster)
- [Web Search & Web Fetch Support](#-web-search--web-fetch-support)
- [Troubleshooting & Health Checks](#-troubleshooting--health-checks)

---

## 🏗 Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                    Claude Code CLI                     │
│    (Terminal UI, Workflows, Autonomous Agent Loop)     │
└──────────────────────────┬─────────────────────────────┘
                           │ Anthropic Messages Protocol
                           ▼
┌────────────────────────────────────────────────────────┐
│             LiteLLM Local Proxy (:4000)                │
│  - Request Sanitization (sanitize_hook.py)             │
│  - Smart Routing & Fast Cooldown Recovery              │
│  - Worker WebSearch & WebFetch (search_engine.py)      │
└──────────────────────────┬─────────────────────────────┘
                           │ OpenAI/NIM Protocol
                           ▼
┌────────────────────────────────────────────────────────┐
│                  NVIDIA NIM Enterprise                 │
│  - NVIDIA Nemotron 3 Super 120B (~0.3s sub-second)     │
│  - Poolside Laguna XS 2.1 (Software Specialist)        │
│  - DeepSeek V4.1 Flash (Flagship Reasoning)            │
│  - Moonshot AI Kimi-K3 (Deep Multi-Step Logic)         │
└────────────────────────────────────────────────────────┘
```

---

## 🧰 Prerequisites

### Windows Prerequisites

1. **Python 3.10+**: Download from [python.org](https://www.python.org/) or Microsoft Store. (Ensure `Add Python to PATH` is checked).
2. **Node.js 18+ & npm**: Download from [nodejs.org](https://nodejs.org/).
3. **Claude Code CLI**:
   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```
4. **PowerShell 5.1+** (Built-in on Windows 10/11).

---

### macOS (MacBook) Prerequisites

Compatible with **Apple Silicon (M1, M2, M3, M4)** and **Intel** MacBooks.

1. **Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. **Python 3.10+ & Node.js**:
   ```bash
   brew install python node curl git
   ```
3. **Claude Code CLI**:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
4. Verify installations:
   ```bash
   python3 --version
   node --version
   claude --version
   ```

---

## 🔑 API Key Setup

1. Sign up for a free developer account at [NVIDIA NIM (build.nvidia.com)](https://build.nvidia.com/).
2. Generate an API Key (starts with `nvapi-`).
3. In the project root directory, create a `.env` file:

```bash
# Copy from example
cp .env.example .env
```

Edit `.env` and paste your key:

```env
NVIDIA_API_KEY=nvapi-your-actual-key-here
```

---

## 🪟 Windows Quickstart

### 1. Install Python Dependencies

Open PowerShell in the project directory:

```powershell
pip install -r requirements.txt
```

### 2. Start the Proxy Daemon

Start the independent 24/7 background proxy (auto-reviving watchdog):

```powershell
powershell -ExecutionPolicy Bypass -File .\start-proxy-independent.ps1
```

Verify readiness:
```powershell
curl http://127.0.0.1:4000/health/readiness
# Returns: {"status":"healthy"}
```

### 3. Launch Claude Code

You have multiple 1-click launchers:

* **Interactive Standard Mode**:
  ```powershell
  .\start-claude.bat
  ```
* **Full Autonomous Unrestricted Mode** (never halts for file edit confirmations):
  ```powershell
  .\run-autonomous.bat
  ```
* **Select Specific Model at Launch**:
  ```powershell
  .\start-claude.ps1 nemotron -Unrestricted
  ```

### 4. Switch Models on Windows

```powershell
.\model.bat nemotron   # NVIDIA Nemotron 3 Super 120B (Recommended)
.\model.bat laguna     # Poolside Laguna XS 2.1 (Fast Coding)
.\model.bat deepseek   # DeepSeek V4.1 Flash
.\model.bat kimi       # Moonshot AI Kimi-K3
.\model.bat auto       # Auto Smart-Failover
```

---

## 🍎 macOS (MacBook) Quickstart

### ⚡ 1-Click Launch (Easiest & Recommended)

You can launch everything (Proxy + Health Checks + Claude Code) in **one single step**:

* **Option A: Double-Click in Finder (Native Mac 1-Click)**
  1. Open the project folder in Finder.
  2. Double-click `launch.command` (or `launch-mac.command`).
  3. Terminal opens automatically, verifies the proxy, tests health, and drops you straight into Claude Code!

* **Option B: Run from Terminal / MacBook Shell**
  ```bash
  chmod +x *.sh *.command
  ./launch.sh
  ```
  *(Or run `bash launch-macbook.bat`)*

---

### Step-by-Step Manual macOS Setup

#### 1. Make Shell Scripts Executable

Open Terminal in the cloned repository directory:

```bash
chmod +x *.sh
```

### 2. Install Python Dependencies

```bash
pip3 install -r requirements.txt
```

*(If using a virtual environment: `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`)*

### 3. Start the Background Proxy

```bash
./start-proxy.sh
```

The script automatically launches LiteLLM in the background, redirects logs to `proxy-stdout.log`, and verifies that `http://127.0.0.1:4000/health/readiness` is responding `200 OK`.

### 4. Launch Claude Code

* **Launch with Recommended Model (Nemotron 120B)**:
  ```bash
  ./start-claude.sh
  ```
* **Launch in Full Autonomous Mode** (bypasses permission prompts):
  ```bash
  ./start-claude.sh -u
  # or
  ./start-claude.sh nemotron --dangerously-skip-permissions
  ```
* **Launch with Specific Model**:
  ```bash
  ./start-claude.sh laguna -u
  ```

### 5. Switch Models on macOS

```bash
./model.sh nemotron   # Switch to Nemotron 120B
./model.sh laguna     # Switch to Poolside Laguna XS
./model.sh deepseek   # Switch to DeepSeek V4.1 Flash
./model.sh kimi       # Switch to Moonshot AI Kimi-K3
./model.sh --list     # View active status and all models
```

---

## 🧠 Model Selection & Roster

All models run through the local proxy and route dynamically via `sanitize_hook.py`:

| Shortcut | Model Name | NIM Identifier | Best For | Latency |
| :--- | :--- | :--- | :--- | :--- |
| `nemotron` / `2` | **NVIDIA Nemotron 3 Super 120B** | `nvidia/nemotron-3-super-120b-a12b` | **Default Flagship**: General coding, architecture, workflows | **~0.3s - 0.8s** |
| `laguna` / `3` | **Poolside Laguna XS 2.1** | `poolside/laguna-xs-2.1` | **Software Specialist**: Code refactoring, test generation | **~0.4s** |
| `deepseek` / `4` | **DeepSeek V4.1 Flash** | `deepseek-ai/deepseek-v4-flash-0731` | **Reasoning Powerhouse**: Complex logic, deep math, large context | Dependent on NIM load |
| `kimi` / `5` | **Moonshot AI Kimi-K3** | `moonshotai/kimi-k3` | **Multi-Step Problem Solving**: Strategic planning | Rate-limited on free tier |
| `auto` / `1` | **Auto Smart-Failover** | Dynamic mesh | **Zero API Errors**: Automatically routes to the fastest healthy model | Instant failover |

---

## 🔍 Web Search & Web Fetch Support

Unlike standard third-party proxy setups where web searches fail due to Anthropic server dependency, this project includes a **built-in local multi-engine search provider**:

* **Multi-Source Web Search**: Aggregates DuckDuckGo, Wikipedia, Yahoo Finance, and Google News with deduplication and domain filtering (`search_engine.py`).
* **Web Fetch**: Fetches clean, stripped page content with sub-second response times.
* **How It Connects to Claude Code**:
  Both `start-claude.ps1` and `start-claude.sh` export:
  ```bash
  export CLAUDE_CODE_WEBSEARCH_USE_CCR_PROXY="1"
  export CLAUDE_CODE_WEBFETCH_USE_CCR_PROXY="1"
  export CLAUDE_CODE_SESSION_ID="session_local_worker"
  ```
  This signals Claude Code's internal worker client to dispatch all search and fetch queries directly to the local proxy endpoints:
  - `POST /v1/code/sessions/{session_id}/worker/web-search`
  - `POST /v1/code/sessions/{session_id}/worker/web-fetch`

---

## 🔧 Troubleshooting & Health Checks

### 1. Test Proxy Readiness
Run in any terminal:
```bash
# macOS / Linux
curl -s http://127.0.0.1:4000/health/readiness

# Windows PowerShell
Invoke-RestMethod http://127.0.0.1:4000/health/readiness
```
Expected response: `{"status":"healthy","db":"Not connected"}`

### 2. Test Local Web Search Endpoint Directly
```bash
# macOS / Linux
curl -X POST http://127.0.0.1:4000/v1/code/sessions/session_local_worker/worker/web-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Python 3.12 release notes"}'

# Windows PowerShell
Invoke-RestMethod -Uri "http://127.0.0.1:4000/v1/code/sessions/session_local_worker/worker/web-search" `
  -Method Post -ContentType "application/json" -Body '{"query": "Python 3.12 release notes"}'
```

### 3. Port 4000 Already in Use
If port 4000 is occupied by another process:

* **Windows**:
  ```powershell
  # Find PID
  netstat -ano | findstr :4000
  # Terminate process tree
  taskkill /F /T /PID <PID>
  ```
* **macOS**:
  ```bash
  # Find and kill process on port 4000
  kill -9 $(lsof -ti:4000)
  ```

### 4. Run Universal Integrity Verifier
Run the zero-error verifier anytime before committing or testing:
```bash
# Windows
python .agents\skills\zero-error-architect\scripts\universal_verifier.py

# macOS
python3 .agents/skills/zero-error-architect/scripts/universal_verifier.py
```
Expected result: `✅ ZERO-ERROR AUDIT PASSED: 100% integrity across all files`.

---

## 📜 License & Acknowledgments

Powered by **Anthropic Claude Code CLI** + **NVIDIA NIM** + **LiteLLM**. Built for high-speed local inference and zero-token-cost developer autonomy.
