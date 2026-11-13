import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type NeonPortalProps = {
  primaryColor?: string;
  accentColor?: string;
  ringCount?: number;
};

const BASE_RADIUS = 640;
const ZOOM_LOOP = 120; // frames per camera-zoom cycle (2s at 60fps)
const TOTAL_FRAMES = 240;

const polygonPoints = (sides: number, radius: number): string =>
  Array.from({ length: sides })
    .map((_, k) => {
      const angle = (k / sides) * Math.PI * 2 - Math.PI / 2;
      return `${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`;
    })
    .join(" ");

export const NeonPortal: React.FC<NeonPortalProps> = ({
  primaryColor = "#00f0ff",
  accentColor = "#ff007f",
  ringCount = 16,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  // Spring-physics entrance: portal blooms 0 -> 1 with organic overshoot
  const bloom = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  // Spring-physics rotation kick on entry, eases out over the intro
  const spinKick = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });

  // interpolate() camera zoom: eased looping punch-in, clamped at both ends
  const local = frame % ZOOM_LOOP;
  const zoom = interpolate(local, [0, ZOOM_LOOP / 2, ZOOM_LOOP], [1, 1.3, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cameraScale = bloom * zoom;

  // Deterministic slow camera drift + intro spin recovery
  const cameraRot = frame * 0.15 + (1 - spinKick) * 160;

  // Core singularity pulse (frame-indexed sine, fully deterministic)
  const corePulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [-10, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tunnel rings: deterministic depth z in [0,1], 0 = far, 1 = at camera.
  // Each frame every ring advances toward the camera and wraps.
  const rings = Array.from({ length: ringCount }).map((_, i) => {
    const z = ((i / ringCount) + frame * 0.0045) % 1;
    const scale = 0.02 + Math.pow(z, 2.4) * 1.9;
    const opacity = interpolate(z, [0, 0.12, 0.8, 1], [0, 0.95, 0.95, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const rot = i * 24 + frame * (i % 2 === 0 ? 0.55 : -0.85);
    const sides = 6 + (i % 3) * 2; // hexagon / octagon / decagon
    const color = i % 2 === 0 ? primaryColor : accentColor;
    return { i, z, scale, opacity, rot, sides, color };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#020109", overflow: "hidden" }}>
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(2, 1, 9, 0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="neonGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="coreGlow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="coreGrad">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor={primaryColor} />
            <stop offset="100%" stopColor="rgba(2, 1, 9, 0)" />
          </radialGradient>
        </defs>

        {/* Camera layer: spring bloom x interpolate zoom */}
        <g transform={`translate(${cx} ${cy}) rotate(${cameraRot}) scale(${cameraScale})`}>
          {rings.map((r) => {
            const pts = polygonPoints(r.sides, BASE_RADIUS);
            const strokeW = Math.max(0.6, 4.5 / r.scale);
            return (
              <g
                key={r.i}
                transform={`rotate(${r.rot}) scale(${r.scale})`}
                opacity={r.opacity}
              >
                {/* Wide translucent halo */}
                <polygon
                  points={pts}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={strokeW * 3.2}
                  strokeOpacity={0.28}
                  filter="url(#neonGlow)"
                />
                {/* Bright neon core line */}
                <polygon
                  points={pts}
                  fill={r.color}
                  fillOpacity={0.045 * r.z}
                  stroke={r.color}
                  strokeWidth={strokeW}
                  filter="url(#neonGlow)"
                />
              </g>
            );
          })}

          {/* Singularity core */}
          <circle r={64 + corePulse} fill="url(#coreGrad)" filter="url(#coreGlow)" />
        </g>
      </svg>

      {/* Title overlay */}
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 900,
              letterSpacing: 18,
              color: "#fff",
              textShadow: `0 0 18px ${primaryColor}, 0 0 60px ${primaryColor}, 0 0 120px ${accentColor}`,
            }}
          >
            NEON PORTAL
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 6,
              marginTop: 14,
              color: accentColor,
              textShadow: `0 0 12px ${accentColor}`,
            }}
          >
            SPRING PHYSICS // INTERPOLATE CAMERA ZOOM // 60 FPS
          </div>
        </div>
      </AbsoluteFill>

      {/* Corner HUD readouts */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 48,
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 13,
          letterSpacing: 3,
          color: primaryColor,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      >
        NEON_PORTAL.TSX // RINGS {ringCount}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 36,
          right: 48,
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 13,
          letterSpacing: 3,
          color: accentColor,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      >
        FRAME {frame} / {TOTAL_FRAMES}
      </div>
    </AbsoluteFill>
  );
};
