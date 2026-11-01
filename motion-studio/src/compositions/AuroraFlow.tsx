import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
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

export interface AuroraFlowProps {
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
}

export const AuroraFlow: React.FC<AuroraFlowProps> = ({
  primaryColor = "#00f5a0",
  accentColor = "#7928ca",
  secondaryColor = "#00d9f5",
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;
  const totalFrames = 600; // 10 seconds @ 60fps

  // Camera drift through 10-second timeline
  const zoom = interpolate(frame, [0, totalFrames], [1.0, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Flowing aurora wave mathematical modulation
  const wave1 = Math.sin(frame * 0.02) * 60;
  const wave2 = Math.cos(frame * 0.03) * 40;
  const auroraPulse = 0.7 + Math.sin(frame * 0.04) * 0.3;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palettes.deepSpace.background,
        overflow: "hidden",
      }}
    >
      <GlowDefs id="auroraGlow" blurStdDev={12} />

      {/* Camera Rig Staging */}
      <CameraRig durationFrames={totalFrames} startZoom={1.0} endZoom={1.08}>
        {/* Deep space cosmic backdrop & organic Aurora ribbons */}
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              inset: -100,
              background: `radial-gradient(ellipse 90% 60% at 50% 30%, ${accentColor}33 0%, ${secondaryColor}22 40%, transparent 70%)`,
              filter: "blur(60px)",
              opacity: auroraPulse,
              transform: `translate(${wave1}px, ${wave2}px)`,
              willChange: "transform, opacity",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: -150,
              background: `radial-gradient(ellipse 70% 50% at 60% 65%, ${primaryColor}28 0%, ${accentColor}18 50%, transparent 75%)`,
              filter: "blur(80px)",
              opacity: 0.6 + Math.cos(frame * 0.025) * 0.25,
              transform: `translate(${-wave2}px, ${wave1 * 0.8}px)`,
              willChange: "transform, opacity",
            }}
          />
        </AbsoluteFill>

        {/* Ambient Tech Grid */}
        <GridBackdrop gridSize={75} strokeColor="rgba(0, 245, 160, 0.05)" opacity={0.5} />

        {/* High-Performance Deterministic Particle Fields */}
        <ParticleField count={80} color={primaryColor} speed={0.4} maxRadius={2.5} driftRange={35} />
        <ParticleField count={60} color={secondaryColor} speed={0.6} maxRadius={3.5} driftRange={50} />

        {/* Scene 1: Aurora Genesis (Frames 0 - 160) */}
        <Sequence from={0} durationInFrames={160}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <GlowBadge
              label="INITIALIZING NEURAL HARMONICS"
              accentColor={primaryColor}
              startFrame={15}
              style={{ marginBottom: 32 }}
            />
            <KineticTitle
              text="AURORA FLOW"
              preset="cinematic"
              startFrame={25}
              fontSize={110}
              letterSpacing={18}
              color={palettes.deepSpace.textPrimary}
              glowColor={primaryColor}
            />
            <div
              style={{
                marginTop: 24,
                fontSize: 22,
                letterSpacing: 8,
                color: palettes.deepSpace.textSecondary,
                textTransform: "uppercase",
                opacity: interpolateSafe(frame, [45, 75], [0, 0.9]),
              }}
            >
              Autonomous 60FPS Generative Engine
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* Scene 2: Orbital Convergence (Frames 150 - 330) */}
        <Sequence from={150} durationInFrames={180}>
          <AbsoluteFill style={{ pointerEvents: "none" }}>
            <OrbitalRings
              cx={cx}
              cy={cy}
              radius={240}
              ringCount={4}
              primaryColor={primaryColor}
              accentColor={accentColor}
              rotationSpeed={0.8}
              tiltAngle={62}
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
                label="SYNCHRONIZED VECTOR MESH"
                accentColor={secondaryColor}
                startFrame={10}
                style={{ marginBottom: 28 }}
              />
              <KineticTitle
                text="CONVERGENCE"
                preset="bouncy"
                startFrame={20}
                fontSize={96}
                letterSpacing={14}
                color={palettes.deepSpace.textPrimary}
                glowColor={secondaryColor}
              />
              <div
                style={{
                  marginTop: 20,
                  fontSize: 20,
                  letterSpacing: 6,
                  color: palettes.deepSpace.textSecondary,
                  opacity: interpolateSafe(frame - 150, [30, 60], [0, 0.85]),
                }}
              >
                Multi-Node Procedural Alignment
              </div>
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* Scene 3: Quantum Horizon (Frames 310 - 470) */}
        <Sequence from={310} durationInFrames={160}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <GlowBadge
              label="QUANTUM COMPUTE MATRIX"
              accentColor={accentColor}
              startFrame={10}
              style={{ marginBottom: 28 }}
            />
            <KineticTitle
              text="QUANTUM HORIZON"
              preset="snappy"
              startFrame={20}
              fontSize={100}
              letterSpacing={16}
              color={palettes.deepSpace.textPrimary}
              glowColor={accentColor}
            />
            <div
              style={{
                marginTop: 20,
                fontSize: 22,
                letterSpacing: 10,
                color: primaryColor,
                opacity: interpolateSafe(frame - 310, [30, 65], [0, 0.9]),
              }}
            >
              Zero-Latency Motion Synthesis
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* Scene 4: Infinite Drift Outro (Frames 450 - 600) */}
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
              radius={300}
              ringCount={3}
              primaryColor={accentColor}
              accentColor={primaryColor}
              rotationSpeed={0.5}
              tiltAngle={45}
            />
            <GlowBadge
              label="∞ CONTINUOUS FLOW ACTIVE"
              accentColor={primaryColor}
              startFrame={10}
              style={{ marginBottom: 24 }}
            />
            <KineticTitle
              text="NEXT ERA MOTION"
              preset="smooth"
              startFrame={20}
              fontSize={90}
              letterSpacing={14}
              color={palettes.deepSpace.textPrimary}
              glowColor={primaryColor}
            />
            <div
              style={{
                marginTop: 18,
                fontSize: 18,
                letterSpacing: 6,
                color: palettes.deepSpace.textSecondary,
                opacity: interpolateSafe(frame - 450, [30, 60], [0, 0.8]),
              }}
            >
              Rendered with Remotion & NVIDIA NIM
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* Specular Light Sweeps at Key Emotional Transitions */}
        <LightSweep startFrame={20} durationFrames={50} color="rgba(0, 245, 160, 0.3)" angle={35} />
        <LightSweep startFrame={180} durationFrames={50} color="rgba(0, 217, 245, 0.35)" angle={-25} />
        <LightSweep startFrame={340} durationFrames={50} color="rgba(121, 40, 202, 0.35)" angle={30} />
      </CameraRig>

      {/* High-End Vignette */}
      <VignetteOverlay intensity={0.4} color="#02040a" />
    </AbsoluteFill>
  );
};

export default AuroraFlow;