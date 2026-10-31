import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SpringPreset, getSpringVal, interpolateClamped } from "./springs";

/* =========================================================================
   1. iPhone 16 Pro Mockup
   ========================================================================= */
export interface iPhone16ProProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  tiltX?: number;
  tiltY?: number;
  scale?: number;
  startFrame?: number;
  preset?: SpringPreset;
  screenColor?: string;
  style?: React.CSSProperties;
}

export const IPhone16Pro: React.FC<iPhone16ProProps> = ({
  children,
  width = 380,
  height = 780,
  tiltX = 0,
  tiltY = 0,
  scale = 1.0,
  startFrame = 0,
  preset = "smooth",
  screenColor = "#000000",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = getSpringVal(frame, fps, preset, startFrame);
  const animScale = interpolateClamped(entrance, [0, 1], [0.85 * scale, scale]);
  const animOpacity = interpolateClamped(entrance, [0, 0.8], [0, 1]);
  const animY = interpolateClamped(entrance, [0, 1], [40, 0]);

  // Subtle natural floating drift
  const driftY = Math.sin((frame / 60) * Math.PI) * 4;

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        opacity: animOpacity,
        transform: `translate3d(0, ${animY + driftY}px, 0) scale3d(${animScale}, ${animScale}, 1) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out",
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {/* Outer Titanium Bezel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 54,
          background: "linear-gradient(145deg, #3a3a40 0%, #1e1e22 50%, #4a4a52 100%)",
          boxShadow:
            "0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
          padding: 8,
          boxSizing: "border-box",
        }}
      >
        {/* Inner Dark Border Ring */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 46,
            background: screenColor,
            overflow: "hidden",
            boxShadow: "inset 0 0 0 2px rgba(0, 0, 0, 0.9)",
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 104,
              height: 28,
              borderRadius: 18,
              background: "#000000",
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              boxShadow: "0 0 2px rgba(255, 255, 255, 0.15)",
            }}
          >
            {/* Front Camera Lens */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "radial-gradient(circle, #102a45 40%, #000000 90%)",
                boxShadow: "inset 0 0 2px rgba(0, 240, 255, 0.4)",
              }}
            />
            {/* Ambient Sensor */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#080808",
              }}
            />
          </div>

          {/* Screen Content Viewport */}
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
              zIndex: 10,
            }}
          >
            {children}
          </div>

          {/* Glass Specular Glare Sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 40%)",
              pointerEvents: "none",
              zIndex: 25,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const iPhone16Pro = IPhone16Pro;

/* =========================================================================
   2. MacBook Pro Mockup
   ========================================================================= */
export interface MacBookProProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  tiltX?: number;
  tiltY?: number;
  scale?: number;
  startFrame?: number;
  preset?: SpringPreset;
  screenColor?: string;
  style?: React.CSSProperties;
}

export const MacBookPro: React.FC<MacBookProProps> = ({
  children,
  width = 820,
  height = 510,
  tiltX = 0,
  tiltY = 0,
  scale = 1.0,
  startFrame = 0,
  preset = "smooth",
  screenColor = "#08080c",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = getSpringVal(frame, fps, preset, startFrame);
  const animScale = interpolateClamped(entrance, [0, 1], [0.88 * scale, scale]);
  const animOpacity = interpolateClamped(entrance, [0, 0.8], [0, 1]);
  const animY = interpolateClamped(entrance, [0, 1], [30, 0]);

  const screenH = height * 0.88;
  const baseH = height * 0.12;

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        opacity: animOpacity,
        transform: `translate3d(0, ${animY}px, 0) scale3d(${animScale}, ${animScale}, 1) perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {/* Display Lid */}
      <div
        style={{
          width: "100%",
          height: screenH,
          borderRadius: "14px 14px 0 0",
          background: "linear-gradient(180deg, #2b2b32 0%, #17171a 100%)",
          padding: "10px 10px 0 10px",
          boxSizing: "border-box",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.7)",
          position: "relative",
        }}
      >
        {/* Screen Display Frame */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "8px 8px 0 0",
            background: screenColor,
            overflow: "hidden",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Top Camera Notch */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 90,
              height: 16,
              borderRadius: "0 0 8px 8px",
              background: "#000000",
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "radial-gradient(circle, #2563eb 30%, #000 80%)",
              }}
            />
          </div>

          {/* Screen Content */}
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
              zIndex: 10,
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Lower Chassis / Keyboard Base */}
      <div
        style={{
          width: width * 1.05,
          height: baseH,
          marginLeft: `-${width * 0.025}px`,
          background: "linear-gradient(180deg, #323238 0%, #1a1a1e 100%)",
          borderRadius: "0 0 16px 16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* Display Hinge Groove */}
        <div
          style={{
            width: 140,
            height: 5,
            borderRadius: "0 0 4px 4px",
            background: "#111114",
          }}
        />
      </div>
    </div>
  );
};

/* =========================================================================
   3. Floating Browser Window
   ========================================================================= */
export interface BrowserWindowProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  url?: string;
  title?: string;
  tiltX?: number;
  tiltY?: number;
  scale?: number;
  startFrame?: number;
  preset?: SpringPreset;
  style?: React.CSSProperties;
}

export const BrowserWindow: React.FC<BrowserWindowProps> = ({
  children,
  width = 860,
  height = 540,
  url = "https://claude.ai/motion-studio",
  title = "Motion Studio Preview",
  tiltX = 0,
  tiltY = 0,
  scale = 1.0,
  startFrame = 0,
  preset = "snappy",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = getSpringVal(frame, fps, preset, startFrame);
  const animScale = interpolateClamped(entrance, [0, 1], [0.92 * scale, scale]);
  const animOpacity = interpolateClamped(entrance, [0, 0.8], [0, 1]);
  const animY = interpolateClamped(entrance, [0, 1], [35, 0]);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        opacity: animOpacity,
        transform: `translate3d(0, ${animY}px, 0) scale3d(${animScale}, ${animScale}, 1) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        borderRadius: 14,
        background: "rgba(18, 18, 24, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow:
          "0 30px 60px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {/* Titlebar Header */}
      <div
        style={{
          height: 44,
          background: "rgba(255, 255, 255, 0.04)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 14,
          flexShrink: 0,
        }}
      >
        {/* macOS Traffic Light Dots */}
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ff5f56",
              boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.2)",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ffbd2e",
              boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.2)",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#27c93f",
              boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.2)",
            }}
          />
        </div>

        {/* Browser Address Bar */}
        <div
          style={{
            flex: 1,
            maxWidth: 480,
            margin: "0 auto",
            height: 26,
            borderRadius: 6,
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            gap: 6,
          }}
        >
          <span style={{ color: "#10b981", fontSize: 10 }}>🔒</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {url}
          </span>
        </div>

        {/* Title Tag */}
        <div
          style={{
            fontSize: 12,
            color: "rgba(255, 255, 255, 0.4)",
            fontWeight: 500,
          }}
        >
          {title}
        </div>
      </div>

      {/* Content Viewport */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* =========================================================================
   4. 3D Tilt Card
   ========================================================================= */
export interface TiltCardProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  tiltX?: number;
  tiltY?: number;
  scale?: number;
  glareIntensity?: number;
  startFrame?: number;
  preset?: SpringPreset;
  style?: React.CSSProperties;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  width = 460,
  height = 300,
  tiltX = 8,
  tiltY = -12,
  scale = 1.0,
  glareIntensity = 0.2,
  startFrame = 0,
  preset = "elastic",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = getSpringVal(frame, fps, preset, startFrame);
  const animScale = interpolateClamped(entrance, [0, 1], [0.8 * scale, scale]);
  const animOpacity = interpolateClamped(entrance, [0, 0.9], [0, 1]);
  const animY = interpolateClamped(entrance, [0, 1], [40, 0]);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        opacity: animOpacity,
        transform: `translate3d(0, ${animY}px, 0) scale3d(${animScale}, ${animScale}, 1) perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transformStyle: "preserve-3d",
        borderRadius: 20,
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 25px 50px -10px rgba(0, 0, 0, 0.75)",
        overflow: "hidden",
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {/* Glare Gradient Layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, ${glareIntensity}) 0%, transparent 60%)`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      <div style={{ position: "relative", zIndex: 5, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
};

/* =========================================================================
   5. Unified DeviceMockup Wrapper
   ========================================================================= */
export interface DeviceMockupProps {
  type: "iphone" | "macbook" | "browser" | "card";
  children?: React.ReactNode;
  width?: number;
  height?: number;
  tiltX?: number;
  tiltY?: number;
  scale?: number;
  startFrame?: number;
  preset?: SpringPreset;
  url?: string;
  style?: React.CSSProperties;
}

export const DeviceMockup: React.FC<DeviceMockupProps> = ({
  type,
  children,
  width,
  height,
  tiltX,
  tiltY,
  scale,
  startFrame,
  preset,
  url,
  style,
}) => {
  switch (type) {
    case "iphone":
      return (
        <IPhone16Pro
          width={width}
          height={height}
          tiltX={tiltX}
          tiltY={tiltY}
          scale={scale}
          startFrame={startFrame}
          preset={preset}
          style={style}
        >
          {children}
        </IPhone16Pro>
      );
    case "macbook":
      return (
        <MacBookPro
          width={width}
          height={height}
          tiltX={tiltX}
          tiltY={tiltY}
          scale={scale}
          startFrame={startFrame}
          preset={preset}
          style={style}
        >
          {children}
        </MacBookPro>
      );
    case "browser":
      return (
        <BrowserWindow
          width={width}
          height={height}
          url={url}
          tiltX={tiltX}
          tiltY={tiltY}
          scale={scale}
          startFrame={startFrame}
          preset={preset}
          style={style}
        >
          {children}
        </BrowserWindow>
      );
    case "card":
    default:
      return (
        <TiltCard
          width={width}
          height={height}
          tiltX={tiltX}
          tiltY={tiltY}
          scale={scale}
          startFrame={startFrame}
          preset={preset}
          style={style}
        >
          {children}
        </TiltCard>
      );
  }
};
