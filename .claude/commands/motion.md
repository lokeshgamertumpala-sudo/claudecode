---
description: 1-Shot Turbo Remotion 60FPS pipeline (<2s check, <8s MP4 render, port 3100 preview)
---

# 🎬 1-Shot Turbo Remotion 60FPS Pipeline (/motion)

Target Motion Graphics Prompt / Composition: $ARGUMENTS

You are operating under the **1-Shot Turbo Remotion 60FPS Architecture Protocol**.
Your goal is to build, verify, and render production-grade 60FPS motion graphics at maximum velocity with **ZERO conversational pauses and ZERO file-reading turns**.

---

## ⚡ 1. The Pre-Cached Motion Primitives Library

All library exports are pre-cached in memory from `motion-studio/src/library`:
- **Springs**: `springPresets` (`snappy`, `bouncy`, `smooth`, `cinematic`, `gentle`, `slowMo`), `getSpringValue(frame, fps, preset, delay)`
- **Math**: `interpolateSafe(frame, [in], [out])`, `clamp`, `getInOutOpacity(frame, total, fade)`, `slideIn(frame, start, dur, from, to)`
- **Palettes**: `palettes` (`appleMinimal`, `cyberpunk`, `deepSpace`, `solarEarth`, `darkLuxury`)
- **Typography & Badges**: `KineticTitle`, `GlowBadge`
- **Particles & Rings**: `ParticleField` (Mulberry32 seed-locked), `OrbitalRings`
- **Atmosphere & Camera**: `VignetteOverlay`, `GridBackdrop`, `LightSweep`, `GlowDefs`, `CameraRig`

---

## 🚀 2. Strict 4-Turn Atomic Workflow

Execute in 4 immediate deterministic turns:

### Turn 1: Write Composition
Create `motion-studio/src/compositions/<Name>.tsx`:
- Use pure React 18 / TypeScript.
- Named export: `export const <Name>: React.FC = () => { ... }`.
- Deterministic frame math derived strictly from `useCurrentFrame()` and `useVideoConfig()`.
- Zero SMIL animations, zero `Date.now()`, zero `Math.random()`.

### Turn 2: Register in Root
Update `motion-studio/src/Root.tsx`:
- Import `<Name>` via named import.
- Register `<Composition id="<Name>" component={<Name>} durationInFrames={...} fps={60} width={1920} height={1080} />`.
- Register kebab-case alias for CLI flexibility.

### Turn 3: Instant Fast Check (<2s)
Run single-frame verification:
```cmd
check-motion.bat <Name> 30
```
This performs TypeScript compilation check and renders a preview still frame in <2 seconds. Fix any syntax or import error immediately.

### Turn 4: Multithreaded Turbo Render (<8s)
Render full 1080p 60fps MP4:
```cmd
render-motion.bat <Name> out/<name>.mp4
```
Runs 12 parallel threads with ANGLE GPU acceleration and bundle caching.

---

## 🎥 3. Live 60FPS Studio Preview

Inform the user that the video is rendered at `motion-studio/out/<name>.mp4`, and they can run:
```cmd
preview-motion.bat
```
to scrub and view live animations at `http://localhost:3100`.
