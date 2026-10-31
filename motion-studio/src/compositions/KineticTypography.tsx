import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface KineticTypographyProps {
  title?: string;
  subtitle?: string;
  tagline?: string;
  primaryColor?: string;
  accentColor?: string;
}

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  title = "NEXT-GEN MOTION",
  subtitle = "POWERED BY MISTRAL LARGE 4",
  tagline = "60FPS DETERMINISTIC REMOTION ENGINE",
  primaryColor = "#00f0ff",
  accentColor = "#ff007f",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background pulse and subtle zoom
  const bgScale = interpolate(frame, [0, 180], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered springs for phrases
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });

  const subtitleSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 100 },
  });

  const taglineSpring = spring({
    frame: frame - 36,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 90 },
  });

  // Glow flicker
  const glow = interpolate(Math.sin(frame / 6), [-1, 1], [20, 45]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#05070f",
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${bgScale})`,
        overflow: "hidden",
      }}
    >
      {/* Background Radial Gradient Mesh */}
      <div
        style={{
          position: "absolute",
          width: width * 1.5,
          height: height * 1.5,
          background: `radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.12) 0%, rgba(255, 0, 127, 0.08) 40%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Grid Lines Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.7,
        }}
      />

      {/* Main Content Stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          zIndex: 10,
          textAlign: "center",
          padding: "0 40px",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: 88,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: 0,
            background: `linear-gradient(135deg, #ffffff 20%, ${primaryColor} 70%, ${accentColor} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 ${glow}px rgba(0, 240, 255, 0.6))`,
            transform: `scale(${titleSpring}) translateY(${(1 - titleSpring) * 60}px)`,
            opacity: titleSpring,
          }}
        >
          {title}
        </h1>

        {/* Subtitle Badge */}
        <div
          style={{
            display: "inline-block",
            padding: "10px 28px",
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: `1px solid rgba(0, 240, 255, 0.4)`,
            boxShadow: `0 0 20px rgba(0, 240, 255, 0.2)`,
            transform: `scale(${subtitleSpring}) translateY(${(1 - subtitleSpring) * 40}px)`,
            opacity: subtitleSpring,
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: primaryColor,
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.25em",
            color: "rgba(255, 255, 255, 0.7)",
            textTransform: "uppercase",
            margin: 0,
            transform: `translateY(${(1 - taglineSpring) * 30}px)`,
            opacity: taglineSpring,
          }}
        >
          {tagline}
        </p>
      </div>

      {/* Decorative Corner Accents */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 60,
          height: 60,
          borderTop: `3px solid ${primaryColor}`,
          borderLeft: `3px solid ${primaryColor}`,
          opacity: titleSpring,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          width: 60,
          height: 60,
          borderBottom: `3px solid ${accentColor}`,
          borderRight: `3px solid ${accentColor}`,
          opacity: titleSpring,
        }}
      />
    </AbsoluteFill>
  );
};
