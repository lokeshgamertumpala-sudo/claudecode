import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ParticleField,
  OrbitalRings,
  VignetteOverlay,
  GlowBadge,
  KineticTitle,
  getInOutOpacity,
  interpolateSafe,
  palettes,
} from "../library";

export interface EarthRotationProps {
  primaryColor?: string;
  accentColor?: string;
  duration?: number;
  showContours?: boolean;
}

const EARTH_RADIUS = 280;

export const EarthRotation: React.FC<EarthRotationProps> = ({
  primaryColor = palettes.solarEarth.ocean,
  accentColor = palettes.solarEarth.atmosphere,
  duration = 180,
  showContours = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  // Fade in at start and fade out at end
  const opacity = getInOutOpacity(frame, duration, 25);

  // Smooth deterministic rotation (degrees): 360 deg over total duration
  const rotationDeg = (frame / duration) * 360;

  // Cloud layer rotates at slightly faster differential speed
  const cloudRotationDeg = (frame / duration) * 440;

  // Subtle breathing pulse
  const pulseScale = 1 + Math.sin(frame * 0.05) * 0.012;

  // Solar light angle (shadow shifts gently across sphere)
  const lightShiftX = Math.sin(frame * 0.02) * 40;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palettes.solarEarth.background,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. Deep Space Starfield Background */}
      <ParticleField count={60} color="#e0f2fe" speed={0.8} maxRadius={3.5} />

      {/* 2. Perspective Vignette */}
      <VignetteOverlay intensity={0.85} color="#020617" />

      {/* 3. Status Badge Top */}
      <div
        style={{
          position: "absolute",
          top: 60,
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <GlowBadge
          label="Planetary Orbit Telemetry • 60 FPS"
          accentColor={accentColor}
          startFrame={5}
        />
      </div>

      {/* 4. Central Earth Graphic */}
      <div
        style={{
          position: "relative",
          width: EARTH_RADIUS * 2 + 200,
          height: EARTH_RADIUS * 2 + 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${pulseScale})`,
        }}
      >
        {/* Orbital Tech Rings */}
        {showContours && (
          <OrbitalRings
            cx={EARTH_RADIUS + 100}
            cy={EARTH_RADIUS + 100}
            radius={EARTH_RADIUS * 0.9}
            ringCount={3}
            primaryColor={primaryColor}
            accentColor={accentColor}
            rotationSpeed={0.4}
            tiltAngle={70}
          />
        )}

        <svg
          width={EARTH_RADIUS * 2 + 100}
          height={EARTH_RADIUS * 2 + 100}
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Outer Atmospheric Haze */}
            <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor={accentColor} stopOpacity="0.45" />
              <stop offset="90%" stopColor={accentColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
            </radialGradient>

            {/* Earth 3D Sphere Surface Shading */}
            <radialGradient
              id="earthShading"
              cx={`${42 + lightShiftX / 10}%`}
              cy="38%"
              r="65%"
            >
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="40%" stopColor="#0284c7" stopOpacity="1" />
              <stop offset="75%" stopColor="#0f172a" stopOpacity="1" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </radialGradient>

            {/* Spherical Clip Path */}
            <clipPath id="earthSphereClip">
              <circle
                cx={EARTH_RADIUS + 50}
                cy={EARTH_RADIUS + 50}
                r={EARTH_RADIUS}
              />
            </clipPath>

            {/* Continent Shadow Shader */}
            <linearGradient id="continentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
          </defs>

          {/* Atmospheric Backglow Halo */}
          <circle
            cx={EARTH_RADIUS + 50}
            cy={EARTH_RADIUS + 50}
            r={EARTH_RADIUS + 35}
            fill="url(#atmosphereGlow)"
          />

          {/* Clipped Planet Sphere Content */}
          <g clipPath="url(#earthSphereClip)">
            {/* Base Ocean Sphere */}
            <circle
              cx={EARTH_RADIUS + 50}
              cy={EARTH_RADIUS + 50}
              r={EARTH_RADIUS}
              fill="url(#earthShading)"
            />

            {/* Rotating Continents (Derived strictly from rotationDeg) */}
            <g
              transform={`translate(${EARTH_RADIUS + 50}, ${EARTH_RADIUS + 50}) rotate(${rotationDeg})`}
              opacity={0.88}
            >
              {/* Continent Formations */}
              <path
                d="M-120,-80 C-80,-140 40,-130 90,-90 C140,-50 160,20 120,70 C80,120 10,140 -60,110 C-130,80 -160,-20 -120,-80 Z"
                fill="url(#continentGrad)"
              />
              <path
                d="M-50,60 C-20,30 30,40 60,70 C90,100 80,150 40,170 C0,190 -50,170 -70,130 C-90,90 -80,90 -50,60 Z"
                fill="url(#continentGrad)"
                opacity={0.85}
              />
              <path
                d="M40,-140 C80,-170 140,-150 160,-120 C180,-90 170,-40 130,-30 C90,-20 60,-50 30,-90 C0,-130 0,-110 40,-140 Z"
                fill="url(#continentGrad)"
                opacity={0.9}
              />
            </g>

            {/* Rotating Swirling Cloud Cover (Derived strictly from cloudRotationDeg) */}
            <g
              transform={`translate(${EARTH_RADIUS + 50}, ${EARTH_RADIUS + 50}) rotate(${cloudRotationDeg})`}
              opacity={0.42}
            >
              <path
                d="M-140,-40 C-90,-100 60,-90 110,-50 C160,-10 130,60 80,90 C30,120 -40,110 -90,70 C-140,30 -190,20 -140,-40 Z"
                fill="#ffffff"
                filter="blur(4px)"
              />
              <path
                d="M-60,-120 C0,-160 80,-140 120,-100 C160,-60 140,0 90,20 C40,40 -20,20 -60,-20 C-100,-60 -120,-80 -60,-120 Z"
                fill="#ffffff"
                filter="blur(3px)"
              />
            </g>

            {/* Night-side Specular Shadow Overlay for photorealistic depth */}
            <radialGradient id="nightShadow" cx="80%" cy="80%" r="75%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.88" />
              <stop offset="50%" stopColor="#020617" stopOpacity="0.5" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <circle
              cx={EARTH_RADIUS + 50}
              cy={EARTH_RADIUS + 50}
              r={EARTH_RADIUS}
              fill="url(#nightShadow)"
            />
          </g>

          {/* High-Altitude Horizon Limb Atmosphere Rim */}
          <circle
            cx={EARTH_RADIUS + 50}
            cy={EARTH_RADIUS + 50}
            r={EARTH_RADIUS}
            fill="none"
            stroke={accentColor}
            strokeWidth={3}
            strokeOpacity={0.65}
          />
        </svg>
      </div>

      {/* 5. Cinematic Typography Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <KineticTitle
          text="TERRA FIRMA"
          fontSize={54}
          color="#ffffff"
          glowColor={accentColor}
          preset="cinematic"
          startFrame={15}
        />
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 500,
            color: palettes.solarEarth.textSecondary,
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: interpolateSafe(frame, [30, 50], [0, 1]),
          }}
        >
          60FPS Deterministic Planetary Simulation
        </p>
      </div>
    </AbsoluteFill>
  );
};
