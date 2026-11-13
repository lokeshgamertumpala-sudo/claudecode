import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { getSpringValue, SpringPresetName } from "./springs";
import { interpolateSafe } from "./interpolations";

export interface KineticTitleProps {
  text: string;
  preset?: SpringPresetName;
  staggerFrames?: number;
  startFrame?: number;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  glowColor?: string;
  letterSpacing?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * High-performance kinetic title with per-character or per-word spring entrance.
 * 100% frame-deterministic, zero layout shift.
 */
export const KineticTitle: React.FC<KineticTitleProps> = ({
  text,
  preset = "bouncy",
  staggerFrames = 2,
  startFrame = 0,
  fontSize = 72,
  fontWeight = 800,
  color = "#ffffff",
  glowColor,
  letterSpacing = -1,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: fontSize * 0.3,
        rowGap: fontSize * 0.2,
        ...style,
      }}
    >
      {words.map((word, wordIndex) => {
        const delay = startFrame + wordIndex * (staggerFrames * 3);
        const progress = getSpringValue(frame, fps, preset, delay);

        const opacity = interpolateSafe(progress, [0, 0.4, 1], [0, 0.9, 1]);
        const translateY = interpolateSafe(progress, [0, 1], [fontSize * 0.45, 0]);
        const scale = interpolateSafe(progress, [0, 1], [0.85, 1]);

        return (
          <span
            key={wordIndex}
            style={{
              display: "inline-block",
              fontSize,
              fontWeight,
              color,
              letterSpacing,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              filter: glowColor
                ? `drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 0 50px ${glowColor})`
                : undefined,
              willChange: "transform, opacity",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export interface GlowBadgeProps {
  label: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  startFrame?: number;
  style?: React.CSSProperties;
}

/**
 * Glassmorphic Pill / Badge with subtle spring entrance and animated specular glow.
 */
export const GlowBadge: React.FC<GlowBadgeProps> = ({
  label,
  accentColor = "#00f0ff",
  backgroundColor = "rgba(255, 255, 255, 0.06)",
  textColor = "#ffffff",
  startFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = getSpringValue(frame, fps, "snappy", startFrame);
  const opacity = interpolateSafe(progress, [0, 1], [0, 1]);
  const scale = interpolateSafe(progress, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 20px",
        borderRadius: 9999,
        backgroundColor,
        border: `1px solid ${accentColor}44`,
        boxShadow: `0 0 20px ${accentColor}22, inset 0 0 12px ${accentColor}11`,
        opacity,
        transform: `scale(${scale})`,
        backdropFilter: "blur(12px)",
        ...style,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: accentColor,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: textColor,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};
