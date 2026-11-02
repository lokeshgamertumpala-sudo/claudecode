# 🚀 Claude Code + NVIDIA NIM Frontier Inference Engine & Remotion Motion Studio

A high-performance autonomous engineering workspace integrating **Claude Code CLI** with **NVIDIA NIM enterprise inference** (Mistral Large 4, Step 5 Preview, MiniMax M3.1 Flash, NVIDIA Nemotron Ultra 550B MoE, DeepSeek V4.1 Flash, Poolside Laguna XS 2.1, DeepSeek R1, DeepSeek V3, Meta Llama 3.3 70B, Qwen 2.5 72B) and a production **Remotion React Motion Graphics Studio** under the **Zero-Error Architecture Protocol**.

---

## 🌟 Core Architecture & Capabilities

1. **Sub-Second Latency & Unconstrained Native Thinking**
   - **~0.4s First-Token Arrival (TTFT)** powered by **Mistral Large 4** (1.05T Frontier MoE, 52B Active - Primary Default Flagship).
   - **Native Anthropic Thinking Delta Streaming**: In `sanitize_hook.py`, reasoning tokens are streamed via Anthropic `thinking_delta` chunks with unconstrained reasoning budgets (up to 32k/64k tokens).
   - **Live Elapsed Time Display**: Real-time elapsed thinking seconds timer rendered directly in the Claude Code terminal.

2. **Frontier Multi-Model Mesh Failover (11 Frontier Models)**
   - **Mistral Large 4** (`mistralai/mistral-large-4-1t-a52b`): 1.05T Frontier MoE, 52B Active **[PRIMARY DEFAULT]**.
   - **NVIDIA Nemotron Ultra 550B MoE** (`nvidia/nemotron-3-ultra-550b-a55b`): 550B flagship reasoning giant.
   - **Step 5 Preview** (`stepfun-ai/step-5-preview`): 600B MoE, 1M context window, advanced multimodal reasoning.
   - **MiniMax M3.1 Flash** (`minimaxai/minimax-m3.1-flash`): 428B MoE, ultra-fast agentic & code specialist.
   - **DeepSeek V4.1 Flash** (`deepseek-ai/deepseek-v4.1-flash`): High-speed reasoning & massive context coding powerhouse.
   - **Poolside Laguna XS 2.1** (`poolside/laguna-xs-2.1`): Software engineering specialist.
   - **DeepSeek R1** (`deepseek-ai/deepseek-r1`): 671B Frontier Open Reasoning Engine.
   - **DeepSeek V3** (`deepseek-ai/deepseek-v3`): 671B Frontier MoE Code & Language Model.
   - **Meta Llama 3.3 70B Instruct** (`meta/llama-3.3-70b-instruct`): 70B Frontier Open Instruction Model.
   - **Qwen 2.5 72B Instruct** (`qwen/qwen2.5-72b-instruct`): 72B Advanced Reasoning & Code Flagship.
   - **Auto Smart-Failover** (`auto`): Zero API Errors resilience mesh.

3. **Remotion Motion Graphics Studio (`motion-studio/`)**
   - Production Remotion React 18 / TypeScript motion graphics project.
   - 60 FPS deterministic frame-based animation with spring physics and fluid interpolations.
   - 19+ Built-in Compositions including `BeyondEarth`, `OpenClaudeX`, `CyberpunkHUD`, `MinimalMotion`, and `VerticalReel`.
   - Real-time studio preview via `preview-motion.bat` on dedicated port `3100` (`http://localhost:3100`).

4. **Single-Instance 24/7 Background Supervisor**
   - Windows WMI watchdog daemon (`proxy-watchdog.ps1`) maintains a healthy LiteLLM proxy on port `4000` without process collisions or zombie tasks.
   - Health readiness checked in <5ms via `/health/readiness` without upstream quota consumption.

5. **Auto-Healing Diagnostics & Zero-Error Protocol**
   - `doctor.bat` / `doctor.ps1`: 6-point auto-healing diagnostics verifying API keys, port 4000 proxy (auto-reviving if stopped), active model, Node/npm, Remotion TypeScript (`tsc --noEmit`), and Git status.
   - `universal_verifier.py`: Multi-language AST validator verifying 100% syntax and import integrity across Python, JavaScript, TypeScript, HTML, CSS, JSON, and YAML.

---

## ⚡ Quick Start Launchers & Diagnostic Workflow (macOS & Windows)

All scripts feature automatic OS detection (`Darwin` vs `Windows_NT` vs `Linux`), automatic `python3` discovery, and 1-click execution:

| macOS / Linux Command | Windows Command | Purpose |
|---|---|---|
| `./doctor.sh` | `.\doctor.bat` | **🩺 Auto-Healing Diagnostics**: Full check of API keys, proxy, model, Node/npm, Remotion, Git |
| `./check-motion.sh <Comp>` | `.\check-motion.bat <Comp>` | **⚡ Sub-Minute Verifier (<2s)**: TypeScript type-check + 1-frame preview still |
| `./still-motion.sh <Comp> [f]` | `.\still-motion.bat <Comp> [f]` | **📸 Quick Still**: Render single frame in <1.5s for instant layout inspection |
| `./render-motion.sh <Comp>` | `.\render-motion.bat <Comp>` | **🚀 1-Click Turbo Render**: Pre-checks TS and renders 1080p 60fps MP4 in <8s |
| `./render-long.sh <Comp>` | `.\render-long.bat <Comp>` | **🎬 1-Hour Long-Form Render**: Continuous high-capacity rendering (up to 1 hr @ 60fps) |
| `./preview-motion.sh` | `.\preview-motion.bat` | **🎥 Live 60FPS Studio**: Browser scrubbing & hot-reload on dedicated port `3100` (`http://localhost:3100`) |
| `./boost.sh` | `.\boost.bat` | **🚀 Turbo Boost Accelerator**: Pinned sub-second inference + 1-shot Remotion |
| `./start-claude.sh` | `.\start-claude.bat` | **🧠 Claude Code CLI Launcher**: Unrestricted autonomous mode with Mistral Large 4 |
| `./start-mistral.sh` | `.\start-mistral.bat` | 1-click launcher with Mistral Large 4 (1.05T MoE - Default) |
| `./start-ultra.sh` | `.\start-ultra.bat` | 1-click launcher for NVIDIA Nemotron Ultra 550B MoE |
| `./start-step.sh` | `.\start-step.bat` | 1-click launcher for Step 5 Preview (600B MoE, 1M context) |
| `./start-minimax.sh` | `.\start-minimax.bat` | 1-click launcher for MiniMax M3.1 Flash (428B MoE) |
| `./start-deepseek.sh` | `.\start-deepseek.bat` | 1-click launcher for DeepSeek V4.1 Flash |
| `./start-r1.sh` | `.\start-r1.bat` | 1-click launcher for DeepSeek R1 (671B MoE Reasoning) |
| `./start-v3.sh` | `.\start-v3.bat` | 1-click launcher for DeepSeek V3 (671B MoE Coding) |
| `./start-llama.sh` | `.\start-llama.bat` | 1-click launcher for Meta Llama 3.3 70B Instruct |
| `./start-qwen.sh` | `.\start-qwen.bat` | 1-click launcher for Qwen 2.5 72B Instruct |
| `./model.sh` | `.\model.bat` | Interactive terminal model switcher & canonical configuration sync |
| `./start-proxy.sh` | `.\start-proxy.bat` | Spawns background persistent LiteLLM proxy daemon on port `4000` |
| `./status-proxy.sh` | `.\status-proxy.bat` | Checks proxy readiness, active model, and sub-second latency |
| `./stop-proxy.sh` | `.\stop-proxy.bat` | Cleanly terminates background proxy processes |
| `./verify-all.sh` | `.\verify-all.bat` | 1-click universal zero-error integrity verification across all files |

---

## ⚡ Complete Native Slash Command Suite (`.claude/commands/`)

Claude Code CLI includes a full-fledged native slash command suite tailored for autonomous software development and motion graphics:

| Slash Command | File | Purpose & Behavior |
|---|---|---|
| `/plan` | `.claude/commands/plan.md` | **Strict Zero-Edit Planning**: Inspects codebase, produces comprehensive architectural design doc, and requires explicit user approval before modifying code. |
| `/grill-me` | `.claude/commands/grill-me.md` | **1-by-1 Interactive Interview**: Stress-tests requirements, walking down the decision tree one question at a time with recommended choices. |
| `/motion` | `.claude/commands/motion.md` | **1-Shot Turbo Remotion 60FPS Pipeline**: Instant 4-turn creation (<2s check, <8s MP4 render, port 3100 preview). |
| `/test` | `.claude/commands/test.md` | **Autonomous Test Runner**: Discovers and runs tests across TypeScript/Remotion (`tsc --noEmit`), Python, and Node with auto-healing. |
| `/review` | `.claude/commands/review.md` | **Automated Code Review**: Reviews `git diff` for bugs, memory leaks, missing types, and security vulnerabilities. |
| `/git-sync` | `.claude/commands/git-sync.md` | **1-Click Git Sync**: Pulls upstream via rebase, stages changes, generates semantic commits, and pushes to `origin/main`. |
| `/doctor` | `.claude/commands/doctor.md` | **System Diagnostics & Auto-Healing**: Verifies API keys, proxy port 4000 (auto-reviving if stopped), active model, Node/npm, Remotion, and Git. |
| `/model` | `.claude/commands/model.md` | **Model Switcher**: Switches active model across all 11 NVIDIA NIM models or toggles Auto Smart-Failover. |
| `/clean` | `.claude/commands/clean.md` | **Workspace Cleaner**: Reclaims disk space by clearing `__pycache__`, temp logs, and Remotion frame caches. |
| `/boost` | `.claude/commands/boost.md` | **Turbo Boost Accelerator**: Pinned high-speed inference + 1-shot 60FPS Remotion acceleration. |
| `/company` | `.claude/commands/company.md` | **Corporate Intelligence**: Instant financial and corporate dossiers via SEC EDGAR, Yahoo Finance, and Wikipedia. |
| `/verify-all` | `.claude/commands/verify-all.md` | **Universal Integrity Auditor**: Multi-language AST validator across JS, TS, Python, HTML, CSS, JSON, YAML. |

---

## 🤖 Autonomous Subagent Swarm (`.claude/agents/`)

The workspace includes 5 specialized autonomous subagents tailored for 60FPS motion design and software architecture:

1. **`motion-director.md`**: Creative concept, 60FPS frame pacing, harmonic color theory (`palettes.ts`), and sound design cues.
2. **`remotion-engineer.md`**: Pure React 18 Remotion engineering, deterministic frame math, clamped interpolations, and GPU transforms.
3. **`motion-qa.md`**: Rapid visual inspection via `still-motion.sh` / `.bat` (<1.5s check), keyframe transition auditing, and instant self-correction.
4. **`fullstack-architect.md`**: Composition registration (`Root.tsx`), dual ID aliases (`PascalCase` + `kebab-case`), and cross-platform infrastructure.
5. **`code-reviewer.md`**: Zero-error syntax assurance, strict TypeScript validation (`tsc --noEmit`), and import/export symmetry.

---

## 🎨 Versatile Motion & Audio Kit (`motion-studio/src/primitives/`)

- **`springs.ts`**: Calibrated physics presets (`gentle`, `snappy`, `elastic`, `heavy`, `smooth`, `cinematic`) & `staggerSpring`.
- **`KineticText.tsx`**: Staggered word/char spring entrance with optical blur-to-sharp focus and neon glow.
- **`DeviceMockup.tsx`**: Photorealistic `IPhone16Pro` (titanium bezel, dynamic island), `MacBookPro` (unibody aluminum, top notch), `BrowserWindow` (macOS traffic lights, frosted glass), and `TiltCard` (3D pitch/yaw glare).
- **`AudioSFX.tsx`**: Procedural Web Audio SFX generation (`whoosh`, `pop`, `impact`, `riser`, `chime`) & `WaveformVisualizer` (60FPS deterministic neon equalizer bars).
- **`CameraRig.tsx`**: 2.5D/3D pan, continuous zoom, Ken Burns drift, focal tracking, and micro-camera shake.
- **`GlowBackdrop.tsx`**: `SunriseGlow`, `RadialGlow`, `ParticleBackdrop`, and `MeshGlow` cinematic atmospheric shaders.
- **`VersatileShowcase.tsx`**: 10-second multi-scene showcase composition registered in `Root.tsx`.

---

## 🛡️ Zero-Error Protocol Verification

Run the universal multi-language verifier anytime:
```cmd
verify-all.bat
```
or via Python:
```bash
python .agents\skills\zero-error-architect\scripts\universal_verifier.py
```

---

## 📦 Repository Structure

```
├── .agents/skills/zero-error-architect/  # Universal auditor & file generator
├── .claude/                             # Claude Code custom settings, commands & agents
│   ├── commands/                        # Native slash command suite (/plan, /grill-me, /motion, /doctor, etc.)
│   └── agents/                          # Autonomous subagents
├── motion-studio/                       # Remotion React 18 Motion Graphics Studio
│   ├── src/compositions/                # 60 FPS Compositions (KineticTypography, CyberpunkHUD, ParticleVortex, LogoReveal)
│   ├── src/Root.tsx                     # Composition registry
│   └── remotion.config.ts               # Remotion bundler config
├── doctor.bat / doctor.ps1              # Auto-healing diagnostics suite
├── ai.bat / ai.ps1                      # 1-click model switcher & runner
├── model.bat / model.ps1                # Model selection utility
├── select_model.py                      # Multi-model selection engine (NVIDIA NIM frontier models)
├── start-mistral.bat                    # 1-click Mistral Large 4 launcher (Primary Default)
├── start-ultra.bat                      # 1-click Nemotron Ultra 550B launcher
├── start-step.bat                       # 1-click Step 5 Preview launcher
├── start-minimax.bat                    # 1-click MiniMax M3.1 Flash launcher
├── preview-motion.bat                   # 1-click Remotion Motion Graphics preview launcher
├── start-claude.ps1 / start-claude.bat  # Claude Code launcher with unconstrained native thinking stream
├── run-autonomous.ps1 / .bat            # Autonomous loop runner
├── config.yaml                          # LiteLLM proxy routing, fallbacks & timeouts
├── sanitize_hook.py                     # Dynamic model router, unconstrained thinking & directives
├── proxy-watchdog.ps1                   # 24/7 supervisor watchdog
├── verify-all.bat                       # 1-click universal integrity verification
└── README.md                            # Complete architecture documentation
```

---

## 📄 License
MIT License. Created and maintained under the Zero-Error Architecture Protocol.