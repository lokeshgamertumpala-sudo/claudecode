import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ParticleField,
  OrbitalRings,
  VignetteOverlay,
  KineticTitle,
  palettes,
  interpolateSafe,
} from "../library";

export interface BeyondEarthProps {
  primaryColor?: string;
  accentColor?: string;
  duration?: number;
}

export const BeyondEarth: React.FC<BeyondEarthProps> = ({
  primaryColor = "#0284c7",
  accentColor = "#38bdf8",
  duration = 600, // 10.0 seconds @ 60fps
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  // Scene timing markers (in frames @ 60fps)
  // 0.0s - 3.0s (f: 0-180)   : Deep cosmic starfield & nebula approach
  // 3.0s - 8.0s (f: 180-480) : Earth orbital arc, telemetry & spacecraft vector
  // 8.0s - 10.0s (f: 480-600): Hero shot "BEYOND EARTH" cinematic hold

  // Camera drift (slow Ken Burns push-in from 1.0 to 1.15)
  const cameraScale = interpolate(frame, [0, duration], [1.0, 1.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Earth scale and position choreography
  const earthScaleSpring = spring({
    frame: frame - 120,
    fps,
    config: { damping: 18, mass: 1.2, stiffness: 60 },
  });
  const earthScale = interpolate(earthScaleSpring, [0, 1], [0.4, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const earthOpacity = interpolate(frame, [100, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Orbital arc progress
  const orbitProgress = interpolate(frame, [150, 500], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Spacecraft coordinate along elliptical orbit
  const orbitA = 480;
  const orbitB = 180;
  const orbitAngle = -0.6 + orbitProgress * 1.8;
  const shipX = cx + Math.cos(orbitAngle) * orbitA;
  const shipY = cy + Math.sin(orbitAngle) * orbitB;

  // Hero Title "BEYOND EARTH" entrance at 8.0s (frame 480)
  const titleEntrance = spring({
    frame: frame - 460,
    fps,
    config: { damping: 15, mass: 0.9, stiffness: 90 },
  });
  const titleOpacity = interpolate(frame, [460, 490], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleTracking = interpolate(frame, [460, 600], [0.25, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Atmospheric day/night shadow angle
  const shadowRotation = interpolate(frame, [0, duration], [15, 65]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030712",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      }}
    >
      {/* 1. Deep Celestial Starfield & Nebula Glow */}
      <div
        style={{
          transform: `scale(${cameraScale})`,
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      >
        <ParticleField count={90} color="#e0f2fe" speed={0.4} maxRadius={3.0} />

        {/* Distant Blue/Violet Nebula Clouds */}
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            left: cx - 450,
            top: cy - 450,
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.04) 45%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* 2. Procedural Photorealistic Earth & Atmosphere (3.0s - 8.0s) */}
      <div
        style={{
          position: "absolute",
          left: cx - 260,
          top: cy - 260,
          width: 520,
          height: 520,
          opacity: earthOpacity,
          transform: `scale(${earthScale})`,
          pointerEvents: "none",
        }}
      >
        {/* Outer Atmospheric Azure Glow */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.35) 45%, rgba(2, 132, 199, 0.15) 65%, transparent 80%)",
            filter: "blur(25px)",
          }}
        />

        {/* Earth Base Sphere with Ocean/Land Gradients */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            background: "radial-gradient(circle at 35% 35%, #0284c7 0%, #0369a1 40%, #0c4a6e 75%, #082f49 100%)",
            boxShadow: "inset -40px -40px 90px rgba(0, 0, 0, 0.95), 0 0 50px rgba(56, 189, 248, 0.4)",
          }}
        >
          {/* Continental Procedural Shading */}
          <svg
            viewBox="0 0 520 520"
            style={{
              width: "100%",
              height: "100%",
              opacity: 0.65,
              transform: `rotate(${frame * 0.04}deg)`,
            }}
          >
            <path
              d="M 120 180 Q 180 140 240 190 T 360 210 Q 400 280 340 340 T 200 360 Q 110 320 120 180 Z"
              fill="#10b981"
              opacity="0.35"
              filter="blur(8px)"
            />
            <path
              d="M 280 120 Q 340 90 400 130 T 460 220 Q 420 300 350 280 T 260 190 Z"
              fill="#059669"
              opacity="0.3"
              filter="blur(10px)"
            />
          </svg>

          {/* Dynamic Day/Night Terminator Shadow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(${shadowRotation}deg, rgba(0,0,0,0) 25%, rgba(2,6,23,0.7) 50%, rgba(2,6,23,0.98) 80%)`,
            }}
          />

          {/* Thin Atmospheric Limb Ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid rgba(186, 230, 253, 0.6)",
              boxShadow: "0 0 15px rgba(56, 189, 248, 0.8)",
            }}
          />
        </div>
      </div>

      {/* 3. Spacecraft Trajectory Arcs & Orbital Telemetry SVG */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glowArc">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Elliptical Orbital Vector Arc */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={orbitA}
          ry={orbitB}
          fill="none"
          stroke="url(#orbitGrad)"
          strokeWidth="2.5"
          strokeDasharray="12 6"
          filter="url(#glowArc)"
          opacity={earthOpacity * 0.85}
          transform={`rotate(-15 ${cx} ${cy})`}
        />

        {/* Orbiting Spacecraft Node */}
        {frame > 160 && (
          <g transform={`translate(${shipX}, ${shipY})`} filter="url(#glowArc)">
            <circle r="6" fill="#38bdf8" />
            <circle r="14" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
            <line x1="0" y1="0" x2="35" y2="-25" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
            <text x="42" y="-22" fill="#e0f2fe" fontSize="12" fontFamily="monospace" letterSpacing="1px">
              SC-01 [TRAJECTORY LOCK]
            </text>
          </g>
        )}
      </svg>

      {/* 4. Telemetry Telemetry HUD (Frame 180+) */}
      {frame > 180 && (
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 80,
            color: "rgba(224, 242, 254, 0.7)",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.8,
            letterSpacing: 1.5,
            opacity: earthOpacity,
          }}
        >
          <div style={{ color: "#38bdf8", fontWeight: 700 }}>ORBITAL TELEMETRY • LEO-380KM</div>
          <div>ALTITUDE: 384,400 KM</div>
          <div>VELOCITY: 7.78 KM/S (T-REL: {(frame / 60).toFixed(2)}s)</div>
          <div>INCLINATION: 51.64° • STATE: NOMINAL</div>
        </div>
      )}

      {/* 5. HERO SHOT: "BEYOND EARTH" (8.0s - 10.0s, Frame 480-600) */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleEntrance, [0, 1], [35, 0])}px)`,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: `${titleTracking}em`,
            color: "#f8fafc",
            textTransform: "uppercase",
            textShadow: "0 0 35px rgba(56, 189, 248, 0.6), 0 4px 15px rgba(0,0,0,0.8)",
            textAlign: "center",
          }}
        >
          BEYOND EARTH
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "0.5em",
            color: "#38bdf8",
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          A DEEP SPACE EXPLORATION ODYSSEY
        </div>
      </div>

      {/* 6. Cinematic Edge Vignette */}
      <VignetteOverlay intensity={0.7} color="#020617" />
    </AbsoluteFill>
  );
};
