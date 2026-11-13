import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const ParticleVortex: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const centerX = width / 2;
  const centerY = height / 2;

  const particleCount = 120;
  const particles = Array.from({ length: particleCount }).map((_, i) => {
    // Deterministic pseudo-random seed based on index
    const seed = (i * 9301 + 49297) % 233280;
    const baseRadius = 50 + (seed % 420);
    const speed = 0.02 + ((seed % 100) / 100) * 0.04;
    const offset = (seed % 360) * (Math.PI / 180);

    // Orbit calculation with inward gravity spiral
    const angle = offset + frame * speed;
    const radiusPulse = Math.sin((frame * 0.05) + i) * 20;
    const r = baseRadius + radiusPulse;

    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    const size = 3 + (seed % 6);

    const hue = (180 + (r * 0.5) + (frame * 0.5)) % 360;
    const opacity = interpolate(r, [50, 480], [0.9, 0.2]);

    return { id: i, x, y, size, hue, opacity };
  });

  const coreGlow = interpolate(Math.sin(frame * 0.1), [-1, 1], [30, 70]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#02040a",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="vortexGrad">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#ff007f" />
          </radialGradient>
        </defs>

        {/* Core Pulsing Vortex Singularity */}
        <circle
          cx={centerX}
          cy={centerY}
          r={28}
          fill="url(#vortexGrad)"
          filter="url(#glow)"
        />

        {/* Orbiting Spiral Streamlines */}
        {particles.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={`hsl(${p.hue}, 100%, 60%)`}
            opacity={p.opacity}
            filter="url(#glow)"
          />
        ))}
      </svg>

      {/* Floating Center Badge */}
      <div
        style={{
          zIndex: 10,
          textAlign: "center",
          color: "#fff",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: 8,
            textTransform: "uppercase",
            textShadow: `0 0 ${coreGlow}px rgba(0, 240, 255, 0.8)`,
          }}
        >
          PARTICLE VORTEX
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 4,
            color: "#ff007f",
            marginTop: 8,
          }}
        >
          MATHEMATICAL VECTOR FIELD // 60 FPS
        </div>
      </div>
    </AbsoluteFill>
  );
};
