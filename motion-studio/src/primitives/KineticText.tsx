import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SpringPreset, staggerSpring, interpolateClamped } from "./springs";

export interface KineticTextProps {
  text: string;
  splitBy?: "words" | "chars" | "lines";
  preset?: SpringPreset;
  startFrame?: number;
  staggerFrames?: number;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  glowColor?: string;
  gradient?: string;
  letterSpacing?: number;
  initialBlur?: number;
  initialTranslateY?: number;
  initialScale?: number;
  textAlign?: "left" | "center" | "right";
  style?: React.CSSProperties;
}

/**
 * KineticText: High-performance staggered word or character entrance
 * featuring spring physics, blur-to-sharp optical focus, and optional neon glow.
 */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  splitBy = "words",
  preset = "snappy",
  startFrame = 0,
  staggerFrames = 4,
  fontSize = 54,
  fontWeight = 700,
  color = "#ffffff",
  glowColor,
  gradient,
  letterSpacing = 0,
  initialBlur = 14,
  initialTranslateY = 32,
  initialScale = 0.92,
  textAlign = "center",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tokenize text based on split mode
  const tokens = React.useMemo(() => {
    if (splitBy === "lines") {
      return text.split("\n");
    }
    if (splitBy === "words") {
      return text.split(/\s+/).filter(Boolean);
    }
    // Chars mode
    return Array.from(text);
  }, [text, splitBy]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent:
          textAlign === "center"
            ? "center"
            : textAlign === "right"
            ? "flex-end"
            : "flex-start",
        alignItems: "center",
        gap: splitBy === "words" ? "0.35em" : splitBy === "chars" ? "0.02em" : "0.5em",
        textAlign,
        letterSpacing: `${letterSpacing}px`,
        ...style,
      }}
    >
      {tokens.map((token, index) => {
        // Individual token spring progress (0 -> 1)
        const springVal = staggerSpring(
          frame,
          fps,
          index,
          staggerFrames,
          preset,
          startFrame
        );

        const opacity = interpolateClamped(springVal, [0, 0.9], [0, 1]);
        const translateY = interpolateClamped(springVal, [0, 1], [initialTranslateY, 0]);
        const scale = interpolateClamped(springVal, [0, 1], [initialScale, 1.0]);
        const blur = interpolateClamped(springVal, [0, 1], [initialBlur, 0]);

        // Text shadow / glow calculation
        const textShadow = glowColor
          ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}55`
          : undefined;

        const tokenStyle: React.CSSProperties = {
          display: "inline-block",
          fontSize,
          fontWeight,
          color: gradient ? "transparent" : color,
          backgroundImage: gradient,
          backgroundClip: gradient ? "text" : undefined,
          WebkitBackgroundClip: gradient ? "text" : undefined,
          textShadow,
          opacity,
          filter: blur > 0.1 ? `blur(${blur}px)` : "none",
          transform: `translate3d(0, ${translateY}px, 0) scale3d(${scale}, ${scale}, 1)`,
          transformOrigin: "center bottom",
          willChange: "transform, opacity, filter",
          whiteSpace: splitBy === "chars" && token === " " ? "pre" : "normal",
        };

        return (
          <span key={`${index}-${token}`} style={tokenStyle}>
            {token}
          </span>
        );
      })}
    </div>
  );
};
