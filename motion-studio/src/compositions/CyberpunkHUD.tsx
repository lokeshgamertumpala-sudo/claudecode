import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const CyberpunkHUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Rotations
  const rot1 = (frame * 1.5) % 360;
  const rot2 = (-frame * 0.8) % 360;
  const rot3 = (frame * 2.2) % 360;

  // Waveform bars
  const barCount = 32;
  const bars = Array.from({ length: barCount }).map((_, i) => {
    const val = Math.sin((frame * 0.15) + i * 0.4) * 0.5 + 0.5;
    return Math.max(10, val * 120);
  });

  // Telemetry values
  const ping = Math.floor(interpolate(Math.sin(frame * 0.05), [-1, 1], [35, 42]));
  const scanlineY = (frame * 5) % height;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#03080e",
        fontFamily: "'Courier New', Courier, monospace",
        color: "#00f0ff",
        overflow: "hidden",
      }}
    >
      {/* Moving Scanline */}
      <div
        style={{
          position: "absolute",
          top: scanlineY,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: "rgba(0, 240, 255, 0.4)",
          boxShadow: "0 0 12px #00f0ff",
          pointerEvents: "none",
        }}
      />

      {/* Background Hex Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.5,
        }}
      />

      {/* Central Rotating HUD Reticle */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 500,
          height: 500,
          marginTop: -250,
          marginLeft: -250,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Outer Ring */}
        <div
          style={{
            position: "absolute",
            width: 460,
            height: 460,
            borderRadius: "50%",
            border: "2px dashed rgba(0, 240, 255, 0.4)",
            transform: `rotate(${rot1}deg)`,
          }}
        />

        {/* Middle Segmented Ring */}
        <div
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            border: "3px dotted rgba(255, 0, 127, 0.6)",
            transform: `rotate(${rot2}deg)`,
          }}
        />

        {/* Inner Solid Reticle */}
        <div
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            border: "1px solid rgba(0, 240, 255, 0.8)",
            boxShadow: "inset 0 0 25px rgba(0, 240, 255, 0.3)",
            transform: `rotate(${rot3}deg)`,
          }}
        />

        {/* Crosshair Lines */}
        <div style={{ position: "absolute", width: 280, height: 1, backgroundColor: "rgba(0, 240, 255, 0.5)" }} />
        <div style={{ position: "absolute", height: 280, width: 1, backgroundColor: "rgba(0, 240, 255, 0.5)" }} />

        {/* Center Target Core */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: "#00f0ff",
            boxShadow: "0 0 20px #00f0ff, 0 0 40px #ff007f",
          }}
        />
      </div>

      {/* Top Left Header Telemetry */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 50,
          backgroundColor: "rgba(3, 14, 24, 0.75)",
          border: "1px solid rgba(0, 240, 255, 0.5)",
          padding: "16px 24px",
          borderRadius: 6,
          boxShadow: "0 0 15px rgba(0, 240, 255, 0.2)",
        }}
      >
        <div style={{ fontSize: 13, letterSpacing: 3, color: "#ff007f", fontWeight: "bold" }}>
          SYSTEM ACTIVE // CLAUDE CODE V2
        </div>
        <div style={{ fontSize: 24, fontWeight: "bold", letterSpacing: 1, marginTop: 4 }}>
          MISTRAL LARGE 4 (1.05T MoE)
        </div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
          INFERENCE: NVIDIA NIM GRACE BLACKWELL
        </div>
        <div style={{ fontSize: 12, color: "#39ff14", marginTop: 4 }}>
          LATENCY: ~0.38s | TTFT: 120ms | STATUS: 100% HEALTHY
        </div>
      </div>

      {/* Top Right Live Clock & Pings */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 50,
          textAlign: "right",
          backgroundColor: "rgba(3, 14, 24, 0.75)",
          border: "1px solid rgba(255, 0, 127, 0.5)",
          padding: "16px 24px",
          borderRadius: 6,
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 2, color: "#00f0ff" }}>
          STREAM: 60 FPS DETERMINISTIC
        </div>
        <div style={{ fontSize: 26, fontWeight: "bold", color: "#ff007f" }}>
          FRAME: {frame} / 300
        </div>
        <div style={{ fontSize: 12, color: "#00f0ff" }}>
          PING: {ping} ms | FAILOVER MESH: ARMED
        </div>
      </div>

      {/* Bottom Waveform Visualizer */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 50,
          right: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: 140,
          backgroundColor: "rgba(3, 14, 24, 0.6)",
          border: "1px solid rgba(0, 240, 255, 0.3)",
          borderRadius: 6,
          padding: "16px 24px",
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: `${100 / (barCount * 1.5)}%`,
              height: `${h}px`,
              backgroundColor: i % 2 === 0 ? "#00f0ff" : "#ff007f",
              boxShadow: `0 0 10px ${i % 2 === 0 ? "rgba(0, 240, 255, 0.5)" : "rgba(255, 0, 127, 0.5)"}`,
              borderRadius: "2px 2px 0 0",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
