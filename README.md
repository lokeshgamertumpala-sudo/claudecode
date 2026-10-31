# 🚀 Claude Code + NVIDIA NIM Frontier Inference Engine & Remotion Motion Studio

A high-performance autonomous engineering workspace integrating **Claude Code CLI** with **NVIDIA NIM enterprise inference** (Mistral Large 4, Step 5 Preview, MiniMax M3.1 Flash, NVIDIA Nemotron Ultra 550B MoE, DeepSeek V4.1 Flash & Poolside Laguna XS 2.1) and a production **Remotion React Motion Graphics Studio** under the **Zero-Error Architecture Protocol**.

---

## 🌟 Core Architecture & Capabilities

1. **Sub-Second Latency & Real-Time Thinking Stream**
   - **~0.4s First-Token Arrival (TTFT)** powered by **Mistral Large 4** (1.05T Frontier MoE, 52B Active).
   - **Native Anthropic Thinking Delta Streaming**: In `sanitize_hook.py`, upstream reasoning tokens are translated to Anthropic `thinking_delta` chunks without stalling.
   - **Live Elapsed Time Display**: Spinner displays accurate real-time thinking seconds in Claude Code CLI.

2. **Frontier Multi-Model Mesh Failover**
   - **Mistral Large 4** (`mistralai/mistral-large-4-1t-a52b`): Primary default coding & reasoning engine.
   - **Step 5 Preview** (`stepfun-ai/step-5-preview`): 600B MoE, 1M context window, advanced multimodal reasoning.
   - **MiniMax M3.1 Flash** (`minimaxai/minimax-m3.1-flash`): 428B MoE, ultra-fast agentic & code specialist.
   - **NVIDIA Nemotron Ultra 550B MoE** (`nvidia/nemotron-3-ultra-550b-a55b`): 550B flagship reasoning giant.
   - **DeepSeek V4.1 Flash** (`deepseek-ai/deepseek-v4.1-flash`): High-speed reasoning & massive context coding powerhouse.
   - **Poolside Laguna XS 2.1** (`poolside/laguna-xs-2.1`): Software engineering specialist.

3. **Remotion Motion Graphics Studio (`motion-studio/`)**
   - Production Remotion React 18 / TypeScript motion graphics project.
   - 60 FPS deterministic frame-based animation with spring physics and fluid interpolations.
   - 5 Built-in Compositions: `KineticTypography`, `CyberpunkHUD`, `ParticleVortex`, `LogoReveal`, and `VerticalReel` (9:16 mobile).
   - Real-time preview via `preview-motion.bat` on `http://localhost:3000`.

4. **Single-Instance 24/7 Background Supervisor**
   - Windows WMI watchdog daemon (`proxy-watchdog.ps1`) maintains a healthy LiteLLM proxy on port `4000` without process collisions or zombie tasks.
   - Health readiness checked in <5ms via `/health/readiness` without upstream quota consumption.

5. **Zero-Error Architecture Protocol**
   - Multi-language AST validator verifying 100% syntax and import integrity across Python, JavaScript, TypeScript, HTML, CSS, JSON, and YAML.

---

## ⚡ Quick Start Launchers & Motion Workflow (macOS & Windows)

All scripts feature automatic OS detection (`Darwin` vs `Windows_NT` vs `Linux`), automatic `python3` discovery, and 1-click execution:

| macOS / Linux Command | Windows Command | Purpose |
|---|---|---|
| `./check-motion.sh <Comp>` | `.\check-motion.bat <Comp>` | **⚡ Sub-Minute Verifier (<2s)**: TypeScript type-check + 1-frame preview still |
| `./still-motion.sh <Comp> [f]` | `.\still-motion.bat <Comp> [f]` | **📸 Quick Still**: Render single frame in <1.5s for instant layout inspection |
| `./render-motion.sh <Comp>` | `.\render-motion.bat <Comp>` | **🚀 1-Click Turbo Render**: Pre-checks TS and renders 1080p 60fps MP4 in <8s |
| `./preview-motion.sh` | `.\preview-motion.bat` | **🎥 Live 60FPS Studio**: Browser scrubbing & hot-reload on dedicated port `3100` (`http://localhost:3100`) |
| `./boost.sh` | `.\boost.bat` | **🚀 Turbo Boost Accelerator**: Pinned sub-second inference + 1-shot Remotion |
| `./start-mistral.sh` | `.\start-mistral.bat` | 1-click launcher with Mistral Large 4 (1.05T MoE, Recommended Default) |
| `./start-ultra.sh` | `.\start-ultra.bat` | 1-click launcher for NVIDIA Nemotron Ultra 550B MoE |
| `./start-step.sh` | `.\start-step.bat` | 1-click launcher for Step 5 Preview (600B MoE, 1M context) |
| `./start-minimax.sh` | `.\start-minimax.bat` | 1-click launcher for MiniMax M3.1 Flash (428B MoE) |
| `./start-deepseek.sh` | `.\start-deepseek.bat` | 1-click launcher for DeepSeek V4.1 Flash |
| `./model.sh` | `.\model.bat` | Interactive terminal model switcher & canonical configuration sync |
| `./start-proxy.sh` | `.\start-proxy.bat` | Spawns background persistent LiteLLM proxy daemon on port `4000` |
| `./status-proxy.sh` | `.\status-proxy.bat` | Checks proxy readiness, active model, and sub-second latency |
| `./stop-proxy.sh` | `.\stop-proxy.bat` | Cleanly terminates background proxy processes |
| `./verify-all.sh` | `.\verify-all.bat` | 1-click universal zero-error integrity verification across all files |

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
├── .claude/                             # Claude Code custom settings & options
├── motion-studio/                       # Remotion React 18 Motion Graphics Studio
│   ├── src/compositions/                # 60 FPS Compositions (KineticTypography, CyberpunkHUD, ParticleVortex, LogoReveal)
│   ├── src/Root.tsx                     # Composition registry
│   └── remotion.config.ts               # Remotion bundler config
├── ai.bat / ai.ps1                      # 1-click model switcher & runner
├── model.bat / model.ps1                # Model selection utility
├── select_model.py                      # Multi-model selection engine (NVIDIA NIM frontier models)
├── start-mistral.bat                    # 1-click Mistral Large 4 launcher (Default)
├── start-step.bat                       # 1-click Step 5 Preview launcher
├── start-minimax.bat                    # 1-click MiniMax M3.1 Flash launcher
├── start-ultra.bat                      # 1-click Nemotron Ultra 550B launcher
├── preview-motion.bat                   # 1-click Remotion Motion Graphics preview launcher
├── start-claude.ps1 / start-claude.bat  # Claude Code launcher with live thinking stream
├── run-autonomous.ps1 / .bat            # Autonomous loop runner
├── config.yaml                          # LiteLLM proxy routing, fallbacks & timeouts
├── sanitize_hook.py                     # Dynamic model router, thinking stream translator & directives
├── proxy-watchdog.ps1                   # 24/7 supervisor watchdog
├── verify-all.bat                       # 1-click universal integrity verification
└── README.md                            # Complete architecture documentation
```

---

## 📄 License
MIT License. Created and maintained under the Zero-Error Architecture Protocol.