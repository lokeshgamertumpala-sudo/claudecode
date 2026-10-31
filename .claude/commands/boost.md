---
description: Turbocharge motion graphics & Remotion 60fps rendering for maximum speed and 1-shot accuracy
---

# 🚀 TURBO BOOST ACTIVATED (Sub-Second Latency & 1-Shot 60FPS Remotion Protocol)

Target Request / Topic: $ARGUMENTS

You are operating under the **Turbo Boost High-Speed Execution Protocol**.
Your goal is to produce working, production-grade 60FPS motion graphics and software at **maximum possible velocity, aesthetic excellence, and zero errors**.

---

## ⚡ 1. Rapid 1-Shot Execution Protocol (Sub-Minute Feedback Loop)

### Case A: If user requested a motion graphic or animation in '$ARGUMENTS'
(e.g., "Minimal 2 sec video", "Earth rotating motion graphics", "Apple style Good morning", "Cyberpunk HUD"):
- **IMMEDIATELY execute the complete 1-shot pipeline in this single turn without exploratory turns (`ls`, `find`, `cat`, `read`)!**
- The workspace architecture is established:
  - Motion Studio Root: `motion-studio/`
  - Reusable Motion Library: `motion-studio/src/library/` (springs, palettes, typography, particles, effects, camera)
  - Compositions: `motion-studio/src/compositions/<Name>.tsx`
  - Studio Root Entry: `motion-studio/src/Root.tsx`
  - Output Videos & Stills: `motion-studio/out/`
- **Execute in 4 deterministic steps**:
  1. **Write Component**: Create `motion-studio/src/compositions/<Name>.tsx` using the pre-built motion library primitives (`KineticTitle`, `GlowBadge`, `ParticleField`, `VignetteOverlay`, `interpolateSafe`, `palettes`). Use named export `export const <Name>: React.FC = ...`.
  2. **Register in Root**: Add named import and `<Composition id="<Name>" component={<Name>} durationInFrames={...} fps={60} width={1920} height={1080} />` plus kebab-case alias in `motion-studio/src/Root.tsx`.
  3. **Fast Verification (2s)**: Verify syntax and preview frame instantly:
     ```cmd
     check-motion.bat <Name> 30
     ```
     This runs TypeScript type-check (<1s) and single-frame still render (<2s). If any error occurs, fix it immediately before attempting full video encoding.
  4. **Turbo Render (6-8s)**: Render production 1080p 60fps MP4:
     ```cmd
     render-motion.bat <Name> out/<name>.mp4
     ```
  5. **Done**: Confirm the video file is generated in `motion-studio/out/<name>.mp4` and inform the user they can also run `preview-motion.bat` to preview live at `http://localhost:3100`.

### Case B: If '$ARGUMENTS' is "make it faster and more accurate", empty, or status query:
- Confirm Turbo Boost is active:
  - **Inference Engine**: NVIDIA Nemotron Ultra 550B MoE via local NIM proxy (`0.5s` TTFT, 1024 snappy thinking budget).
  - **Motion Library**: Pre-built primitives for Kinetic Typography, Spring Physics, Deterministic Particles, Camera Rigs, and Curated Palettes in `motion-studio/src/library/`.
  - **Fast Verification**: `check-motion.bat <Name>` verifies in ~2 seconds (no 20-minute iterative rendering loops).
  - **Ready-to-Render Compositions (render in <8s)**:
    - `MinimalMotion` (Apple-grade minimal design with kinetic typography, 2s @ 60fps)
    - `EarthRotation` (Photorealistic 3D planetary rotation with atmospheric glow, 3s @ 60fps)
    - `GoodMorning` (Apple-style minimal sunrise typography, 5s @ 60fps)
    - `HiGreeting` (Kinetic neon greeting, 2s @ 60fps)
    - `KineticTypography` (Dynamic typography scaling, 3s @ 60fps)
    - `CyberpunkHUD` (Sci-Fi telemetry & digital reticles, 5s @ 60fps)
    - `ParticleVortex` (Mathematical orbital field & particle vortex, 4s @ 60fps)
    - `LogoReveal` (Volumetric light sweep & cinematic logo reveal, 3s @ 60fps)
    - `NeonPortal` (Hypnotic polygon tunnel with camera zoom, 4s @ 60fps)
    - `VerticalReel` (9:16 mobile shorts format composition, 3s @ 60fps)
- Instruct the user to run `render-motion.bat <CompositionId>` or `preview-motion.bat`!

---

## 🎨 2. Verified Remotion Component Pattern (Using Library Primitives)

Every component should leverage `motion-studio/src/library`:
```tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  KineticTitle,
  GlowBadge,
  ParticleField,
  VignetteOverlay,
  getInOutOpacity,
  interpolateSafe,
  getSpringValue,
  palettes,
} from "../library";

export interface Props {
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

export const MyComposition: React.FC<Props> = ({
  title = "NEXT-GEN MOTION",
  subtitle = "60FPS REMOTION",
  accentColor = palettes.appleMinimal.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = 120; // 2s at 60fps

  const opacity = getInOutOpacity(frame, totalFrames, 18);
  const ringSpring = getSpringValue(frame, fps, "smooth", 10);
  const ringScale = interpolateSafe(ringSpring, [0, 1], [0.85, 1.0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palettes.appleMinimal.background,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <ParticleField count={30} color="#ffffff" speed={0.6} />
      <VignetteOverlay intensity={0.75} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <GlowBadge label="PRECISION MOTION" accentColor={accentColor} startFrame={5} />
        <KineticTitle
          text={title}
          fontSize={68}
          color="#ffffff"
          glowColor={`${accentColor}44`}
          preset="smooth"
          startFrame={10}
        />
        <p
          style={{
            fontSize: 18,
            color: palettes.appleMinimal.textSecondary,
            letterSpacing: 4,
            opacity: interpolateSafe(frame, [25, 45], [0, 1]),
          }}
        >
          {subtitle}
        </p>
      </div>
    </AbsoluteFill>
  );
};
```

---

## ⚡ 3. Speed & Precision Rules (Eliminating the 21-Minute Bottleneck)
1. **Never Loop Through Full MP4 Encoding**: Use `check-motion.bat <Name>` or `still-motion.bat <Name> 30` to verify in 2 seconds. Only render the full MP4 once verified!
2. **Never Use SMIL `<animateTransform>`**: Remotion renders frame-by-frame; SMIL relies on wall-clock browser events. Always derive rotation and scale strictly from `frame` (`transform={\`rotate(${frame * speed}deg)\`}`).
3. **Never Cut Off `<Sequence>` Without Outro**: If an element spans the video, keep it rendered and interpolate its opacity/scale, or match the sequence duration to the full scene.
4. **Symmetrical Exports**: Use named exports (`export const MyComp = ...`) and named imports (`import { MyComp } from ...`). Never mix `export default` with `{ MyComp }`.
5. **Always Use `interpolateSafe`**: Always clamp interpolations (`{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }`) to prevent geometry explosions.
6. **Live Preview**: Inform the user they can run `preview-motion.bat` to scrub through animations in real-time at `http://localhost:3100`.
