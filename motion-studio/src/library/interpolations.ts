import { interpolate, Easing } from "remotion";

/**
 * Robust clamped interpolation helper.
 * Automatically enforces { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
 * preventing out-of-bounds visual blowouts.
 */
export function interpolateSafe(
  frame: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  easing?: (input: number) => number
): number {
  return interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing ?? Easing.bezier(0.25, 0.1, 0.25, 1.0),
  });
}

/**
 * Standard clamp utility
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Computes an entrance and exit fade curve (0 -> 1 -> 1 -> 0)
 */
export function getInOutOpacity(
  frame: number,
  totalFrames: number,
  fadeFrames: number = 20
): number {
  return interpolateSafe(
    frame,
    [0, fadeFrames, totalFrames - fadeFrames, totalFrames],
    [0, 1, 1, 0]
  );
}

/**
 * Linear slide interpolation from start frame
 */
export function slideIn(
  frame: number,
  startFrame: number,
  durationFrames: number,
  fromPx: number,
  toPx: number = 0,
  easing?: (t: number) => number
): number {
  return interpolateSafe(
    frame,
    [startFrame, startFrame + durationFrames],
    [fromPx, toPx],
    easing ?? Easing.out(Easing.cubic)
  );
}
