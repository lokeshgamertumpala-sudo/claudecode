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

export interface MinimalMotionProps {
  title?: string;
  subtitle?: string;
  tagline?: string;
  accentColor?: string;
}

export const MinimalMotion: React.FC<MinimalMotionProps> = ({
  title = "SIMPLICITY",
  subtitle = "LESS, BUT BETTER",
  tagline = "PRECISION 60FPS MOTION DESIGN",
  accentColor = palettes.appleMinimal.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const totalFrames = 120; // Exactly 2 seconds @ 60fps

  // Smooth full-scene entrance & exit
  const sceneOpacity = getInOutOpacity(frame, totalFrames, 18);

  // Geometric center accent ring breathing
  const ringSpring = getSpringValue(frame, fps, "smooth", 10);
  const ringScale = interpolateSafe(ringSpring, [0, 1], [0.8, 1]);
  const ringRotate = (frame * 0.4) % 360;

  // Horizontal accent line expansion
  const lineProgress = getSpringValue(frame, fps, "smooth", 25);
  const lineWidth = interpolateSafe(lineProgress, [0, 1], [0, 120]);

  // Subtitle and tagline smooth fade in
  const subOpacity = interpolateSafe(frame, [30, 50], [0, 1]);
  const tagOpacity = interpolateSafe(frame, [45, 65], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palettes.appleMinimal.background,
        justifyContent: "center",
        alignItems: "center",
        opacity: sceneOpacity,
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. Subtle Ambient Particle Float */}
      <ParticleField count={24} color="#ffffff" speed={0.5} maxRadius={2} driftRange={25} />

      {/* 2. Soft Radial Glow Spotlight */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          filter: "blur(60px)",
          transform: `scale(${1 + Math.sin(frame * 0.06) * 0.05})`,
          pointerEvents: "none",
        }}
      />

      {/* 3. Vignette */}
      <VignetteOverlay intensity={0.7} color="#000000" />

      {/* 4. Center Geometric Breathing Rings */}
      <svg
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          pointerEvents: "none",
          transform: `scale(${ringScale}) rotate(${ringRotate}deg)`,
        }}
      >
        <circle
          cx={250}
          cy={250}
          r={180}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={1}
          strokeDasharray="4 8"
        />
        <circle
          cx={250}
          cy={250}
          r={220}
          fill="none"
          stroke={`${accentColor}33`}
          strokeWidth={1.5}
          strokeDasharray="40 200"
        />
      </svg>

      {/* 5. Minimalist Content Stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          zIndex: 10,
        }}
      >
        <GlowBadge
          label="2-SECOND MINIMAL"
          accentColor={accentColor}
          startFrame={5}
        />

        <KineticTitle
          text={title}
          fontSize={80}
          fontWeight={800}
          color={palettes.appleMinimal.textPrimary}
          glowColor={`${accentColor}55`}
          preset="smooth"
          startFrame={12}
        />

        {/* Minimalist Horizontal Line Accent */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: accentColor,
            borderRadius: 2,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
        />

        <p
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: palettes.appleMinimal.textPrimary,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: subOpacity,
            transform: `translateY(${interpolateSafe(frame, [30, 50], [10, 0])}px)`,
          }}
        >
          {subtitle}
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 400,
            color: palettes.appleMinimal.textSecondary,
            letterSpacing: 3,
            textTransform: "uppercase",
            opacity: tagOpacity,
          }}
        >
          {tagline}
        </p>
      </div>
    </AbsoluteFill>
  );
};
