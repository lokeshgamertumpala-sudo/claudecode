import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { interpolateSafe, getInOutOpacity, slideIn, springPresets, getSpringValue, palettes, GlowDefs, VignetteOverlay } from '../library';

const { width, height } = { width: 1920, height: 1080 };
const centerX = width / 2;
const centerY = height / 2;

const DURATION_FRAMES = 180; // 3 seconds at 60fps

export const GoodEvening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background: soft warm radial gradient
  const bgOpacity = interpolateSafe(frame, [0, 30], [0, 1]);
  const vignetteIntensity = interpolateSafe(frame, [0, 60], [0, 0.35]);

  // "Good" text animation
  const goodIn = interpolateSafe(frame, [0, 45], [0, 1]);
  const goodOut = interpolateSafe(frame, [135, 180], [1, 0]);
  const goodOpacity = goodIn * goodOut;
  const goodSlide = slideIn(frame, 0, 45, -60, 0); // slide up from -60px
  const goodScale = getSpringValue(frame, fps, 'gentle') * 0.02 + 0.98;

  // "Evening" text animation (staggered)
  const eveningIn = interpolateSafe(frame, [20, 65], [0, 1]);
  const eveningOut = interpolateSafe(frame, [120, 180], [1, 0]);
  const eveningOpacity = eveningIn * eveningOut;
  const eveningSlide = slideIn(frame, 20, 65, -60, 0); // slide up from -60px
  const eveningScale = getSpringValue(frame - 20, fps, 'gentle') * 0.02 + 0.98;

  // Decorative line animation
  const lineIn = interpolateSafe(frame, [40, 80], [0, 1]);
  const lineOut = interpolateSafe(frame, [110, 150], [1, 0]);
  const lineOpacity = lineIn * lineOut;
  const lineWidth = interpolateSafe(frame, [40, 80], [0, 400]) * lineOut;

  // Subtle particles (dust motes)
  const particleOpacity = interpolateSafe(frame, [60, 180], [0, 1]);

  // Breathing scale for entire composition (very subtle)
  const breath = Math.sin((frame / fps) * Math.PI * 0.5) * 0.005 + 1;

  return (
    <>
      <GlowDefs />
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `scale(${breath})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Background gradient */}
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, opacity: bgOpacity }}>
          <defs>
            <radialGradient id="eveningBg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor={palettes.appleMinimal.background} stopOpacity="1" />
              <stop offset="50%" stopColor={palettes.appleMinimal.surface} stopOpacity="1" />
              <stop offset="100%" stopColor={palettes.appleMinimal.accent} stopOpacity="1" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#eveningBg)" />
        </svg>

        {/* Subtle animated dust particles */}
        <svg
          width={width}
          height={height}
          style={{ position: 'absolute', top: 0, left: 0, opacity: particleOpacity, pointerEvents: 'none' }}
        >
          {Array.from({ length: 30 }, (_, i) => {
            const angle = (i * 137.508) % 360; // Golden angle
            const radius = 200 + (i % 5) * 150;
            const baseX = centerX + Math.cos((angle * Math.PI) / 180) * radius;
            const baseY = centerY + Math.sin((angle * Math.PI) / 180) * radius;
            const driftX = Math.sin((frame + i * 10) * 0.01) * 40;
            const driftY = Math.cos((frame + i * 7) * 0.008) * 30;
            const size = 1.5 + (i % 3) * 1.5;
            const opacity = 0.15 + (i % 4) * 0.1;
            return (
              <circle
                key={i}
                cx={baseX + driftX}
                cy={baseY + driftY}
                r={size}
                fill={palettes.appleMinimal.textPrimary}
                opacity={opacity}
                filter="url(#neonGlow)"
              />
            );
          })}
        </svg>

        {/* "Good" text */}
        <div
          style={{
            position: 'absolute',
            left: centerX,
            top: centerY - 80 + goodSlide,
            transform: `translate(-50%, -50%) scale(${goodScale})`,
            opacity: goodOpacity,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
            fontSize: '96px',
            fontWeight: '300',
            letterSpacing: '0.08em',
            color: '#ffffff',
            textShadow: '0 4px 32px rgba(255, 180, 100, 0.4), 0 0 60px rgba(255, 160, 80, 0.2)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          Good
        </div>

        {/* "Evening" text */}
        <div
          style={{
            position: 'absolute',
            left: centerX,
            top: centerY + 40 + eveningSlide,
            transform: `translate(-50%, -50%) scale(${eveningScale})`,
            opacity: eveningOpacity,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
            fontSize: '128px',
            fontWeight: '200',
            letterSpacing: '0.12em',
            color: '#ffffff',
            textShadow: '0 8px 48px rgba(255, 140, 60, 0.5), 0 0 80px rgba(255, 120, 40, 0.3)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          Evening
        </div>

        {/* Decorative golden line */}
        <svg
          width={width}
          height={4}
          style={{
            position: 'absolute',
            left: centerX - lineWidth / 2,
            top: centerY + 120,
            opacity: lineOpacity,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffb340" stopOpacity="0" />
              <stop offset="20%" stopColor="#ffb340" stopOpacity="1" />
              <stop offset="80%" stopColor="#ff8c26" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff8c26" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width={lineWidth} height="3" fill="url(#goldLine)" rx="1.5" filter="url(#neonGlow)" />
        </svg>

        {/* Vignette overlay */}
        <VignetteOverlay intensity={vignetteIntensity} color="#1a0d04" />
      </div>
    </>
  );
};

export const metadata = {
  title: 'Good Evening',
  description: 'Minimal warm evening greeting animation',
  durationInFrames: DURATION_FRAMES,
  fps: 60,
  width: 1920,
  height: 1080,
};