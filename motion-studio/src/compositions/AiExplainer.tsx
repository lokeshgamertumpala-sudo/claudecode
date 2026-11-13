import React, { useMemo } from "react";
import { AbsoluteFill, Series, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ParticleField, VignetteOverlay } from "../library";

// =========================================================================
// Scene 1: Neural Inception (0-10s / Frames 0-600)
// High-dimensional vector injection & initial synaptic activation
// =========================================================================
const Scene01_Inception: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const entrance = spring({ frame: frame - 15, fps, config: { damping: 16, mass: 0.9, stiffness: 75 } });
  const opacity = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  const zoom = interpolate(entrance, [0, 1], [0.85, 1.05]);
  const rotation = interpolate(frame, [0, 600], [0, 12]);

  // Synthetic neural layer nodes
  const nodes = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 220 + (i % 3) * 90;
      return {
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        delay: (i * 7) % 60,
        activeRate: 0.05 + (i % 4) * 0.02,
      };
    });
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#04060e", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={90} color="#38bdf8" speed={0.5} maxRadius={3.5} />

      {/* Deep Central Core Glow */}
      <div
        style={{
          position: "absolute",
          width: 650,
          height: 650,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.12) 40%, transparent 70%)",
          filter: "blur(60px)",
          transform: `scale(${1 + Math.sin(frame * 0.06) * 0.08})`,
        }}
      />

      {/* Rotating Synaptic Network */}
      <div
        style={{
          position: "absolute",
          width: width * 0.8,
          height: height * 0.8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          opacity,
        }}
      >
        <svg width="900" height="900" viewBox="-450 -450 900 900" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="synapseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Synaptic connecting lines */}
          {nodes.map((node, i) => {
            const nextNode = nodes[(i + 4) % nodes.length];
            const pulse = (Math.sin((frame - node.delay) * 0.1) + 1) / 2;
            return (
              <line
                key={`line-${node.id}`}
                x1={node.x}
                y1={node.y}
                x2={nextNode.x}
                y2={nextNode.y}
                stroke="url(#synapseGrad)"
                strokeWidth={1 + pulse * 2}
                strokeOpacity={0.25 + pulse * 0.55}
              />
            );
          })}

          {/* Neural Nodes */}
          {nodes.map((node) => {
            const nodeGlow = (Math.sin(frame * node.activeRate + node.delay) + 1) / 2;
            return (
              <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                <circle r={8 + nodeGlow * 6} fill="#38bdf8" fillOpacity={0.25} filter="url(#glow)" />
                <circle r={4 + nodeGlow * 2} fill="#ffffff" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Minimalist Cinematic Typography */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "#38bdf8",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Phase 01 // Input Tensor Activation
        </span>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "#ffffff",
            textShadow: "0 0 40px rgba(56, 189, 248, 0.4)",
          }}
        >
          NEURAL INCEPTION
        </h1>
      </div>

      <VignetteOverlay intensity={0.7} color="#02040a" />
    </AbsoluteFill>
  );
};

// =========================================================================
// Scene 2: Deep Transformer Architecture (10-22s / Frames 600-1320)
// Multi-Head Attention, Query-Key-Value vector projection rays
// =========================================================================
const Scene02_Attention: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 10, fps, config: { damping: 15, mass: 0.9, stiffness: 85 } });
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const cameraTilt = interpolate(frame, [0, 720], [-10, 10]);

  // Multi-Head Attention Ray coordinates
  const heads = useMemo(() => [
    { title: "Query Vector [Q]", color: "#38bdf8", yOffset: -120 },
    { title: "Key Matrix [K]", color: "#818cf8", yOffset: 0 },
    { title: "Value Projection [V]", color: "#34d399", yOffset: 120 },
  ], []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#030611", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={80} color="#818cf8" speed={0.7} maxRadius={3.0} />

      {/* Layer Depth Projection */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: 1400,
          transform: `scale(${interpolate(entrance, [0, 1], [0.88, 1])}) rotateY(${cameraTilt}deg)`,
          perspective: 1200,
          opacity,
          zIndex: 10,
        }}
      >
        {heads.map((head, hIdx) => {
          const wave = Math.sin((frame + hIdx * 40) * 0.08);
          return (
            <div
              key={head.title}
              style={{
                width: 380,
                height: 480,
                borderRadius: 24,
                backgroundColor: "rgba(15, 23, 42, 0.75)",
                border: `1px solid ${head.color}40`,
                boxShadow: `0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 30px ${head.color}15`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "36px 24px",
                backdropFilter: "blur(20px)",
                transform: `translateY(${wave * 12}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.25em",
                  color: head.color,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                Attention Head 0{hIdx + 1}
              </div>

              <h3 style={{ fontSize: 24, color: "#ffffff", fontWeight: 700, margin: "0 0 28px 0" }}>
                {head.title}
              </h3>

              {/* Dynamic Attention Heatmap Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 8,
                  width: "100%",
                  height: 240,
                }}
              >
                {Array.from({ length: 36 }).map((_, idx) => {
                  const intensity = (Math.sin(frame * 0.1 + idx * 0.5 + hIdx) + 1) / 2;
                  return (
                    <div
                      key={idx}
                      style={{
                        borderRadius: 6,
                        backgroundColor: head.color,
                        opacity: 0.15 + intensity * 0.85,
                        boxShadow: intensity > 0.7 ? `0 0 12px ${head.color}` : "none",
                        transition: "opacity 0.1s ease",
                      }}
                    />
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: "auto",
                  fontSize: 13,
                  color: "#94a3b8",
                  letterSpacing: "0.1em",
                }}
              >
                Softmax Score: {(0.84 + Math.sin(frame * 0.05 + hIdx) * 0.12).toFixed(4)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cinematic Scene Label */}
      <div
        style={{
          position: "absolute",
          top: 100,
          textAlign: "center",
          opacity,
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: 13, letterSpacing: "0.4em", textTransform: "uppercase", color: "#818cf8", fontWeight: 700 }}>
          Phase 02 // Self-Attention Mechanism
        </span>
        <h2 style={{ fontSize: 52, fontWeight: 800, color: "#ffffff", margin: "8px 0 0 0", letterSpacing: "-0.02em" }}>
          MULTI-HEAD TRANSFORMER
        </h2>
      </div>

      <VignetteOverlay intensity={0.75} color="#020409" />
    </AbsoluteFill>
  );
};

// =========================================================================
// Scene 3: Synaptic Backpropagation & Optimization (22-35s / Frames 1320-2100)
// Weight tensors adjusting, loss curve descending, gradient physics
// =========================================================================
const Scene03_Backprop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 10, fps, config: { damping: 16, mass: 0.8, stiffness: 90 } });
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  
  // Real-time Loss Curve parameter
  const lossValue = (0.042 + Math.exp(-frame * 0.008) * 0.65).toFixed(5);
  const accuracy = Math.min(99.4, 88.0 + (frame / 780) * 11.4).toFixed(1);

  return (
    <AbsoluteFill style={{ backgroundColor: "#030814", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={110} color="#f43f5e" speed={0.8} maxRadius={3.0} />

      {/* High-Velocity Gradient Stream */}
      <svg
        width="1600"
        height="500"
        viewBox="0 0 1600 500"
        style={{
          position: "absolute",
          transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1.0])})`,
          opacity,
        }}
      >
        <defs>
          <linearGradient id="gradFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#fb7185" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {Array.from({ length: 12 }).map((_, idx) => {
          const yBase = 80 + idx * 30;
          const phase = frame * 0.05 + idx * 0.4;
          const path = `M 0 ${yBase} Q 400 ${yBase + Math.sin(phase) * 60}, 800 ${yBase + Math.cos(phase) * 60} T 1600 ${yBase}`;
          return (
            <path
              key={idx}
              d={path}
              fill="none"
              stroke="url(#gradFlow)"
              strokeWidth={2 + (idx % 3)}
              strokeDasharray="12 8"
              strokeDashoffset={-frame * (4 + idx)}
            />
          );
        })}
      </svg>

      {/* Floating Metrics HUD */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          gap: 60,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          borderRadius: 20,
          padding: "24px 48px",
          backdropFilter: "blur(24px)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
          opacity,
          zIndex: 20,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#f43f5e", fontWeight: 700, textTransform: "uppercase" }}>
            Stochastic Loss (L)
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#ffffff", marginTop: 4, fontFamily: "monospace" }}>
            {lossValue}
          </div>
        </div>

        <div style={{ width: 1, backgroundColor: "rgba(255, 255, 255, 0.15)" }} />

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase" }}>
            Validation Accuracy
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#ffffff", marginTop: 4, fontFamily: "monospace" }}>
            {accuracy}%
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 120,
          textAlign: "center",
          opacity,
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: 13, letterSpacing: "0.4em", textTransform: "uppercase", color: "#f43f5e", fontWeight: 700 }}>
          Phase 03 // Backpropagation Optimization
        </span>
        <h2 style={{ fontSize: 52, fontWeight: 800, color: "#ffffff", margin: "8px 0 0 0", letterSpacing: "-0.02em" }}>
          GRADIENT CONVERGENCE
        </h2>
      </div>

      <VignetteOverlay intensity={0.75} color="#02040a" />
    </AbsoluteFill>
  );
};

// =========================================================================
// Scene 4: Latent Space Reasoning & Manifold Traversal (35-48s / Frames 2100-2880)
// High-dimensional vector clusters, conceptual semantic embeddings
// =========================================================================
const Scene04_LatentSpace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 10, fps, config: { damping: 16, mass: 0.8, stiffness: 80 } });
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const rotation = interpolate(frame, [0, 780], [0, 24]);

  const clusters = useMemo(() => [
    { label: "Semantic Syntax", color: "#38bdf8", x: -280, y: -120 },
    { label: "Logic Synthesis", color: "#a855f7", x: 260, y: -90 },
    { label: "Spatial Reasoning", color: "#34d399", x: -160, y: 180 },
    { label: "Autonomous Planning", color: "#fbbf24", x: 220, y: 160 },
  ], []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#050716", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={100} color="#a855f7" speed={0.6} maxRadius={3.2} />

      {/* 3D Manifold Orbit */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 700,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${interpolate(entrance, [0, 1], [0.85, 1])}) rotate(${rotation}deg)`,
          opacity,
        }}
      >
        <svg width="1000" height="700" viewBox="-500 -350 1000 700" style={{ overflow: "visible" }}>
          <circle r={320} fill="none" stroke="rgba(168, 85, 247, 0.2)" strokeWidth={1.5} strokeDasharray="8 6" />
          <circle r={210} fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth={1.5} strokeDasharray="6 4" />

          {clusters.map((c, i) => {
            const next = clusters[(i + 1) % clusters.length];
            return (
              <line
                key={`conn-${i}`}
                x1={c.x}
                y1={c.y}
                x2={next.x}
                y2={next.y}
                stroke={c.color}
                strokeOpacity={0.3}
                strokeWidth={1.5}
              />
            );
          })}
        </svg>

        {clusters.map((c) => {
          const pulse = (Math.sin(frame * 0.08 + c.x) + 1) / 2;
          return (
            <div
              key={c.label}
              style={{
                position: "absolute",
                transform: `translate(${c.x}px, ${c.y}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 20 + pulse * 10,
                  height: 20 + pulse * 10,
                  borderRadius: "50%",
                  backgroundColor: c.color,
                  boxShadow: `0 0 30px ${c.color}`,
                }}
              />
              <div
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "#ffffff",
                  textShadow: "0 0 16px rgba(0,0,0,0.8)",
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 100,
          textAlign: "center",
          opacity,
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: 13, letterSpacing: "0.4em", textTransform: "uppercase", color: "#a855f7", fontWeight: 700 }}>
          Phase 04 // Latent Manifold Traversal
        </span>
        <h2 style={{ fontSize: 52, fontWeight: 800, color: "#ffffff", margin: "8px 0 0 0", letterSpacing: "-0.02em" }}>
          CONCEPTUAL LATENT SPACE
        </h2>
      </div>

      <VignetteOverlay intensity={0.75} color="#02030d" />
    </AbsoluteFill>
  );
};

// =========================================================================
// Scene 5: Emergent Intelligence & Grand Finale (48-60s / Frames 2880-3600)
// Unified neural core, pristine typography, professional outro
// =========================================================================
const Scene05_Emergence: React.FC<{
  title?: string;
  subtitle?: string;
  accentColor?: string;
}> = ({
  title = "THE ARCHITECTURE OF THOUGHT",
  subtitle = "Next-Generation Artificial Intelligence Designed for Boundless Reasoning",
  accentColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 15, fps, config: { damping: 14, mass: 0.9, stiffness: 70 } });
  const opacity = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(entrance, [0, 1], [0.82, 1.0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#02040b", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={130} color="#38bdf8" speed={0.4} maxRadius={3.5} />

      {/* Massive Unified Radiant Core */}
      <div
        style={{
          position: "absolute",
          width: 750,
          height: 750,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(168, 85, 247, 0.16) 45%, transparent 70%)",
          filter: "blur(70px)",
          transform: `scale(${1 + Math.sin(frame * 0.05) * 0.06})`,
        }}
      />

      {/* Central Monolithic Typography */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            padding: "8px 28px",
            borderRadius: 999,
            background: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            color: accentColor,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            marginBottom: 32,
            backdropFilter: "blur(16px)",
          }}
        >
          Phase 05 // Synthesized Intelligence
        </div>

        <h1
          style={{
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            margin: 0,
            color: "#ffffff",
            textShadow: `0 0 70px ${accentColor}99`,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: "0.15em",
            color: "#94a3b8",
            marginTop: 24,
            maxWidth: 850,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      </div>

      <VignetteOverlay intensity={0.7} color="#010207" />
    </AbsoluteFill>
  );
};

export interface AiExplainerProps {
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

// =========================================================================
// Main Composition: 60 Seconds (3600 Frames @ 60 FPS)
// =========================================================================
export const AiExplainer: React.FC<AiExplainerProps> = ({
  title = "THE ARCHITECTURE OF THOUGHT",
  subtitle = "Next-Generation Artificial Intelligence Designed for Boundless Reasoning",
  accentColor = "#38bdf8",
}) => {
  return (
    <Series>
      {/* Scene 1: 0-10s (600 frames) */}
      <Series.Sequence durationInFrames={600}>
        <Scene01_Inception />
      </Series.Sequence>

      {/* Scene 2: 10-22s (720 frames) */}
      <Series.Sequence durationInFrames={720}>
        <Scene02_Attention />
      </Series.Sequence>

      {/* Scene 3: 22-35s (780 frames) */}
      <Series.Sequence durationInFrames={780}>
        <Scene03_Backprop />
      </Series.Sequence>

      {/* Scene 4: 35-48s (780 frames) */}
      <Series.Sequence durationInFrames={780}>
        <Scene04_LatentSpace />
      </Series.Sequence>

      {/* Scene 5: 48-60s (720 frames) */}
      <Series.Sequence durationInFrames={720}>
        <Scene05_Emergence title={title} subtitle={subtitle} accentColor={accentColor} />
      </Series.Sequence>
    </Series>
  );
};

export default AiExplainer;
