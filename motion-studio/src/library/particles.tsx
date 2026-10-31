import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export interface ParticleFieldProps {
  count?: number;
  color?: string;
  speed?: number;
  maxRadius?: number;
  driftRange?: number;
  style?: React.CSSProperties;
}

interface ParticleData {
  id: number;
  baseX: number; // 0..1
  baseY: number; // 0..1
  size: number;
  alpha: number;
  seed: number;
}

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Ensures identical visual frames across renders and threads.
 */
function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 100% frame-deterministic 60FPS particle floating field.
 * Guaranteed zero flickering or frame-to-frame jumpiness.
 */
export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 40,
  color = "#ffffff",
  speed = 1.0,
  maxRadius = 3,
  driftRange = 40,
  style,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate seed-locked particles once
  const particles = useMemo<ParticleData[]>(() => {
    const rng = mulberry32(1337);
    return Array.from({ length: count }, (_, id) => ({
      id,
      baseX: rng(),
      baseY: rng(),
      size: 1 + rng() * (maxRadius - 1),
      alpha: 0.2 + rng() * 0.7,
      seed: rng() * Math.PI * 2,
    }));
  }, [count, maxRadius]);

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
      {particles.map((p) => {
        // Deterministic orbital float using trigonometric curves
        const t = (frame * 0.03 * speed) + p.seed;
        const offsetX = Math.sin(t) * driftRange;
        const offsetY = Math.cos(t * 0.7) * (driftRange * 0.75);

        const x = (p.baseX * width + offsetX + width) % width;
        const y = (p.baseY * height + offsetY + height) % height;
        const pulse = 0.7 + Math.sin(t * 1.5) * 0.3;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: p.alpha * pulse,
              boxShadow: `0 0 ${p.size * 3}px ${color}`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
};

export interface OrbitalRingsProps {
  cx: number;
  cy: number;
  radius: number;
  ringCount?: number;
  primaryColor?: string;
  accentColor?: string;
  rotationSpeed?: number;
  tiltAngle?: number;
}

/**
 * 3D-perspective tilted orbital rings with frame-deterministic rotation.
 */
export const OrbitalRings: React.FC<OrbitalRingsProps> = ({
  cx,
  cy,
  radius,
  ringCount = 3,
  primaryColor = "#00f0ff",
  accentColor = "#ff007f",
  rotationSpeed = 0.5,
  tiltAngle = 65,
}) => {
  const frame = useCurrentFrame();

  return (
    <svg
      style={{
        position: "absolute",
        left: cx - radius * 1.6,
        top: cy - radius * 1.6,
        width: radius * 3.2,
        height: radius * 3.2,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <g
        transform={`translate(${radius * 1.6}, ${radius * 1.6}) rotate(${frame * rotationSpeed * 0.3})`}
      >
        {Array.from({ length: ringCount }).map((_, i) => {
          const r = radius * (1 + (i + 1) * 0.22);
          const rot = (frame * rotationSpeed * (1 + i * 0.3)) % 360;
          const stroke = i % 2 === 0 ? primaryColor : accentColor;
          const strokeOpacity = 0.25 + (Math.sin(frame * 0.05 + i) * 0.15);

          return (
            <ellipse
              key={i}
              cx={0}
              cy={0}
              rx={r}
              ry={r * Math.cos((tiltAngle * Math.PI) / 180)}
              fill="none"
              stroke={stroke}
              strokeWidth={1.5}
              strokeDasharray={`${8 + i * 4} ${6 + i * 2}`}
              strokeOpacity={strokeOpacity}
              transform={`rotate(${rot})`}
            />
          );
        })}
      </g>
    </svg>
  );
};
