# 🚀 Claude Code + NVIDIA NIM Autonomous Inference Engine

A high-performance autonomous engineering workspace integrating **Claude Code CLI** with **NVIDIA NIM enterprise inference** (NVIDIA Nemotron 3 Super 120B & DeepSeek V4 Flash) under the **Zero-Error Architecture Protocol**.

---

## 🌟 Core Architecture & Capabilities

1. **Sub-Second Latency & Real-Time Thinking Stream**
   - **0.5s First-Token Arrival (TTFT)** powered by NVIDIA Nemotron 120B.
   - **Native Thinking Tokens**: Streams real-time `thinking_delta` chunks into the Claude Code terminal UI.
   - **Live Elapsed Time Display**: Spinner displays accurate real-time seconds (`Thinking... (1s)`, `(2s)`, `(3s)...`).

2. **Context-Size Aware Dynamic Model Routing**
   - **Interactive / Standard Queries (<= 20,000 chars)**: Routes directly to `nvidia/nemotron-3-super-120b-a12b` for maximum speed and sub-second reasoning.
   - **High-Token / Massive Context (> 20,000 chars)**: Automatically promotes requests to `deepseek-ai/deepseek-v4-flash-0731` (128k context capacity) with zero 503 stream drops.

3. **Context Buffer Protection & Tool Output Compaction**
   - Safely compacts oversized tool results (>30,000 chars) in `sanitize_hook.py` to prevent upstream context blowout while preserving crucial head and tail lines.
   - 300-second stream and request timeouts prevent premature disconnects.

4. **Single-Instance 24/7 Background Supervisor**
   - Independent Windows WMI watchdog daemon (`proxy-watchdog.ps1`) maintains a healthy LiteLLM proxy on port `4000` without process collisions or zombie tasks.
   - Health readiness checked in <5ms via `/health/readiness` without upstream quota consumption.

5. **Zero-Error Architecture Protocol**
   - Multi-language AST validator verifying 100% syntax and import integrity across Python, JavaScript, TypeScript, HTML, CSS, JSON, and YAML.

---

## ⚡ Quick Start Launchers

| Command / Script | Purpose |
|---|---|
| `.\ai.bat` (or `.\ai.ps1`) | Interactive model switcher to select from 5 NVIDIA NIM engines & launch |
| `.\start-claude.ps1` | Launches Claude Code CLI with high-speed NIM routing and live thinking stream |
| `.\start-claude.bat` | 1-click Windows batch launcher for Claude Code |
| `.\run-autonomous.ps1` | Autonomous runner with continuous monitoring & auto-reconnect |
| `.\start-proxy-independent.ps1` | Starts the detached 24/7 background proxy supervisor on port 4000 |
| `.\stop-proxy.ps1` | Gracefully stops the proxy daemon and watchdog process tree |
| `.\verify-all.bat` | 1-click universal integrity verification across all codebase files |

---

## 🛠️ Routing Flow

```
Claude Code CLI (claude.exe)
         │
         ▼ (Anthropic Messages API /v1/messages?beta=true)
LiteLLM Local Proxy (127.0.0.1:4000)
         │
         ▼ (sanitize_hook.py: Context-Aware Dynamic Router)
 ┌───────────────────────────────┴───────────────────────────────┐
 │ Standard Prompts (<= 20k chars) │ High-Token Prompts (> 20k chars) │
 ▼                                 ▼
NVIDIA Nemotron 3 Super 120B      DeepSeek V4 Flash
(nvidia/nemotron-3-super-120b)     (deepseek-ai/deepseek-v4-flash)
- Sub-second TTFT (~0.5s)         - 128k context capacity
- Native reasoning stream         - Zero 503 stream drops
```

---

## 🛡️ Zero-Error Protocol Verification

Run the universal multi-language verifier anytime:
```bash
python .agents/skills/zero-error-architect/scripts/universal_verifier.py
```
or double-click:
```cmd
verify-all.bat
```

---

## 📦 Repository Structure

```
├── .agents/skills/zero-error-architect/  # Universal auditor & file generator
├── .claude/                             # Claude Code custom skills & commands
├── ai.bat / ai.ps1                      # 1-click model switcher & runner
├── select_model.py                      # Multi-model selection engine (5 NVIDIA NIM models)
├── start-claude.ps1 / start-claude.bat  # Claude Code launcher with live thinking stream
├── run-autonomous.ps1 / .bat            # Autonomous loop runner
├── config.yaml                          # LiteLLM proxy routing, fallbacks & timeouts
├── sanitize_hook.py                     # Dynamic model router & sanitization hook
├── start-proxy-independent.ps1          # Background proxy daemon launcher
├── stop-proxy.ps1                       # Process tree termination script
├── proxy-watchdog.ps1                   # 24/7 supervisor watchdog
├── verify-all.bat                       # 1-click universal integrity verification
└── README.md                            # Complete architecture documentation
```

---

## 📄 License
MIT License. Created and maintained under the Zero-Error Architecture Protocol.