import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { interpolateClamped } from "./springs";

/* =========================================================================
   1. Procedural Web Audio SFX Generator (Browser / Preview Runtime)
   ========================================================================= */
export type SFXType = "whoosh" | "pop" | "impact" | "riser" | "chime";

export interface PlaySFXOptions {
  volume?: number;
  pitch?: number;
}

/**
 * Procedurally generates and triggers sound effects using the Web Audio API.
 * Safely guards against headless or SSR environments.
 */
export function playProceduralSFX(type: SFXType, options: PlaySFXOptions = {}): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const vol = options.volume ?? 0.3;
    const pitchMul = options.pitch ?? 1.0;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(vol, now);
    masterGain.connect(ctx.destination);

    switch (type) {
      case "whoosh": {
        // Noise buffer through a sweeping bandpass filter
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(200 * pitchMul, now);
        filter.frequency.exponentialRampToValueAtTime(1800 * pitchMul, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(300 * pitchMul, now + 0.4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(now);
        noise.stop(now + 0.45);
        break;
      }

      case "pop": {
        // High frequency sine sweep with rapid decay
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(900 * pitchMul, now);
        osc.frequency.exponentialRampToValueAtTime(150 * pitchMul, now + 0.08);

        gain.gain.setValueAtTime(vol * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case "impact": {
        // Sub-bass sine drop + short noise burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(180 * pitchMul, now);
        osc.frequency.exponentialRampToValueAtTime(35 * pitchMul, now + 0.35);

        gain.gain.setValueAtTime(vol * 1.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }

      case "riser": {
        // Ascending tone with resonant filter
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160 * pitchMul, now);
        osc.frequency.exponentialRampToValueAtTime(950 * pitchMul, now + 0.6);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(vol * 0.8, now + 0.55);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }

      case "chime": {
        // Crystal harmonic bells
        const freqs = [523.25, 1046.5, 1567.98];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f * pitchMul, now + idx * 0.04);
          gain.gain.setValueAtTime(vol * 0.6, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + idx * 0.04);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + idx * 0.04);
          osc.stop(now + 0.7);
        });
        break;
      }
    }
  } catch {
    // Graceful fallback for restricted environments
  }
}

/* =========================================================================
   2. Dynamic 60FPS Waveform Visualizer
   ========================================================================= */
export interface WaveformVisualizerProps {
  barCount?: number;
  width?: number;
  height?: number;
  primaryColor?: string;
  accentColor?: string;
  glowColor?: string;
  mirror?: boolean;
  intensity?: number;
  speed?: number;
  showPeaks?: boolean;
  style?: React.CSSProperties;
}

/**
 * WaveformVisualizer: 60FPS frame-deterministic audio spectrum bars.
 * Renders mathematical harmonic frequency analysis with glowing peaks.
 */
export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  barCount = 32,
  width = 640,
  height = 140,
  primaryColor = "#00f0ff",
  accentColor = "#ff007f",
  glowColor = "#00f0ff",
  mirror = true,
  intensity = 1.0,
  speed = 1.0,
  showPeaks = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barWidth = Math.max(3, (width - (barCount - 1) * 4) / barCount);

  // Compute deterministic frequency bar heights for each channel
  const bars = React.useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const normIndex = i / (barCount - 1);
      // Multi-harmonic synthesized audio frequency curves
      const wave1 = Math.sin((frame * 0.12 * speed) + normIndex * Math.PI * 4);
      const wave2 = Math.cos((frame * 0.08 * speed) + normIndex * Math.PI * 2);
      const wave3 = Math.sin((frame * 0.22 * speed) + normIndex * 8);

      // Bass boost on low frequencies (left), treble flutter on right
      const freqWeight = Math.sin(normIndex * Math.PI);
      const rawAmp = (wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.2) * (0.4 + 0.6 * freqWeight);

      // Normalized amplitude 0.05 to 1.0
      const amp = Math.max(0.08, Math.min(1.0, (rawAmp + 0.5) * intensity));
      const barH = amp * (mirror ? height * 0.45 : height * 0.9);

      // Peak drop calculation
      const peakAmp = Math.min(1.0, amp * 1.15);
      const peakH = peakAmp * (mirror ? height * 0.45 : height * 0.9);

      return { height: barH, peak: peakH, normIndex };
    });
  }, [barCount, frame, fps, height, intensity, speed, mirror]);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: mirror ? "center" : "flex-end",
        justifyContent: "space-between",
        gap: 4,
        position: "relative",
        filter: `drop-shadow(0 0 12px ${glowColor}66)`,
        ...style,
      }}
    >
      {bars.map((bar, i) => {
        // Color interpolation from primary to accent across frequency bands
        const color =
          bar.normIndex < 0.5
            ? primaryColor
            : accentColor;

        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: mirror ? bar.height * 2 : bar.height,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Main Audio Frequency Bar */}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 4,
                background: `linear-gradient(180deg, ${accentColor} 0%, ${primaryColor} 100%)`,
                boxShadow: `0 0 8px ${primaryColor}88`,
                willChange: "height",
              }}
            />

            {/* Peak Indicator Dot */}
            {showPeaks && (
              <div
                style={{
                  position: "absolute",
                  top: mirror ? -6 : -bar.peak - 4,
                  width: barWidth,
                  height: 3,
                  borderRadius: 2,
                  background: "#ffffff",
                  boxShadow: `0 0 6px ${accentColor}`,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================================
   3. Unified AudioSFX Export
   ========================================================================= */
export const AudioSFX = {
  play: playProceduralSFX,
  Waveform: WaveformVisualizer,
};
