import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { interpolateSafe } from "./interpolations";

export interface VignetteProps {
  intensity?: number; // 0..1
  color?: string;
  style?: React.CSSProperties;
}

/**
 * Cinematic vignette that darkens composition edges, keeping attention centered.
 */
export const VignetteOverlay: React.FC<VignetteProps> = ({
  intensity = 0.8,
  color = "#000000",
  style,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 40%, ${color} ${100 - (1 - intensity) * 30}%)`,
        ...style,
      }}
    />
  );
};

export interface GridBackdropProps {
  gridSize?: number;
  strokeColor?: string;
  opacity?: number;
  perspective?: boolean;
}

/**
 * Subtle tech/sci-fi grid backdrop.
 */
export const GridBackdrop: React.FC<GridBackdropProps> = ({
  gridSize = 60,
  strokeColor = "rgba(255, 255, 255, 0.08)",
  opacity = 0.6,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        backgroundImage: `linear-gradient(to right, ${strokeColor} 1px, transparent 1px), linear-gradient(to bottom, ${strokeColor} 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    />
  );
};

export interface LightSweepProps {
  startFrame?: number;
  durationFrames?: number;
  color?: string;
  angle?: number;
}

/**
 * Specular shine / light sweep that sweeps across the screen or an element.
 */
export const LightSweep: React.FC<LightSweepProps> = ({
  startFrame = 15,
  durationFrames = 40,
  color = "rgba(255, 255, 255, 0.25)",
  angle = 30,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const progress = interpolateSafe(
    frame,
    [startFrame, startFrame + durationFrames],
    [-0.3, 1.3]
  );

  const x = progress * width;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -200,
          bottom: -200,
          left: x,
          width: 140,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          transform: `rotate(${angle}deg)`,
          filter: "blur(10px)",
        }}
      />
    </div>
  );
};

/**
 * Reusable SVG defs providing glow and lighting filters.
 */
export const GlowDefs: React.FC<{ id?: string; blurStdDev?: number }> = ({
  id = "neonGlow",
  blurStdDev = 8,
}) => (
  <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
    <defs>
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={blurStdDev} result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);
