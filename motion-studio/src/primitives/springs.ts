import { spring, SpringConfig } from "remotion";

/**
 * Calibrated spring presets for fluid 60FPS motion graphics.
 * Explicitly provides gentle, snappy, elastic, heavy, cinematic, and smooth physics.
 */
export const springPresets = {
  /**
   * Gentle: Soft breathing and drifting motion, zero abrupt acceleration.
   * Settles naturally in ~45-60 frames.
   */
  gentle: {
    damping: 24,
    mass: 1.2,
    stiffness: 60,
    overshootClamping: false,
  } satisfies SpringConfig,

  /**
   * Snappy: Quick, punchy, low mass. Ideal for badges, pop-in UI, icons, and micro-interactions.
   * Settles in ~15-20 frames at 60fps.
   */
  snappy: {
    damping: 15,
    mass: 0.45,
    stiffness: 220,
    overshootClamping: false,
  } satisfies SpringConfig,

  /**
   * Elastic: Playful, dynamic overshoot with controlled damping oscillation.
   * Settles in ~35-50 frames at 60fps.
   */
  elastic: {
    damping: 8,
    mass: 0.75,
    stiffness: 140,
    overshootClamping: false,
  } satisfies SpringConfig,

  /**
   * Heavy: High mass, monumental weight, slow and authoritative settle.
   * Settles in ~60-80 frames at 60fps.
   */
  heavy: {
    damping: 26,
    mass: 2.8,
    stiffness: 50,
    overshootClamping: false,
  } satisfies SpringConfig,

  /**
   * Smooth: Apple-grade fluid, critically damped, zero overshoot.
   * Settles in ~30-40 frames at 60fps.
   */
  smooth: {
    damping: 20,
    mass: 1.0,
    stiffness: 100,
    overshootClamping: true,
  } satisfies SpringConfig,

  /**
   * Cinematic: Refined luxury curve with graceful momentum.
   */
  cinematic: {
    damping: 22,
    mass: 1.8,
    stiffness: 70,
    overshootClamping: false,
  } satisfies SpringConfig,
} as const;

export type SpringPreset = keyof typeof springPresets;

/**
 * Calculates a spring progression value (0 -> 1) with optional frame delay.
 */
export function getSpringVal(
  frame: number,
  fps: number,
  preset: SpringPreset = "smooth",
  delayFrames: number = 0
): number {
  const adjusted = Math.max(0, frame - delayFrames);
  return spring({
    frame: adjusted,
    fps,
    config: springPresets[preset],
  });
}

/**
 * Computes staggered spring progress for items in a sequence (e.g. letters, words, cards).
 */
export function staggerSpring(
  frame: number,
  fps: number,
  index: number,
  staggerFrames: number = 3,
  preset: SpringPreset = "snappy",
  baseDelay: number = 0
): number {
  const delay = baseDelay + index * staggerFrames;
  return getSpringVal(frame, fps, preset, delay);
}

/**
 * Safe linear interpolation clamped strictly between bounds.
 */
export function interpolateClamped(
  value: number,
  inputRange: [number, number],
  outputRange: [number, number]
): number {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  if (inMax === inMin) return outMin;
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}
