import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolateClamped } from "./springs";

export interface CameraRigProps {
  children: React.ReactNode;
  mode?: "standard" | "kenBurns" | "perspective3D";
  startZoom?: number;
  endZoom?: number;
  startPanX?: number;
  endPanX?: number;
  startPanY?: number;
  endPanY?: number;
  startPitch?: number; // rotateX
  endPitch?: number;
  startYaw?: number;   // rotateY
  endYaw?: number;
  startRoll?: number;  // rotateZ
  endRoll?: number;
  perspective?: number;
  durationFrames?: number;
  startFrame?: number;
  focalPoint?: { x: number; y: number }; // Percentage 0-100
  cameraShake?: boolean;
  shakeIntensity?: number;
  style?: React.CSSProperties;
}

/**
 * CameraRig: Versatile 2.5D and 3D camera staging rig.
 * Delivers smooth continuous zoom, pan, Ken Burns cinematic drift,
 * 3D perspective pitch/yaw rotations, and deterministic micro-drift.
 */
export const CameraRig: React.FC<CameraRigProps> = ({
  children,
  mode = "standard",
  startZoom = 1.0,
  endZoom = 1.08,
  startPanX = 0,
  endPanX = 0,
  startPanY = 0,
  endPanY = 0,
  startPitch = 0,
  endPitch = 0,
  startYaw = 0,
  endYaw = 0,
  startRoll = 0,
  endRoll = 0,
  perspective = 1200,
  durationFrames = 120,
  startFrame = 0,
  focalPoint = { x: 50, y: 50 },
  cameraShake = false,
  shakeIntensity = 1.5,
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolateClamped(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1]
  );

  // Smooth ease-in-out curve
  const easeProgress =
    progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  // Compute Zoom & Pans
  let zoom = interpolateClamped(easeProgress, [0, 1], [startZoom, endZoom]);
  let panX = interpolateClamped(easeProgress, [0, 1], [startPanX, endPanX]);
  let panY = interpolateClamped(easeProgress, [0, 1], [startPanY, endPanY]);

  // Compute 3D Rotations
  const pitch = interpolateClamped(easeProgress, [0, 1], [startPitch, endPitch]);
  const yaw = interpolateClamped(easeProgress, [0, 1], [startYaw, endYaw]);
  const roll = interpolateClamped(easeProgress, [0, 1], [startRoll, endRoll]);

  // Ken Burns Mode adjustments
  if (mode === "kenBurns") {
    // Continuous subtle drift towards focal point
    const driftX = ((focalPoint.x - 50) / 50) * 40 * easeProgress;
    const driftY = ((focalPoint.y - 50) / 50) * 30 * easeProgress;
    panX += driftX;
    panY += driftY;
  }

  // Deterministic organic camera breathing / micro-shake (zero Math.random)
  if (cameraShake) {
    const shakeX =
      (Math.sin(frame * 0.15) * 0.7 + Math.sin(frame * 0.31) * 0.3) * shakeIntensity;
    const shakeY =
      (Math.cos(frame * 0.12) * 0.7 + Math.cos(frame * 0.27) * 0.3) * shakeIntensity;
    const shakeRot = (Math.sin(frame * 0.08) * 0.2) * shakeIntensity;
    panX += shakeX;
    panY += shakeY;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        perspective: `${perspective}px`,
        overflow: "hidden",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformOrigin: `${focalPoint.x}% ${focalPoint.y}%`,
          transform: `scale3d(${zoom}, ${zoom}, 1) translate3d(${panX}px, ${panY}px, 0) rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`,
          transformStyle: "preserve-3d",
          willChange: "transform",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};
