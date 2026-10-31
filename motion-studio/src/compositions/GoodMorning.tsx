import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface GoodMorningProps {
  text?: string;
  accentColor?: string;
}

// Apple-style minimal "Good morning." — 5 seconds @ 60fps = 300 frames
export const GoodMorning: React.FC<GoodMorningProps> = ({
  text = "Good morning",
  accentColor = "#ff9f0a",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const DURATION = 300;

  // Global envelope: soft fade in / out
  const globalOpacity = interpolate(frame, [0, 24, 272, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text entrance spring: blur -> sharp, rise -> settle
  const textSpring = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.9, stiffness: 90 },
  });
  const blur = interpolate(textSpring, [0, 1], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(textSpring, [0, 1], [56, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle breathing scale after entrance
  const breathe = 1 + Math.sin(frame / 40) * 0.006 * textSpring;

  // Sun: soft warm disc rising from below the text, Apple-sunrise style
  const sunRise = interpolate(frame, [0, 180], [-height * 0.42, -height * 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sunOpacity = interpolate(frame, [0, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow cinematic zoom on the whole scene
  const bgScale = interpolate(frame, [0, DURATION], [1.04, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle warm vignette wash that warms up over the first half
  const warmWash = interpolate(frame, [0, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Per-character staggered reveal for "Good morning"
  const chars = text.split("");
  const CHAR_STAGGER = 2.2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f5f5f7",
        overflow: "hidden",
        fontFamily:
          "-apple-system, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Cinematic slow zoom layer */}
      <AbsoluteFill style={{ transform: `scale(${bgScale})` }}>
        {/* Warm sunrise wash */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 90% 70% at 50% 108%, rgba(255, 159, 10, ${0.20 * warmWash}) 0%, rgba(255, 149, 0, ${0.10 * warmWash}) 40%, transparent 70%)`,
          }}
        />

        {/* Rising sun disc */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: width * 0.34,
            height: width * 0.34,
            borderRadius: "50%",
            transform: `translate(-50%, calc(-50% + ${sunRise}px))`,
            background: `radial-gradient(circle, rgba(255, 214, 10, ${0.55 * sunOpacity}) 0%, rgba(255, 159, 10, ${0.38 * sunOpacity}) 45%, rgba(255, 159, 10, 0) 72%)`,
            filter: "blur(10px)",
          }}
        />
      </AbsoluteFill>

      {/* Text block */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: globalOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            transform: `translateY(${rise}px) scale(${breathe})`,
            filter: `blur(${blur}px)`,            opacity: textOpacity,
          }}
        >
          {chars.map((ch, i) => {
            const local = spring({
              frame: frame - i * CHAR_STAGGER,
              fps,
              config: { damping: 18, mass: 0.8, stiffness: 120 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontSize: 190,
                  fontWeight: 600,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.05,
                  color: "#1d1d1f",
                  opacity: interpolate(local, [0, 1], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  transform: `translateY(${interpolate(local, [0, 1], [34, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}px) scale(${interpolate(local, [0, 1], [0.92, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })})`,
                  whiteSpace: "pre",
                }}
              >
                {ch}
              </span>
            );
          })}
          {/* Apple-style accent period */}
          <span
            style={{
              display: "inline-block",
              fontSize: 190,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              color: accentColor,
              opacity: interpolate(frame, [chars.length * CHAR_STAGGER + 14, chars.length * CHAR_STAGGER + 44], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              transform: `scale(${spring({
                frame: frame - (chars.length * CHAR_STAGGER + 10),
                fps,
                config: { damping: 9, mass: 0.5, stiffness: 200 },
              })})`,
            }}
          >
            .
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
