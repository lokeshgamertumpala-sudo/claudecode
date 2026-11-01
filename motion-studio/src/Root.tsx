import React from "react";
import { Composition } from "remotion";
import { KineticTypography } from "./compositions/KineticTypography";
import { CyberpunkHUD } from "./compositions/CyberpunkHUD";
import { ParticleVortex } from "./compositions/ParticleVortex";
import { LogoReveal } from "./compositions/LogoReveal";
import { NeonPortal } from "./compositions/NeonPortal";
import { EarthRotation } from "./compositions/EarthRotation";
import { MinimalMotion } from "./compositions/MinimalMotion";
import { HiGreeting } from "./compositions/HiGreeting";
import { GoodMorning } from "./compositions/GoodMorning";
import { GoodEvening } from "./compositions/GoodEvening";
import { BeyondEarth } from "./compositions/BeyondEarth";
import { OpenClaudeX } from "./compositions/OpenClaudeX";
import { HourLongVideo } from "./compositions/HourLongVideo";
import { ItIsAi } from "./compositions/ItIsAi";
import { AiExplainer } from "./compositions/AiExplainer";
import { VersatileShowcase } from "./primitives/VersatileShowcase";
import "./styles.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Minimal Motion — 2 seconds (120 frames @ 60fps) */}
      <Composition
        id="MinimalMotion"
        component={MinimalMotion}
        durationInFrames={120}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          title: "SIMPLICITY",
          subtitle: "LESS, BUT BETTER",
          tagline: "PRECISION 60FPS MOTION DESIGN",
          accentColor: "#ff9f0a",
        }}
      />
      <Composition
        id="minimal-motion"
        component={MinimalMotion}
        durationInFrames={120}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="Minimal"
        component={MinimalMotion}
        durationInFrames={120}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="minimal"
        component={MinimalMotion}
        durationInFrames={120}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 2. Earth Rotation — 3 seconds (180 frames @ 60fps) */}
      <Composition
        id="EarthRotation"
        component={EarthRotation}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          primaryColor: "#0284c7",
          accentColor: "#38bdf8",
          showContours: true,
        }}
      />
      <Composition
        id="earth-rotation"
        component={EarthRotation}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 3. Apple-style minimal "Good morning" — 5 seconds (300 frames @ 60fps) */}
      <Composition
        id="GoodMorning"
        component={GoodMorning}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          text: "Good morning",
          accentColor: "#ff9f0a",
        }}
      />
      <Composition
        id="good-morning"
        component={GoodMorning}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 3b. Apple-style minimal "Good evening" — 3 seconds (180 frames @ 60fps) */}
      <Composition
        id="GoodEvening"
        component={GoodEvening}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="good-evening"
        component={GoodEvening}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 4. "HI" Greeting — exactly 2 seconds (120 frames @ 60fps) */}
      <Composition
        id="HiGreeting"
        component={HiGreeting}
        durationInFrames={120}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          text: "HI",
          primaryColor: "#00f0ff",
          accentColor: "#ff007f",
        }}
      />
      <Composition
        id="hi-greeting"
        component={HiGreeting}
        durationInFrames={120}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 5. Kinetic Typography (1080p 60fps) */}
      <Composition
        id="KineticTypography"
        component={KineticTypography}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          title: "NEXT-GEN MOTION",
          subtitle: "POWERED BY NEMOTRON ULTRA 550B",
          tagline: "60FPS DETERMINISTIC REMOTION ENGINE",
          primaryColor: "#00f0ff",
          accentColor: "#ff007f",
        }}
      />
      <Composition
        id="kinetic-typography"
        component={KineticTypography}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 6. Cyberpunk HUD (1080p 60fps) */}
      <Composition
        id="CyberpunkHUD"
        component={CyberpunkHUD}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="cyberpunk-hud"
        component={CyberpunkHUD}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 7. Mathematical Particle Vortex (1080p 60fps) */}
      <Composition
        id="ParticleVortex"
        component={ParticleVortex}
        durationInFrames={240}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="particle-vortex"
        component={ParticleVortex}
        durationInFrames={240}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 8. Cinematic Logo Reveal (1080p 60fps) */}
      <Composition
        id="LogoReveal"
        component={LogoReveal}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="logo-reveal"
        component={LogoReveal}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 9. Neon Portal Tunnel (1080p 60fps) */}
      <Composition
        id="NeonPortal"
        component={NeonPortal}
        durationInFrames={240}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          primaryColor: "#00f0ff",
          accentColor: "#ff007f",
          ringCount: 16,
        }}
      />
      <Composition
        id="neon-portal"
        component={NeonPortal}
        durationInFrames={240}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 10. Mobile Vertical Reel / Shorts Format (1080x1920 60fps) */}
      <Composition
        id="VerticalReel"
        component={KineticTypography}
        durationInFrames={180}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          title: "VERTICAL MOTION",
          subtitle: "60FPS REMOTION",
          tagline: "MOBILE SHORTS FORMAT",
          primaryColor: "#00f0ff",
          accentColor: "#ff007f",
        }}
      />
      <Composition
        id="vertical-reel"
        component={KineticTypography}
        durationInFrames={180}
        fps={60}
        width={1080}
        height={1920}
      />

      {/* 11. Versatile Multi-Scene Showcase — 10 seconds (600 frames @ 60fps) */}
      <Composition
        id="VersatileShowcase"
        component={VersatileShowcase}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          title: "VERSATILE MOTION STUDIO",
          subtitle: "APPLE-GRADE 60FPS REMOTION ARCHITECTURE",
          accentColor: "#00f0ff",
        }}
      />
      <Composition
        id="versatile-showcase"
        component={VersatileShowcase}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="Showcase"
        component={VersatileShowcase}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="showcase"
        component={VersatileShowcase}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 12. Beyond Earth Space Odyssey — 10 seconds (600 frames @ 60fps) */}
      <Composition
        id="BeyondEarth"
        component={BeyondEarth}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          primaryColor: "#0284c7",
          accentColor: "#38bdf8",
        }}
      />
      <Composition
        id="beyond-earth"
        component={BeyondEarth}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="beyondearth"
        component={BeyondEarth}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 13. OpenClaudeX Cinematic Multi-Agent Video — 60 seconds (3,600 frames @ 60fps) */}
      <Composition
        id="OpenClaudeX"
        component={OpenClaudeX}
        durationInFrames={3600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="open-claudex"
        component={OpenClaudeX}
        durationInFrames={3600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="openclaudex"
        component={OpenClaudeX}
        durationInFrames={3600}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 14. 1-Hour Long-Form Continuous Motion Production — 3,600s (216,000 frames @ 60fps) */}
      <Composition
        id="HourLongVideo"
        component={HourLongVideo}
        durationInFrames={216000}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          title: "HORIZON: 1-HOUR AUTONOMOUS JOURNEY",
          subtitle: "CONTINUOUS PROCEDURAL 60FPS MOTION GENERATION",
          accentColor: "#38bdf8",
        }}
      />
      <Composition
        id="hour-long-video"
        component={HourLongVideo}
        durationInFrames={216000}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="one-hour"
        component={HourLongVideo}
        durationInFrames={216000}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="onehour"
        component={HourLongVideo}
        durationInFrames={216000}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 15. HourLongPreview (Fast 60-second test preview of the 1-hour engine) */}
      <Composition
        id="HourLongPreview"
        component={HourLongVideo}
        durationInFrames={3600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="hour-long-preview"
        component={HourLongVideo}
        durationInFrames={3600}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 16. ItIsAi — 5 seconds (300 frames @ 60fps) */}
      <Composition
        id="ItIsAi"
        component={ItIsAi}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="it-is-ai"
        component={ItIsAi}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 17. AiExplainer — 60 seconds (3600 frames @ 60fps) Cinematic AI Neural Network */}
      <Composition
        id="AiExplainer"
        component={AiExplainer}
        durationInFrames={3600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="ai-explainer"
        component={AiExplainer}
        durationInFrames={3600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="ai-neural-network"
        component={AiExplainer}
        durationInFrames={3600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="AiExplainer-4K"
        component={AiExplainer}
        durationInFrames={3600}
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
};
