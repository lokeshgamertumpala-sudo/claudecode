import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  KineticTitle,
  GlowBadge,
  ParticleField,
  VignetteOverlay,
  interpolateSafe,
  getSpringValue,
  getInOutOpacity,
  palettes,
} from "../library";

export interface ItIsAiProps {
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

export const ItIsAi: React.FC<ItIsAiProps> = ({
  title = "IT IS AI",
  subtitle = "NVIDIA Nemotron Ultra 550B MoE",
  accentColor = palettes.cyberpunk.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const totalFrames = 300; // 5 seconds at 60fps

  // Background breathing animation
  const bgBreath = getSpringValue(frame, fps, "gentle", 0);
  const bgScale = interpolateSafe(bgBreath, [0, 1], [1, 1.02]);

  // Title entrance - staggered
  const titleOpacity = getInOutOpacity(frame, totalFrames, 20);
  const titleSpring = getSpringValue(frame, fps, "bouncy", 20);
  const titleScale = interpolateSafe(titleSpring, [0, 1], [0.5, 1]);

  // Subtitle fade in
  const subtitleOpacity = interpolateSafe(frame, [60, 100], [0, 1]);
  const subtitleSpring = getSpringValue(frame, fps, "smooth", 70);
  const subtitleY = interpolateSafe(subtitleSpring, [0, 1], [40, 0]);

  // Badge pulse
  const badgePulse = getSpringValue(frame, fps, "slowMo", 10);
  const badgeScale = interpolateSafe(badgePulse, [0, 1], [0.9, 1.05]);

  // Particle field
  const particleOpacity = interpolateSafe(frame, [0, 30], [0, 1]);

  // Vignette intensity
  const vignetteIntensity = interpolateSafe(frame, [0, 300], [0.6, 0.8]);

  // Glitch effect on "AI"
  const glitchOffset = Math.sin(frame * 0.5) * 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palettes.cyberpunk.background,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Orbitron', 'Rajdhani', 'Segoe UI', sans-serif",
        transform: `scale(${bgScale})`,
      }}
    >
      {/* Ambient particle field */}
      <ParticleField
        count={50}
        color={accentColor}
        speed={0.4}
        maxRadius={2}
        style={{ opacity: particleOpacity }}
      />

      {/* Vignette overlay */}
      <VignetteOverlay intensity={vignetteIntensity} color="#000000" />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          textAlign: "center",
          padding: 40,
        }}
      >
        {/* Glowing badge */}
        <GlowBadge
          label="POWERED BY"
          accentColor={accentColor}
          startFrame={10}
          style={{
            transform: `scale(${badgeScale})`,
            fontSize: 14,
            letterSpacing: 4,
          }}
        />

        {/* Main title with glitch effect on AI */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <KineticTitle
            text="IT IS"
            fontSize={96}
            color={palettes.cyberpunk.textPrimary}
            glowColor={`${accentColor}66`}
            preset="cinematic"
            startFrame={20}
            style={{
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
              position: "relative",
            }}
          >
            <span style={{ fontSize: 96, color: palettes.cyberpunk.textPrimary, fontWeight: 700 }}>
              AI
            </span>
            {/* Glitch overlay on AI */}
            <span
              style={{
                position: "absolute",
                fontSize: 96,
                color: accentColor,
                fontWeight: 700,
                opacity: 0.3,
                transform: `translateX(${glitchOffset}px)`,
                pointerEvents: "none",
              }}
            >
              AI
            </span>
            <span
              style={{
                position: "absolute",
                fontSize: 96,
                color: palettes.cyberpunk.textSecondary,
                fontWeight: 700,
                opacity: 0.2,
                transform: `translateX(${-glitchOffset * 0.5}px)`,
                pointerEvents: "none",
              }}
            >
              AI
            </span>
          </div>
        </div>

        {/* Subtitle with rise animation */}
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            fontSize: 24,
            color: palettes.cyberpunk.textSecondary,
            letterSpacing: 6,
            fontWeight: 300,
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: interpolateSafe(frame, [80, 140], [0, 300]),
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            opacity: subtitleOpacity,
            borderRadius: 1,
          }}
        />

        {/* Bottom tag */}
        <div
          style={{
            opacity: interpolateSafe(frame, [180, 220], [0, 1]),
            fontSize: 16,
            color: palettes.cyberpunk.textSecondary,
            letterSpacing: 2,
            fontWeight: 400,
          }}
        >
          Running on NVIDIA NIM Enterprise Inference
        </div>
      </div>

      {/* Scanline overlay for cyberpunk aesthetic */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.03),
            rgba(0,0,0,0.03) 1px,
            transparent 1px,
            transparent 3px
          )`,
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};