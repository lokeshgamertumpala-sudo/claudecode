import { spring } from "remotion";

/**
 * Pre-calibrated spring physics configurations for fluid 60FPS motion.
 * Designed for predictable, overshoot-controlled, cinematic animation.
 */
export const springPresets = {
  /**
   * Snappy: Quick, punchy, low mass. Ideal for badges, pop-in UI, icons, and micro-interactions.
   * Settles in ~15-20 frames at 60fps.
   */
  snappy: { damping: 15, mass: 0.5, stiffness: 180 },

  /**
   * Bouncy: Moderate overshoot, playful elastic feel. Ideal for kinetic titles, buttons, and callouts.
   * Settles in ~30-40 frames at 60fps.
   */
  bouncy: { damping: 10, mass: 0.8, stiffness: 120 },

  /**
   * Smooth: Apple-grade fluid, critically damped, zero harsh oscillation. Ideal for slides, cards, and scene transitions.
   * Settles in ~35-45 frames at 60fps.
   */
  smooth: { damping: 18, mass: 1.0, stiffness: 90 },

  /**
   * Cinematic: Heavy, authoritative, high mass. Ideal for logo reveals, epic title drops, and deep space camera moves.
   * Settles in ~60-80 frames at 60fps.
   */
  cinematic: { damping: 24, mass: 2.2, stiffness: 55 },

  /**
   * Gentle: Soft breathing and drifting motion. Zero abrupt acceleration.
   */
  gentle: { damping: 22, mass: 1.4, stiffness: 65 },

  /**
   * SlowMo: Dreamy slow motion float.
   */
  slowMo: { damping: 30, mass: 3.0, stiffness: 40 },
} as const;

export type SpringPresetName = keyof typeof springPresets;

/**
 * Computes a normalized spring value (0 -> 1) with optional frame delay.
 */
export function getSpringValue(
  frame: number,
  fps: number,
  preset: SpringPresetName = "smooth",
  delayFrames: number = 0
): number {
  const adjustedFrame = Math.max(0, frame - delayFrames);
  return spring({
    frame: adjustedFrame,
    fps,
    config: springPresets[preset],
  });
}
