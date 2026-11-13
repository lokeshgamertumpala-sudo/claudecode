import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolateSafe } from "./interpolations";

export interface CameraRigProps {
  children: React.ReactNode;
  startZoom?: number;
  endZoom?: number;
  startPanX?: number;
  endPanX?: number;
  startPanY?: number;
  endPanY?: number;
  durationFrames: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

/**
 * 2.5D Camera Rig that smoothly pans and zooms through scenes.
 */
export const CameraRig: React.FC<CameraRigProps> = ({
  children,
  startZoom = 1.0,
  endZoom = 1.08,
  startPanX = 0,
  endPanX = 0,
  startPanY = 0,
  endPanY = 0,
  durationFrames,
  startFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  const zoom = interpolateSafe(
    frame,
    [startFrame, startFrame + durationFrames],
    [startZoom, endZoom]
  );

  const panX = interpolateSafe(
    frame,
    [startFrame, startFrame + durationFrames],
    [startPanX, endPanX]
  );

  const panY = interpolateSafe(
    frame,
    [startFrame, startFrame + durationFrames],
    [startPanY, endPanY]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
        transformOrigin: "center center",
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
