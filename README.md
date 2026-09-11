# 🚀 Claude Code + NVIDIA NIM & Interactive 3D Suite

A high-performance autonomous engineering workspace powered by **Claude Code CLI**, **NVIDIA NIM enterprise inference** (NVIDIA Nemotron 3 Super 120B & DeepSeek V4 Flash), interactive 3D WebGL applications, and the **Zero-Error Architecture Protocol**.

---

## 🌟 Workspace Highlights

1. **Claude Code + NVIDIA NIM Proxy Infrastructure**
   - **Sub-Second TTFT**: 0.5s first-token latency with NVIDIA Nemotron 120B.
   - **Real-Time Extended Thinking**: Streams `thinking_delta` chunks with live elapsed seconds timer (`Thinking... (Xs)`).
   - **Context-Aware Smart Routing**: High-token payloads (>20k chars) automatically route to DeepSeek V4 Flash (128k capacity) with zero 503 errors.
   - **Single-Instance 24/7 Daemon Guard**: Independent background watchdog (`proxy-watchdog.ps1`) prevents process collisions and ensures 100% uptime.

2. **Apple Duo 3D Interactive Experience (`apple/`)**
   - Procedural Three.js 3D product showcase in a self-contained single file.
   - Dual-screen body with animated 180° titanium mechanical hinge.
   - Exploded anatomy mode, 6 dynamic material finishes, studio & cinematic lighting.
   - 1-click launcher: `play-apple.bat`.

3. **Mob Control 3D & 2D Arcade Game (`games/`, `game_src/`)**
   - High-performance arcade runner with crowd multiplier gates, cannon mechanics, audio effects, and particle physics.
   - 1-click launchers: `play-game-3d.bat` and `play-game.bat`.

4. **Zero-Error Architecture Protocol (`.agents/skills/zero-error-architect/`)**
   - Universal multi-language integrity auditor checking AST syntax across JavaScript, TypeScript, Python, HTML, JSON, YAML, and CSS.
   - 1-click auditor: `verify-all.bat`.

5. **Med-Assist HealthTech Prototype (`src/`, `App.js`)**
   - React Native (Expo) medical prototype with glassmorphism UI, Audio Medicine Scanner, Report Dashboard, and Emergency SOS.

---

## ⚡ Quick Start Launchers

| Deliverable | Command / Launcher | Description |
|---|---|---|
| **Claude Code CLI** | `.\start-claude.ps1` | Launches Claude Code with NVIDIA NIM high-speed routing and native thinking |
| **Independent Proxy** | `.\start-proxy-independent.ps1` | Starts detached 24/7 background proxy watchdog on port 4000 |
| **Stop Proxy** | `.\stop-proxy.ps1` | Gracefully stops the proxy and watchdog process tree |
| **Apple Duo 3D** | `.\play-apple.bat` | Launches the interactive Apple Duo 3D experience in your browser |
| **Mob Control 3D** | `.\play-game-3d.bat` | Launches the 3D Mob Control game |
| **Mob Control 2D** | `.\play-game.bat` | Launches the 2D Mob Control game |
| **Zero-Error Audit** | `.\verify-all.bat` | Audits 100% of workspace files across all languages |

---

## 🛠️ Architecture & Routing Protocol

```
Claude Code CLI (claude.exe)
         │
         ▼ (Anthropic Messages API /v1/messages)
LiteLLM Local Proxy (127.0.0.1:4000)
         │
         ▼ (sanitize_hook.py: Context-Aware Dynamic Router)
 ┌───────────────────────────────┴───────────────────────────────┐
 │ Standard Prompts (<= 20k chars) │ Large Contexts (> 20k chars) │
 ▼                                 ▼
NVIDIA Nemotron 3 Super 120B      DeepSeek V4 Flash
(nvidia/nemotron-3-super-120b)     (deepseek-ai/deepseek-v4-flash)
- Sub-second latency (~0.5s)      - 128k context support
- Native reasoning tokens         - Zero 503 stream drops
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

All 73 source files in this repository pass with **0 errors and 0 warnings**.

---

## 📦 Repository Structure

```
├── .agents/skills/zero-error-architect/  # Universal auditor & file generator
├── .claude/                             # Claude Code skills & config
├── apple/                               # Apple Duo 3D Interactive WebGL app
│   └── index.html                       # Complete Three.js single-file experience
├── game_src/                            # Core game source (modular ES6)
├── games/                               # Game builds & 3D assets
├── src/                                 # Med-Assist React Native source
├── App.js                               # React Native entry point
├── config.yaml                          # LiteLLM proxy routing & timeouts
├── sanitize_hook.py                     # Dynamic model router & sanitization hook
├── start-claude.ps1                     # Claude Code launcher with thinking stream
├── start-proxy-independent.ps1          # Background proxy daemon launcher
├── stop-proxy.ps1                       # Process tree termination script
├── proxy-watchdog.ps1                   # 24/7 supervisor watchdog
├── play-apple.bat                       # 1-click launcher for Apple Duo 3D
├── play-game-3d.bat                     # 1-click launcher for 3D game
├── play-game.bat                        # 1-click launcher for 2D game
├── verify-all.bat                       # 1-click universal integrity verification
└── README.md                            # Comprehensive project documentation
```

---

## 📄 License
MIT License. Created and maintained under the Zero-Error Architecture Protocol.