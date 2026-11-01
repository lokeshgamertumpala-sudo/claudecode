import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  palettes,
  KineticTitle,
  GlowBadge,
  ParticleField,
  OrbitalRings,
  VignetteOverlay,
  GridBackdrop,
  LightSweep,
  GlowDefs,
  CameraRig,
  interpolateSafe,
} from "../library";

export interface CosmicAuroraProps {
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
}

export const CosmicAurora: React.FC<CosmicAuroraProps> = ({
  primaryColor = "#38bdf8",
  accentColor = "#7928ca",
  secondaryColor = "#ff007f",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;
  const totalFrames = 600; // 10 seconds @ 60fps

  // Cosmic aurora atmospheric pulsation
  const nebulaGlow = 0.65 + Math.sin(frame * 0.03) * 0.25;
  const shiftX = Math.sin(frame * 0.015) * 50;
  const shiftY = Math.cos(frame * 0.02) * 35;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palettes.deepSpace.background,
        overflow: "hidden",
      }}
    >
      <GlowDefs id="cosmicGlow" blurStdDev={14} />

      {/* 2.5D Camera Rig Motion */}
      <CameraRig durationFrames={totalFrames} startZoom={1.0} endZoom={1.12}>
        {/* Volumetric Nebula Gradient Fields */}
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              inset: -120,
              background: `radial-gradient(ellipse 85% 55% at 45% 35%, ${accentColor}30 0%, ${secondaryColor}18 45%, transparent 75%)`,
              filter: "blur(70px)",
              opacity: nebulaGlow,
              transform: `translate(${shiftX}px, ${shiftY}px)`,
              willChange: "transform, opacity",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: -150,
              background: `radial-gradient(ellipse 75% 60% at 65% 65%, ${primaryColor}25 0%, ${accentColor}20 50%, transparent 80%)`,
              filter: "blur(90px)",
              opacity: 0.6 + Math.cos(frame * 0.02) * 0.3,
              transform: `translate(${-shiftX * 0.8}px, ${shiftY * 1.2}px)`,
              willChange: "transform, opacity",
            }}
          />
        </AbsoluteFill>

        {/* Ambient Grid Backdrop */}
        <GridBackdrop gridSize={80} strokeColor="rgba(56, 189, 248, 0.06)" opacity={0.4} />

        {/* Deterministic Stellar Fields */}
        <ParticleField count={90} color={primaryColor} speed={0.35} maxRadius={2.8} driftRange={30} />
        <ParticleField count={70} color={accentColor} speed={0.5} maxRadius={3.2} driftRange={45} />
        <ParticleField count={40} color="#ffffff" speed={0.8} maxRadius={1.8} driftRange={60} />

        {/* Scene 1: Arrival — Deep Space Entry (Frames 0 - 160) */}
        <Sequence from={0} durationInFrames={160}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <GlowBadge
              label="EXPEDITION // 001: DEEP COSMOS"
              accentColor={primaryColor}
              startFrame={15}
              style={{ marginBottom: 30 }}
            />
            <KineticTitle
              text="COSMIC AURORA"
              preset="cinematic"
              startFrame={25}
              fontSize={110}
              letterSpacing={20}
              color={palettes.deepSpace.textPrimary}
              glowColor={primaryColor}
            />
            <div
              style={{
                marginTop: 22,
                fontSize: 22,
                letterSpacing: 8,
                color: palettes.deepSpace.textSecondary,
                textTransform: "uppercase",
                opacity: interpolateSafe(frame, [40, 75], [0, 0.9]),
              }}
            >
              Interstellar Trajectory Locked
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* Scene 2: Expansion — Orbital Telemetry (Frames 150 - 330) */}
        <Sequence from={150} durationInFrames={180}>
          <AbsoluteFill style={{ pointerEvents: "none" }}>
            <OrbitalRings
              cx={cx}
              cy={cy}
              radius={260}
              ringCount={5}
              primaryColor={primaryColor}
              accentColor={secondaryColor}
              rotationSpeed={0.7}
              tiltAngle={68}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <GlowBadge
                label="STELLAR EXPANSION MATRIX"
                accentColor={secondaryColor}
                startFrame={12}
                style={{ marginBottom: 28 }}
              />
              <KineticTitle
                text="HORIZON ZERO"
                preset="bouncy"
                startFrame={22}
                fontSize={98}
                letterSpacing={16}
                color={palettes.deepSpace.textPrimary}
                glowColor={secondaryColor}
              />
              <div
                style={{
                  marginTop: 20,
                  fontSize: 20,
                  letterSpacing: 7,
                  color: palettes.deepSpace.textSecondary,
                  opacity: interpolateSafe(frame - 150, [35, 65], [0, 0.85]),
                }}
              >
                Dimensional Boundary Crossing
              </div>
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* Scene 3: Convergence — Singularity Resonance (Frames 310 - 470) */}
        <Sequence from={310} durationInFrames={160}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <GlowBadge
              label="SINGULARITY RESONANCE ACHIEVED"
              accentColor={accentColor}
              startFrame={12}
              style={{ marginBottom: 28 }}
            />
            <KineticTitle
              text="NEBULA DRIFT"
              preset="snappy"
              startFrame={22}
              fontSize={102}
              letterSpacing={18}
              color={palettes.deepSpace.textPrimary}
              glowColor={accentColor}
            />
            <div
              style={{
                marginTop: 20,
                fontSize: 22,
                letterSpacing: 9,
                color: primaryColor,
                opacity: interpolateSafe(frame - 310, [30, 65], [0, 0.9]),
              }}
            >
              Harmonic Resonance at 60 FPS
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* Scene 4: Transcendence — Odyssey Complete (Frames 450 - 600) */}
        <Sequence from={450} durationInFrames={150}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <OrbitalRings
              cx={cx}
              cy={cy}
              radius={320}
              ringCount={4}
              primaryColor={accentColor}
              accentColor={primaryColor}
              rotationSpeed={0.4}
              tiltAngle={40}
            />
            <GlowBadge
              label="MISSION VOYAGE COMPLETE"
              accentColor={primaryColor}
              startFrame={12}
              style={{ marginBottom: 24 }}
            />
            <KineticTitle
              text="BEYOND THE INFINITE"
              preset="smooth"
              startFrame={24}
              fontSize={92}
              letterSpacing={15}
              color={palettes.deepSpace.textPrimary}
              glowColor={primaryColor}
            />
            <div
              style={{
                marginTop: 18,
                fontSize: 18,
                letterSpacing: 6,
                color: palettes.deepSpace.textSecondary,
                opacity: interpolateSafe(frame - 450, [30, 60], [0, 0.85]),
              }}
            >
              Engineered with Remotion & React 18
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* Specular Light Sweeps */}
        <LightSweep startFrame={25} durationFrames={45} color="rgba(56, 189, 248, 0.35)" angle={30} />
        <LightSweep startFrame={190} durationFrames={45} color="rgba(255, 0, 127, 0.35)" angle={-30} />
        <LightSweep startFrame={350} durationFrames={45} color="rgba(121, 40, 202, 0.4)" angle={25} />
      </CameraRig>

      {/* Cinematic Vignette */}
      <VignetteOverlay intensity={0.45} color="#010206" />
    </AbsoluteFill>
  );
};

export default CosmicAurora;