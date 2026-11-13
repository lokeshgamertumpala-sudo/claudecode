import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ParticleField, VignetteOverlay } from "../library";

export interface HourLongVideoProps {
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

// 12 Thematic Chapters for 1-Hour Long Production (each chapter runs ~300s = 18,000 frames @ 60fps)
const CHAPTERS = [
  { id: 1, title: "GENESIS ARCHITECTURE", tag: "CHAPTER 01", desc: "Foundational neural topology & autonomous mesh genesis." },
  { id: 2, title: "QUANTUM INFERENCE", tag: "CHAPTER 02", desc: "Sub-second model routing across frontier MoE clusters." },
  { id: 3, title: "SYNAPSE DYNAMICS", tag: "CHAPTER 03", desc: "Harmonic collective reasoning across 5 coordinated agents." },
  { id: 4, title: "CELESTIAL COMPUTING", tag: "CHAPTER 04", desc: "Massive scale distributed workloads and zero-latency pipelines." },
  { id: 5, title: "TEMPORAL FLUIDITY", tag: "CHAPTER 05", desc: "Deterministic 60FPS physics and frame-calibrated motion design." },
  { id: 6, title: "NEURAL RESONANCE", tag: "CHAPTER 06", desc: "Adaptive memory consolidation and high-density knowledge retention." },
  { id: 7, title: "INFINITE EXPANSION", tag: "CHAPTER 07", desc: "Procedural space navigation and multi-dimensional coordinate mapping." },
  { id: 8, title: "KINETIC EQUILIBRIUM", tag: "CHAPTER 08", desc: "Stable autonomous execution under heavy concurrency." },
  { id: 9, title: "MATRIX SYNTHESIS", tag: "CHAPTER 09", desc: "Real-time automated code generation and multi-language compilation." },
  { id: 10, title: "STELLAR TELEMETRY", tag: "CHAPTER 10", desc: "Continuous deep health verification and self-healing daemon supervisors." },
  { id: 11, title: "HORIZON VECTOR", tag: "CHAPTER 11", desc: "Bridging human vision and machine intelligence into unison." },
  { id: 12, title: "ETERNAL ORBIT", tag: "CHAPTER 12", desc: "The future of autonomous software engineering without boundaries." },
];

export const HourLongVideo: React.FC<HourLongVideoProps> = ({
  title = "HORIZON: 1-HOUR AUTONOMOUS JOURNEY",
  subtitle = "CONTINUOUS PROCEDURAL 60FPS MOTION GENERATION",
  accentColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  // Chapter Cycle: Every 300 seconds (18,000 frames @ 60fps)
  const chapterDurationFrames = 300 * fps;
  const currentChapterIndex = Math.floor(frame / chapterDurationFrames) % CHAPTERS.length;
  const chapter = CHAPTERS[currentChapterIndex];
  const chapterFrame = frame % chapterDurationFrames;

  // Real-time HH:MM:SS:FF Timecode Calculator (Deterministic from frame)
  const totalSeconds = Math.floor(frame / fps);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const frameRemainder = frame % fps;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const timecode = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frameRemainder)}`;

  // Chapter Progress Bar (0 to 1)
  const chapterProgress = chapterFrame / chapterDurationFrames;

  // Overall 1-Hour Progress Bar (0 to 1)
  const totalOneHourFrames = 3600 * fps;
  const overallProgress = Math.min(frame / totalOneHourFrames, 1);

  // Chapter Transition Cross-Fade (smooth 60-frame in/out at chapter boundaries)
  const chapterFade = interpolate(chapterFrame, [0, 60, chapterDurationFrames - 60, chapterDurationFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow continuous hypnotic rotation (360 degrees every 60 seconds)
  const rotationSlow = (frame / (60 * fps)) * 360;

  // Harmonic breathing oscillation
  const pulse = 1 + Math.sin(frame * 0.03) * 0.04;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030614",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. Procedural Deep Cosmic Dust & Particle Vortex */}
      <ParticleField count={85} color="#38bdf8" speed={0.4} maxRadius={3.2} />

      {/* 2. Slow Evolving Atmospheric Plasma Glows */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: cx - 450,
          top: cy - 450,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)",
          filter: "blur(60px)",
          transform: `scale(${pulse})`,
          pointerEvents: "none",
        }}
      />

      {/* 3. Hypnotic Celestial Rings (Zero Math.random, 100% deterministic) */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <g transform={`translate(${cx}, ${cy}) rotate(${rotationSlow})`}>
          <circle r="340" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" strokeDasharray="16 8" />
          <circle r="420" fill="none" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" strokeDasharray="24 12" />
          <circle r="260" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1.5" strokeDasharray="8 8" />
          
          {/* Orbital Satellite Vector Markers */}
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = Math.cos(rad) * 340;
            const y = Math.sin(rad) * 340;
            return <circle key={i} cx={x} cy={y} r="4" fill="#38bdf8" opacity="0.8" />;
          })}
        </g>
      </svg>

      {/* 4. Top Telemetry & Live 60FPS Timecode Header */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "monospace",
          fontSize: 14,
          letterSpacing: 2,
          color: "rgba(224, 242, 254, 0.75)",
          borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
          paddingBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
          <span style={{ color: "#38bdf8", fontWeight: 700 }}>REMOTION ENGINE 60FPS</span>
          <span>•</span>
          <span>AUTONOMOUS BROADCAST</span>
        </div>

        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <div>
            <span style={{ color: "#94a3b8" }}>TIMECODE: </span>
            <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: 16 }}>{timecode}</span>
          </div>
          <div>
            <span style={{ color: "#94a3b8" }}>TARGET: </span>
            <span style={{ color: "#38bdf8" }}>01:00:00:00</span>
          </div>
        </div>
      </div>

      {/* 5. Center Dynamic Chapter Card (Cycles smoothly through 12 chapters) */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: chapterFade,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            padding: "8px 24px",
            borderRadius: 999,
            background: "rgba(56, 189, 248, 0.12)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            color: "#38bdf8",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: 20,
            backdropFilter: "blur(12px)",
          }}
        >
          {chapter.tag} • CYCLE {currentChapterIndex + 1} OF 12
        </div>

        <h1
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "#f8fafc",
            textShadow: "0 0 50px rgba(56, 189, 248, 0.5)",
          }}
        >
          {chapter.title}
        </h1>

        <p
          style={{
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: "0.15em",
            color: "#94a3b8",
            marginTop: 18,
            maxWidth: 750,
            lineHeight: 1.6,
          }}
        >
          {chapter.desc}
        </p>
      </div>

      {/* 6. Bottom Dual-Timeline HUD: Chapter Progress + 1-Hour Master Progress */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Master 1-Hour Progress Bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "monospace", color: "#94a3b8", marginBottom: 6 }}>
            <span>MASTER TIMELINE (1 HOUR)</span>
            <span>{(overallProgress * 100).toFixed(1)}% COMPLETE</span>
          </div>
          <div style={{ width: "100%", height: 6, borderRadius: 999, background: "rgba(255, 255, 255, 0.1)", overflow: "hidden" }}>
            <div
              style={{
                width: `${overallProgress * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)",
                boxShadow: "0 0 10px #38bdf8",
              }}
            />
          </div>
        </div>

        {/* Current Chapter Sub-Timeline */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace", color: "#64748b", marginBottom: 4 }}>
            <span>{chapter.tag} LOCAL PROGRESS</span>
            <span>{(chapterProgress * 100).toFixed(0)}%</span>
          </div>
          <div style={{ width: "100%", height: 3, borderRadius: 999, background: "rgba(255, 255, 255, 0.05)", overflow: "hidden" }}>
            <div
              style={{
                width: `${chapterProgress * 100}%`,
                height: "100%",
                background: "#a855f7",
              }}
            />
          </div>
        </div>
      </div>

      {/* 7. Vignette Finishing Overlay */}
      <VignetteOverlay intensity={0.7} color="#020617" />
    </AbsoluteFill>
  );
};
