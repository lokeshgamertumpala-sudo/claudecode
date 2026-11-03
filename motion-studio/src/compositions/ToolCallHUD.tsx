import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import currentToolData from "../data/current_tool_call.json";

export interface ToolCallProps {
  toolName?: string;
  status?: "invoking" | "executing" | "completed" | "error";
  toolInput?: Record<string, any>;
  durationMs?: number;
  timestamp?: string;
}

const TOOL_THEMES: Record<string, { primary: string; accent: string; label: string }> = {
  Write: { primary: "#10b981", accent: "#34d399", label: "FILE WRITE OPERATION" },
  Edit: { primary: "#f59e0b", accent: "#fbbf24", label: "CODE MODIFICATION" },
  Bash: { primary: "#00f0ff", accent: "#38bdf8", label: "TERMINAL EXECUTION" },
  Read: { primary: "#a855f7", accent: "#c084fc", label: "SOURCE CODE ANALYSIS" },
  Grep: { primary: "#ec4899", accent: "#f472b6", label: "PATTERN RECOGNITION" },
  Glob: { primary: "#6366f1", accent: "#818cf8", label: "WORKSPACE SCANNING" },
  Default: { primary: "#00f0ff", accent: "#ff007f", label: "AUTONOMOUS TOOL INVOKED" },
};

export const ToolCallHUD: React.FC<ToolCallProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Combine file data with props fallback
  const toolName = props.toolName || currentToolData.toolName || "Write";
  const status = props.status || currentToolData.status || "executing";
  const toolInput = props.toolInput || (currentToolData.toolInput as Record<string, any>) || {};
  const durationMs = props.durationMs || currentToolData.durationMs || 0;

  const theme = TOOL_THEMES[toolName] || TOOL_THEMES.Default;

  // Spring entrance calculation
  const springProgress = Math.min(1, frame / 15);
  const scale = 0.9 + 0.1 * springProgress;
  const opacity = springProgress;

  // Rotations for telemetry reticle
  const rot1 = (frame * 1.8) % 360;
  const rot2 = (-frame * 1.2) % 360;

  // Format arguments summary
  const summaryArg = toolInput.file_path || toolInput.command || toolInput.pattern || toolInput.path || JSON.stringify(toolInput);
  const truncatedArg = String(summaryArg).length > 60 ? String(summaryArg).substring(0, 57) + "..." : String(summaryArg);

  // Pulse status
  const pulse = Math.sin(frame * 0.2) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030712",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        color: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Sci-Fi Grid Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(to right, ${theme.primary}11 1px, transparent 1px), linear-gradient(to bottom, ${theme.primary}11 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.6,
        }}
      />

      {/* Sweeping Laser Line */}
      <div
        style={{
          position: "absolute",
          top: `${(frame * 6) % 1080}px`,
          left: 0,
          right: 0,
          height: "2px",
          backgroundColor: theme.primary,
          boxShadow: `0 0 15px ${theme.primary}`,
          opacity: 0.4,
        }}
      />

      {/* Main HUD Card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
          width: 900,
          backgroundColor: "rgba(10, 15, 29, 0.85)",
          border: `1px solid ${theme.primary}66`,
          borderRadius: 16,
          boxShadow: `0 0 40px ${theme.primary}22, inset 0 0 20px ${theme.primary}11`,
          padding: "36px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Top Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.primary}33`, paddingBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: status === "completed" ? "#10b981" : theme.primary,
                boxShadow: `0 0 12px ${theme.primary}`,
                opacity: pulse,
              }}
            />
            <span style={{ fontSize: 13, letterSpacing: 3, color: theme.accent, fontWeight: "bold" }}>
              {theme.label}
            </span>
          </div>
          <span style={{ fontSize: 13, color: "#94a3b8", letterSpacing: 2 }}>
            FRAME: {frame} // 60 FPS
          </span>
        </div>

        {/* Center Tool Display */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, color: "#64748b", letterSpacing: 2 }}>ACTIVE AGENT TOOL</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: theme.primary, textShadow: `0 0 25px ${theme.primary}88` }}>
              {toolName.toUpperCase()}
            </div>
          </div>

          {/* Dual Orbital Telemetry Reticle */}
          <div style={{ position: "relative", width: 100, height: 100 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `2px dashed ${theme.primary}`,
                transform: `rotate(${rot1}deg)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 12,
                borderRadius: "50%",
                border: `2px dotted ${theme.accent}`,
                transform: `rotate(${rot2}deg)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 38,
                borderRadius: "50%",
                backgroundColor: theme.primary,
                boxShadow: `0 0 15px ${theme.primary}`,
              }}
            />
          </div>
        </div>

        {/* Arguments & Target */}
        <div style={{ backgroundColor: "rgba(3, 7, 18, 0.6)", borderRadius: 8, padding: "16px 20px", border: `1px solid ${theme.primary}22` }}>
          <div style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 1 }}>PAYLOAD SPECIFICATION:</div>
          <div style={{ fontSize: 18, color: "#f8fafc", marginTop: 6, wordBreak: "break-all" }}>
            {truncatedArg || "Autonomous Execution Task"}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              STATUS: <strong style={{ color: status === "completed" ? "#10b981" : theme.accent }}>{status.toUpperCase()}</strong>
            </span>
            {durationMs > 0 && (
              <span style={{ fontSize: 13, color: "#64748b" }}>
                LATENCY: <strong style={{ color: "#f8fafc" }}>{durationMs}ms</strong>
              </span>
            )}
          </div>
          <span style={{ fontSize: 12, color: "#475569" }}>
            NVIDIA NIM • MISTRAL LARGE 4 • REMOTION 60FPS
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default ToolCallHUD;
