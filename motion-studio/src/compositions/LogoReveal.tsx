import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Reveal Spring
  const emblemSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 140 },
  });

  const textSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 100 },
  });

  // Light sweep angle and translation
  const lightX = interpolate(frame, [30, 90], [-width, width * 1.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shockwave burst on reveal
  const shockwaveScale = interpolate(frame, [40, 80], [0.8, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shockwaveOpacity = interpolate(frame, [40, 80], [0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060913",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background Deep Glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(255, 0, 127, 0.05) 50%, transparent 75%)",
          filter: "blur(60px)",
        }}
      />

      {/* Shockwave Ring */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: "2px solid #00f0ff",
          transform: `scale(${shockwaveScale})`,
          opacity: shockwaveOpacity,
          boxShadow: "0 0 40px #00f0ff",
        }}
      />

      {/* Center Logo Group */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          zIndex: 10,
        }}
      >
        {/* Geometric Hex Shield Emblem */}
        <div
          style={{
            position: "relative",
            width: 160,
            height: 160,
            transform: `scale(${emblemSpring}) rotate(${(1 - emblemSpring) * 180}deg)`,
            opacity: emblemSpring,
          }}
        >
          <svg viewBox="0 0 100 100" width="160" height="160">
            <polygon
              points="50 5, 90 25, 90 75, 50 95, 10 75, 10 25"
              fill="rgba(0, 240, 255, 0.1)"
              stroke="#00f0ff"
              strokeWidth="4"
              strokeLinejoin="round"
              filter="drop-shadow(0 0 16px rgba(0, 240, 255, 0.8))"
            />
            <polygon
              points="50 20, 80 35, 80 65, 50 80, 20 65, 20 35"
              fill="rgba(255, 0, 127, 0.2)"
              stroke="#ff007f"
              strokeWidth="3"
              strokeLinejoin="round"
              filter="drop-shadow(0 0 12px rgba(255, 0, 127, 0.8))"
            />
            {/* Center Core Dot */}
            <circle cx="50" cy="50" r="8" fill="#ffffff" filter="drop-shadow(0 0 10px #ffffff)" />
          </svg>

          {/* Light Sweep Sheen */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)`,
              transform: `translateX(${lightX}px)`,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Brand Typography */}
        <div
          style={{
            textAlign: "center",
            transform: `translateY(${(1 - textSpring) * 40}px)`,
            opacity: textSpring,
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: 10,
              color: "#ffffff",
              textTransform: "uppercase",
              textShadow: "0 0 30px rgba(0, 240, 255, 0.6)",
            }}
          >
            CLAUDE CODE
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 6,
              color: "#00f0ff",
              marginTop: 6,
              textTransform: "uppercase",
            }}
          >
            MISTRAL LARGE 4 // ULTRA EDITION
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
