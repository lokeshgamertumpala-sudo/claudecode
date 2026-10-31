import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface HiGreetingProps {
  text?: string;
  primaryColor?: string;
  accentColor?: string;
}

const LETTERS = ["H", "I"];

export const HiGreeting: React.FC<HiGreetingProps> = ({
  text = "HI",
  primaryColor = "#00f0ff",
  accentColor = "#ff007f",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const letters = text.split("").length === LETTERS.length ? text.split("") : LETTERS;

  // Background slow zoom
  const bgScale = interpolate(frame, [0, 120], [1, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Global entrance/exit envelope: fade in 0-10, hold, fade out 105-120
  const globalOpacity = interpolate(frame, [0, 10, 105, 120], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Letter springs (staggered by 8 frames)
  const letterSprings = letters.map((_, i) =>
    spring({
      frame: frame - i * 8,
      fps,
      config: { damping: 10, mass: 0.5, stiffness: 140 },
    })
  );

  // Glow pulse (deterministic sin)
  const glow = interpolate(Math.sin(frame / 5), [-1, 1], [28, 60]);

  // Ring pulse expanding outward from center
  const ringProgress = interpolate(frame, [0, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringSize = interpolate(ringProgress, [0, 1], [0, Math.max(width, height) * 1.2]);
  const ringOpacity = interpolate(ringProgress, [0, 0.25, 1], [0.8, 0.35, 0]);

  // Deterministic particle burst (seeded by index, frame-driven)
  const PARTICLES = 26;
  const particles = Array.from({ length: PARTICLES }, (_, i) => {
    const angle = (i / PARTICLES) * Math.PI * 2 + (i * 0.37) % 0.6;
    const speed = 260 + ((i * 53) % 320);
    const travel = interpolate(frame, [4, 90], [0, speed], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fade = interpolate(frame, [50, 100], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const size = 4 + ((i * 29) % 10);
    return {
      x: Math.cos(angle) * travel,
      y: Math.sin(angle) * travel,
      fade,
      size,
      color: i % 2 === 0 ? primaryColor : accentColor,
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#05070f",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        transform: `scale(${bgScale})`,
        opacity: globalOpacity,
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Radial gradient mesh */}
      <div
        style={{
          position: "absolute",
          width: width * 1.5,
          height: height * 1.5,
          background: `radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.14) 0%, rgba(255, 0, 127, 0.09) 45%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Expanding ring */}
      <div
        style={{
          position: "absolute",
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: `4px solid ${primaryColor}`,
          opacity: ringOpacity,
          boxShadow: `0 0 40px ${primaryColor}`,
        }}
      />

      {/* Particle burst */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: p.fade,
            transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}

      {/* Letters */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          zIndex: 10,
        }}
      >
        {letters.map((letter, i) => {
          const s = letterSprings[i];
          return (
            <span
              key={i}
              style={{
                fontSize: 420,
                fontWeight: 900,
                lineHeight: 1,
                margin: "0 10px",
                background:
                  i % 2 === 0
                    ? `linear-gradient(160deg, #ffffff 10%, ${primaryColor} 60%, ${accentColor} 110%)`
                    : `linear-gradient(200deg, #ffffff 10%, ${accentColor} 60%, ${primaryColor} 110%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: `drop-shadow(0 0 ${glow}px ${i % 2 === 0 ? primaryColor : accentColor})`,
                transform: `scale(${s}) translateY(${(1 - s) * 120}px) rotate(${(1 - s) * -12}deg)`,
                opacity: s,
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Underline sweep */}
      <div
        style={{
          position: "absolute",
          bottom: height * 0.28,
          height: 8,
          width: interpolate(frame, [20, 60], [0, width * 0.32], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          borderRadius: 4,
          background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
          boxShadow: `0 0 24px ${accentColor}`,
          opacity: globalOpacity,
        }}
      />

      {/* Corner accents */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 48,
          width: 70,
          height: 70,
          borderTop: `4px solid ${primaryColor}`,
          borderLeft: `4px solid ${primaryColor}`,
          opacity: globalOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 48,
          right: 48,
          width: 70,
          height: 70,
          borderBottom: `4px solid ${accentColor}`,
          borderRight: `4px solid ${accentColor}`,
          opacity: globalOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
