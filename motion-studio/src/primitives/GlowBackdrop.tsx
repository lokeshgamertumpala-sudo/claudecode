import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { interpolateClamped } from "./springs";

/* =========================================================================
   1. Sunrise Glow Backdrop
   ========================================================================= */
export interface SunriseGlowProps {
  sunColor?: string;
  horizonColor?: string;
  skyColor?: string;
  riseProgress?: number; // 0 to 1, or auto-calculated
  style?: React.CSSProperties;
}

export const SunriseGlow: React.FC<SunriseGlowProps> = ({
  sunColor = "#ff9f0a",
  horizonColor = "#ff453a",
  skyColor = "#0a0a14",
  riseProgress,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // If riseProgress not explicitly provided, calculate a smooth sunrise arc
  const progress =
    riseProgress !== undefined
      ? riseProgress
      : interpolateClamped(frame, [0, 150], [0, 1]);

  const sunY = interpolateClamped(progress, [0, 1], [85, 55]); // Percentage from top
  const sunScale = interpolateClamped(progress, [0, 1], [0.8, 1.2]);
  const glowOpacity = interpolateClamped(progress, [0, 1], [0.5, 0.95]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: skyColor,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Sky atmospheric gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% ${sunY}%, ${horizonColor}33 0%, ${skyColor} 70%)`,
        }}
      />

      {/* Sun Disc & Corona */}
      <div
        style={{
          position: "absolute",
          top: `${sunY}%`,
          left: "50%",
          width: 320,
          height: 320,
          marginLeft: -160,
          marginTop: -160,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${sunColor} 0%, ${horizonColor} 50%, transparent 75%)`,
          filter: "blur(40px)",
          opacity: glowOpacity,
          transform: `scale(${sunScale})`,
          willChange: "transform, opacity",
        }}
      />

      {/* Horizon atmospheric beam */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: `linear-gradient(180deg, transparent 0%, ${horizonColor}22 60%, ${sunColor}18 100%)`,
          filter: "blur(20px)",
        }}
      />
    </div>
  );
};

/* =========================================================================
   2. Radial Glow Backdrop
   ========================================================================= */
export interface RadialGlowProps {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  cx?: number; // percentage
  cy?: number;
  radius?: number;
  pulse?: boolean;
  style?: React.CSSProperties;
}

export const RadialGlow: React.FC<RadialGlowProps> = ({
  primaryColor = "#00f0ff",
  secondaryColor = "#7928ca",
  backgroundColor = "#040407",
  cx = 50,
  cy = 50,
  radius = 65,
  pulse = true,
  style,
}) => {
  const frame = useCurrentFrame();

  const pulseScale = pulse
    ? 1.0 + Math.sin(frame * 0.05) * 0.06
    : 1.0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${cx}% ${cy}%, ${primaryColor}28 0%, ${secondaryColor}18 ${radius * pulseScale * 0.6}%, transparent ${radius * pulseScale}%)`,
          filter: "blur(48px)",
          willChange: "background",
        }}
      />
    </div>
  );
};

/* =========================================================================
   3. Deterministic Particle Backdrop
   ========================================================================= */
export interface ParticleBackdropProps {
  count?: number;
  color?: string;
  speed?: number;
  maxRadius?: number;
  seed?: number;
  style?: React.CSSProperties;
}

export const ParticleBackdrop: React.FC<ParticleBackdropProps> = ({
  count = 40,
  color = "#ffffff",
  speed = 0.8,
  maxRadius = 3,
  seed = 42,
  style,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate deterministic particles based on mathematical PRNG
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Deterministic pseudo-random values derived from index and seed
      const pseudoX = Math.abs(Math.sin((i + 1) * seed * 12.9898)) % 1;
      const pseudoY = Math.abs(Math.cos((i + 1) * seed * 78.233)) % 1;
      const pseudoR = Math.abs(Math.sin((i + 1) * 37.719)) % 1;
      const pseudoSpeed = 0.4 + (Math.abs(Math.cos((i + 1) * 51.137)) % 0.8);
      const pseudoPhase = Math.abs(Math.sin((i + 1) * 91.24)) * Math.PI * 2;

      return {
        baseX: pseudoX * width,
        baseY: pseudoY * height,
        radius: 1 + pseudoR * (maxRadius - 1),
        driftSpeed: pseudoSpeed * speed,
        phase: pseudoPhase,
      };
    });
  }, [count, color, speed, maxRadius, seed, width, height]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        ...style,
      }}
    >
      {particles.map((p, i) => {
        // Continuous upward and horizontal organic floating
        const offsetY = ((frame * p.driftSpeed + p.baseY) % (height + 40)) - 20;
        const currentY = height - offsetY;
        const offsetX = Math.sin(frame * 0.03 + p.phase) * 16;
        const currentX = (p.baseX + offsetX + width) % width;
        const opacity = 0.2 + Math.sin(frame * 0.05 + p.phase) * 0.3;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: currentX,
              top: currentY,
              width: p.radius * 2,
              height: p.radius * 2,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: Math.max(0.1, Math.min(0.85, opacity)),
              boxShadow: `0 0 ${p.radius * 3}px ${color}`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
};

/* =========================================================================
   4. Organic Mesh Glow Backdrop
   ========================================================================= */
export interface MeshGlowProps {
  backgroundColor?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  style?: React.CSSProperties;
}

export const MeshGlow: React.FC<MeshGlowProps> = ({
  backgroundColor = "#05050a",
  color1 = "#00f0ff",
  color2 = "#ff007f",
  color3 = "#7928ca",
  speed = 1.0,
  style,
}) => {
  const frame = useCurrentFrame();

  const orb1X = 35 + Math.sin(frame * 0.02 * speed) * 15;
  const orb1Y = 30 + Math.cos(frame * 0.025 * speed) * 12;

  const orb2X = 65 + Math.cos(frame * 0.018 * speed) * 14;
  const orb2Y = 60 + Math.sin(frame * 0.022 * speed) * 15;

  const orb3X = 50 + Math.sin(frame * 0.015 * speed + 2) * 18;
  const orb3Y = 75 + Math.cos(frame * 0.02 * speed + 2) * 10;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at ${orb1X}% ${orb1Y}%, ${color1}33 0%, transparent 45%),
            radial-gradient(circle at ${orb2X}% ${orb2Y}%, ${color2}28 0%, transparent 45%),
            radial-gradient(circle at ${orb3X}% ${orb3Y}%, ${color3}24 0%, transparent 50%)
          `,
          filter: "blur(60px)",
        }}
      />
    </div>
  );
};

/* =========================================================================
   5. Unified GlowBackdrop Component
   ========================================================================= */
export interface GlowBackdropProps {
  type?: "sunrise" | "radial" | "particles" | "mesh";
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  particleCount?: number;
  style?: React.CSSProperties;
}

export const GlowBackdrop: React.FC<GlowBackdropProps> = ({
  type = "sunrise",
  primaryColor = "#ff9f0a",
  accentColor = "#ff453a",
  backgroundColor = "#08080f",
  particleCount = 36,
  style,
}) => {
  switch (type) {
    case "radial":
      return (
        <RadialGlow
          primaryColor={primaryColor}
          secondaryColor={accentColor}
          backgroundColor={backgroundColor}
          style={style}
        />
      );
    case "particles":
      return (
        <div style={{ position: "absolute", inset: 0, backgroundColor, ...style }}>
          <ParticleBackdrop count={particleCount} color={primaryColor} />
        </div>
      );
    case "mesh":
      return (
        <MeshGlow
          backgroundColor={backgroundColor}
          color1={primaryColor}
          color2={accentColor}
          style={style}
        />
      );
    case "sunrise":
    default:
      return (
        <SunriseGlow
          sunColor={primaryColor}
          horizonColor={accentColor}
          skyColor={backgroundColor}
          style={style}
        />
      );
  }
};
