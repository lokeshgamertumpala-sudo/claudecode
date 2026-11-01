# 🚀 Claude Code + NVIDIA NIM Frontier Inference Engine & Remotion Motion Studio

A high-performance autonomous engineering workspace integrating **Claude Code CLI** with **NVIDIA NIM enterprise inference** (Mistral Large 4, Step 5 Preview, MiniMax M3.1 Flash, NVIDIA Nemotron Ultra 550B MoE, DeepSeek V4.1 Flash & Poolside Laguna XS 2.1) and a production **Remotion React Motion Graphics Studio** under the **Zero-Error Architecture Protocol**.

---

## 🌟 Core Architecture & Capabilities

1. **Sub-Second Latency & Real-Time Thinking Stream**
   - **~0.4s First-Token Arrival (TTFT)** powered by **Mistral Large 4** (1.05T Frontier MoE, 52B Active).
   - **Native Anthropic Thinking Delta Streaming**: In `sanitize_hook.py`, upstream reasoning tokens are translated to Anthropic `thinking_delta` chunks without stalling.
   - **Live Elapsed Time Display**: Spinner displays accurate real-time thinking seconds in Claude Code CLI.

14. 2. **Frontier Multi-Model Mesh Failover (11 Frontier Models)**
15:    - **NVIDIA Nemotron Ultra 550B MoE** (`nvidia/nemotron-3-ultra-550b-a55b`): 550B flagship reasoning giant (DEFAULT).
16:    - **Mistral Large 4** (`mistralai/mistral-large-4-1t-a52b`): 1.05T Frontier MoE, 52B Active.
17:    - **Step 5 Preview** (`stepfun-ai/step-5-preview`): 600B MoE, 1M context window, advanced multimodal reasoning.
18:    - **MiniMax M3.1 Flash** (`minimaxai/minimax-m3.1-flash`): 428B MoE, ultra-fast agentic & code specialist.
19:    - **DeepSeek V4.1 Flash** (`deepseek-ai/deepseek-v4.1-flash`): High-speed reasoning & massive context coding powerhouse.
20:    - **Poolside Laguna XS 2.1** (`poolside/laguna-xs-2.1`): Software engineering specialist.
21:    - **DeepSeek R1** (`deepseek-ai/deepseek-r1`): 671B Frontier Open Reasoning Engine.
22:    - **DeepSeek V3** (`deepseek-ai/deepseek-v3`): 671B Frontier MoE Code & Language Model.
23:    - **Meta Llama 3.3 70B Instruct** (`meta/llama-3.3-70b-instruct`): 70B Frontier Open Instruction Model.
24:    - **Qwen 2.5 72B Instruct** (`qwen/qwen2.5-72b-instruct`): 72B Advanced Reasoning & Code Flagship.
25: 
26: 3. **Remotion Motion Graphics Studio (`motion-studio/`)**
27:    - Production Remotion React 18 / TypeScript motion graphics project.
28:    - 60 FPS deterministic frame-based animation with spring physics and fluid interpolations.
29:    - 19+ Built-in Compositions including `AuroraFlow`, `CosmicAurora`, `AiExplainer`, `BeyondEarth`, `OpenClaudeX`, `CyberpunkHUD`, `MinimalMotion`, and `VerticalReel`.
30:    - Real-time preview via `preview-motion.bat` on `http://localhost:3100`.
31: 
32: 4. **Single-Instance 24/7 Background Supervisor**
33:    - Windows WMI watchdog daemon (`proxy-watchdog.ps1`) maintains a healthy LiteLLM proxy on port `4000` without process collisions or zombie tasks.
34:    - Health readiness checked in <5ms via `/health/readiness` without upstream quota consumption.
35: 
36: 5. **Zero-Error Architecture Protocol**
37:    - Multi-language AST validator verifying 100% syntax and import integrity across Python, JavaScript, TypeScript, HTML, CSS, JSON, and YAML.
38: 
39: ---
40: 
41: ## ⚡ Quick Start Launchers & Motion Workflow (macOS & Windows)
42: 
43: All scripts feature automatic OS detection (`Darwin` vs `Windows_NT` vs `Linux`), automatic `python3` discovery, and 1-click execution:
44: 
45: | macOS / Linux Command | Windows Command | Purpose |
46: |---|---|---|
47: | `./check-motion.sh <Comp>` | `.\check-motion.bat <Comp>` | **⚡ Sub-Minute Verifier (<2s)**: TypeScript type-check + 1-frame preview still |
48: | `./still-motion.sh <Comp> [f]` | `.\still-motion.bat <Comp> [f]` | **📸 Quick Still**: Render single frame in <1.5s for instant layout inspection |
49: | `./render-motion.sh <Comp>` | `.\render-motion.bat <Comp>` | **🚀 1-Click Turbo Render**: Pre-checks TS and renders 1080p 60fps MP4 in <8s |
50: | `./render-long.sh <Comp>` | `.\render-long.bat <Comp>` | **🎬 1-Hour Long-Form Render**: Continuous high-capacity rendering (up to 1 hr @ 60fps) |
51: | `./preview-motion.sh` | `.\preview-motion.bat` | **🎥 Live 60FPS Studio**: Browser scrubbing & hot-reload on dedicated port `3100` (`http://localhost:3100`) |
52: | `./boost.sh` | `.\boost.bat` | **🚀 Turbo Boost Accelerator**: Pinned sub-second inference + 1-shot Remotion |
53: | `./start-ultra.sh` | `.\start-ultra.bat` | 1-click launcher for NVIDIA Nemotron Ultra 550B MoE (Default) |
54: | `./start-mistral.sh` | `.\start-mistral.bat` | 1-click launcher with Mistral Large 4 (1.05T MoE) |
55: | `./start-step.sh` | `.\start-step.bat` | 1-click launcher for Step 5 Preview (600B MoE, 1M context) |
56: | `./start-minimax.sh` | `.\start-minimax.bat` | 1-click launcher for MiniMax M3.1 Flash (428B MoE) |
57: | `./start-deepseek.sh` | `.\start-deepseek.bat` | 1-click launcher for DeepSeek V4.1 Flash |
58: | `./start-r1.sh` | `.\start-r1.bat` | 1-click launcher for DeepSeek R1 (671B MoE Reasoning) |
59: | `./start-v3.sh` | `.\start-v3.bat` | 1-click launcher for DeepSeek V3 (671B MoE Coding) |
60: | `./start-llama.sh` | `.\start-llama.bat` | 1-click launcher for Meta Llama 3.3 70B Instruct |
61: | `./start-qwen.sh` | `.\start-qwen.bat` | 1-click launcher for Qwen 2.5 72B Instruct |
62: | `./model.sh` | `.\model.bat` | Interactive terminal model switcher & canonical configuration sync |
63: | `./start-proxy.sh` | `.\start-proxy.bat` | Spawns background persistent LiteLLM proxy daemon on port `4000` |
64: | `./status-proxy.sh` | `.\status-proxy.bat` | Checks proxy readiness, active model, and sub-second latency |
65: | `./stop-proxy.sh` | `.\stop-proxy.bat` | Cleanly terminates background proxy processes |
66: | `./verify-all.sh` | `.\verify-all.bat` | 1-click universal zero-error integrity verification across all files |

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