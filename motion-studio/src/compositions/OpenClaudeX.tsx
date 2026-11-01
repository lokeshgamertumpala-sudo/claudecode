import React from "react";
import { AbsoluteFill, Series, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ParticleField, VignetteOverlay, palettes } from "../library";

// -------------------------------------------------------------
// Scene 1 (0-10s / frames 0-600): Cinematic Opening & Genesis
// -------------------------------------------------------------
const Scene01_Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 15, fps, config: { damping: 15, mass: 0.8, stiffness: 80 } });
  const scale = interpolate(entrance, [0, 1], [0.85, 1.0]);
  const opacity = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 1 + Math.sin(frame * 0.08) * 0.03;

  return (
    <AbsoluteFill style={{ backgroundColor: "#060813", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={80} color="#60a5fa" speed={0.6} maxRadius={3.5} />
      
      {/* Central Pulsing Holographic Core */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.12) 40%, transparent 70%)",
          filter: "blur(40px)",
          transform: `scale(${pulse})`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "8px 24px",
            borderRadius: 999,
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(129, 140, 248, 0.4)",
            color: "#818cf8",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: 28,
            backdropFilter: "blur(12px)",
          }}
        >
          Autonomous AI Engine
        </div>

        <h1
          style={{
            fontSize: 88,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            margin: 0,
            background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(99, 102, 241, 0.5)",
          }}
        >
          OPENCLAUDEX
        </h1>

        <p
          style={{
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: "0.15em",
            color: "#93c5fd",
            marginTop: 20,
            maxWidth: 800,
            lineHeight: 1.6,
          }}
        >
          Next-Generation Autonomous Multi-Agent Orchestration
        </p>
      </div>

      <VignetteOverlay intensity={0.7} color="#030712" />
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// Scene 2 (10-25s / frames 600-1500): Core Vision & Architecture
// -------------------------------------------------------------
const Scene02_Vision: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 10, fps, config: { damping: 14, mass: 0.9, stiffness: 85 } });
  const cards = [
    { title: "NVIDIA NIM MoE", desc: "Frontier 550B MoE model inference with sub-second TTFT and zero stalls.", tag: "INFERENCE" },
    { title: "Multi-Agent Swarm", desc: "Coordinated autonomous specialists: Director, Engineer, Architect & QA.", tag: "ORCHESTRATION" },
    { title: "60 FPS Motion Engine", desc: "Deterministic React 18 Remotion studio with GPU hardware acceleration.", tag: "GRAPHICS" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#070a1a", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={60} color="#a855f7" speed={0.5} maxRadius={3} />

      <div style={{ position: "absolute", top: 100, textAlign: "center" }}>
        <div style={{ color: "#a855f7", fontSize: 13, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
          Pillar Architecture
        </div>
        <h2 style={{ fontSize: 52, fontWeight: 800, color: "#f8fafc", marginTop: 12, letterSpacing: "-0.03em" }}>
          Engineered for Unlimited Scale
        </h2>
      </div>

      <div style={{ display: "flex", gap: 36, marginTop: 120, zIndex: 10 }}>
        {cards.map((c, i) => {
          const cardSpring = spring({ frame: frame - (20 + i * 15), fps, config: { damping: 16, mass: 0.9, stiffness: 90 } });
          const translateY = interpolate(cardSpring, [0, 1], [60, 0]);
          const opacity = interpolate(cardSpring, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                width: 380,
                padding: "44px 36px",
                borderRadius: 24,
                background: "linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(20px)",
                opacity,
                transform: `translateY(${translateY}px)`,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "rgba(168, 85, 247, 0.15)",
                  color: "#c084fc",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  marginBottom: 20,
                }}
              >
                {c.tag}
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: "#ffffff", margin: "0 0 14px 0" }}>{c.title}</h3>
              <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
            </div>
          );
        })}
      </div>

      <VignetteOverlay intensity={0.65} color="#030712" />
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// Scene 3 (25-40s / frames 1500-2400): Multi-Agent Collaboration
// -------------------------------------------------------------
const Scene03_Agents: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  const agents = [
    { role: "DIRECTOR", color: "#ec4899", angle: 0 },
    { role: "ARCHITECT", color: "#38bdf8", angle: 72 },
    { role: "ENGINEER", color: "#10b981", angle: 144 },
    { role: "REVIEWER", color: "#f59e0b", angle: 216 },
    { role: "QA-SWARM", color: "#8b5cf6", angle: 288 },
  ];

  const rotation = frame * 0.25;

  return (
    <AbsoluteFill style={{ backgroundColor: "#060919", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={70} color="#38bdf8" speed={0.4} maxRadius={3.5} />

      <div style={{ position: "absolute", top: 80, textAlign: "center", zIndex: 20 }}>
        <div style={{ color: "#38bdf8", fontSize: 13, fontWeight: 700, letterSpacing: "0.4em" }}>COLLECTIVE REASONING</div>
        <h2 style={{ fontSize: 48, fontWeight: 800, color: "#ffffff", marginTop: 10 }}>5 Autonomous Agents in Synergy</h2>
      </div>

      {/* SVG Interconnecting Neural Mesh Lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {agents.map((a1, i) =>
          agents.map((a2, j) => {
            if (i >= j) return null;
            const r1 = 320;
            const r2 = 320;
            const rad1 = ((a1.angle + rotation) * Math.PI) / 180;
            const rad2 = ((a2.angle + rotation) * Math.PI) / 180;
            const x1 = cx + Math.cos(rad1) * r1;
            const y1 = cy + Math.sin(rad1) * r1 + 30;
            const x2 = cx + Math.cos(rad2) * r2;
            const y2 = cy + Math.sin(rad2) * r2 + 30;
            const pulseLine = 0.2 + Math.sin(frame * 0.1 + i + j) * 0.15;

            return (
              <line
                key={`${i}-${j}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6366f1"
                strokeWidth="1.5"
                opacity={pulseLine}
                strokeDasharray="6 4"
              />
            );
          })
        )}
      </svg>

      {/* Center Nexus Hub */}
      <div
        style={{
          position: "absolute",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, #6366f1 0%, #4338ca 70%)",
          boxShadow: "0 0 50px rgba(99, 102, 241, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#ffffff",
          fontWeight: 900,
          fontSize: 16,
          letterSpacing: "0.15em",
          transform: "translateY(30px)",
          zIndex: 15,
        }}
      >
        NEXUS
      </div>

      {/* Orbiting Agent Nodes */}
      {agents.map((agent, i) => {
        const r = 320;
        const rad = ((agent.angle + rotation) * Math.PI) / 180;
        const x = cx + Math.cos(rad) * r - 75;
        const y = cy + Math.sin(rad) * r - 35 + 30;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 150,
              padding: "16px 20px",
              borderRadius: 16,
              background: "rgba(15, 23, 42, 0.9)",
              border: `2px solid ${agent.color}`,
              boxShadow: `0 0 25px ${agent.color}55`,
              textAlign: "center",
              zIndex: 15,
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: agent.color, letterSpacing: "0.15em" }}>{agent.role}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>ONLINE • ACTIVE</div>
          </div>
        );
      })}

      <VignetteOverlay intensity={0.7} color="#030712" />
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// Scene 4 (40-50s / frames 2400-3000): Code & Automation Execution
// -------------------------------------------------------------
const Scene04_CodeAutomation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeLines = [
    "import { RemotionRoot } from '../Root';",
    "export const video = new MotionEngine({ fps: 60, resolution: '1080p' });",
    "const swarm = await AICluster.spawn({ model: 'nvidia/nemotron-3-ultra-550b-a55b' });",
    "await swarm.executePipeline('render-motion.bat OpenClaudeX');",
    "console.log('✓ Build successful: 0 errors, sub-second latency verified');",
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#050814", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={50} color="#10b981" speed={0.5} maxRadius={3} />

      <div style={{ position: "absolute", top: 80, textAlign: "center" }}>
        <div style={{ color: "#10b981", fontSize: 13, fontWeight: 700, letterSpacing: "0.35em" }}>LIVE COMPILATION</div>
        <h2 style={{ fontSize: 48, fontWeight: 800, color: "#ffffff", marginTop: 10 }}>Sub-Second Code Generation</h2>
      </div>

      {/* Terminal Mockup Card */}
      <div
        style={{
          width: 900,
          background: "rgba(15, 23, 42, 0.95)",
          borderRadius: 20,
          border: "1px solid rgba(52, 211, 153, 0.3)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.2)",
          overflow: "hidden",
          marginTop: 90,
          zIndex: 10,
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ background: "rgba(30, 41, 59, 0.8)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
          <div style={{ marginLeft: 16, fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>claude-code-terminal • openclaudex-engine</div>
        </div>

        <div style={{ padding: "32px 36px", fontFamily: "Consolas, Monaco, monospace", fontSize: 17, lineHeight: 2.1 }}>
          {codeLines.map((line, i) => {
            const lineProgress = interpolate(frame, [15 + i * 20, 30 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const charCount = Math.floor(line.length * lineProgress);
            const visibleText = line.substring(0, charCount);

            return (
              <div key={i} style={{ color: i === 4 ? "#34d399" : i === 2 ? "#38bdf8" : "#e2e8f0" }}>
                <span style={{ color: "#64748b", marginRight: 20, userSelect: "none" }}>0{i + 1}</span>
                {visibleText}
                {lineProgress > 0 && lineProgress < 1 && <span style={{ color: "#10b981" }}>_</span>}
              </div>
            );
          })}
        </div>
      </div>

      <VignetteOverlay intensity={0.7} color="#030712" />
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------
// Scene 5 (50-60s / frames 3000-3600): Grand Finale & Epic Outro
// -------------------------------------------------------------
const Scene05_GrandFinale: React.FC<{
  title?: string;
  subtitle?: string;
  accentColor?: string;
}> = ({
  title = "OPENCLAUDEX",
  subtitle = "One Ecosystem. Multiple Intelligences. Infinite Possibilities.",
  accentColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 15, fps, config: { damping: 14, mass: 0.9, stiffness: 85 } });
  const scale = interpolate(entrance, [0, 1], [0.85, 1.0]);
  const opacity = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050714", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ParticleField count={90} color="#e0f2fe" speed={0.7} maxRadius={3.5} />

      {/* Volumetric Radial Glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.15) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: "#ffffff",
            textShadow: `0 0 70px ${accentColor}b3`,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "0.3em",
            color: accentColor,
            marginTop: 24,
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            marginTop: 50,
            display: "flex",
            gap: 20,
          }}
        >
          <div
            style={{
              padding: "12px 32px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.2em",
              boxShadow: "0 10px 25px rgba(2, 132, 199, 0.5)",
            }}
          >
            NVIDIA NIM POWERED
          </div>
          <div
            style={{
              padding: "12px 32px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.2em",
            }}
          >
            60 FPS REMOTION STUDIO
          </div>
        </div>
      </div>

      <VignetteOverlay intensity={0.7} color="#030712" />
    </AbsoluteFill>
  );
};

export interface OpenClaudeXProps {
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

// -------------------------------------------------------------
// Root OpenClaudeX 60-Second Video Composition
// -------------------------------------------------------------
export const OpenClaudeX: React.FC<OpenClaudeXProps> = ({
  title = "OPENCLAUDEX",
  subtitle = "One Ecosystem. Multiple Intelligences. Infinite Possibilities.",
  accentColor = "#38bdf8",
}) => {
  return (
    <Series>
      {/* 0-10s (600 frames @ 60fps) */}
      <Series.Sequence durationInFrames={600}>
        <Scene01_Opening />
      </Series.Sequence>

      {/* 10-25s (900 frames @ 60fps) */}
      <Series.Sequence durationInFrames={900}>
        <Scene02_Vision />
      </Series.Sequence>

      {/* 25-40s (900 frames @ 60fps) */}
      <Series.Sequence durationInFrames={900}>
        <Scene03_Agents />
      </Series.Sequence>

      {/* 40-50s (600 frames @ 60fps) */}
      <Series.Sequence durationInFrames={600}>
        <Scene04_CodeAutomation />
      </Series.Sequence>

      {/* 50-60s (600 frames @ 60fps) */}
      <Series.Sequence durationInFrames={600}>
        <Scene05_GrandFinale title={title} subtitle={subtitle} accentColor={accentColor} />
      </Series.Sequence>
    </Series>
  );
};
