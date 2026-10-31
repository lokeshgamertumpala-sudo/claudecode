/**
 * Curated, production-grade color palettes for high-end motion design.
 */
export const palettes = {
  appleMinimal: {
    name: "Apple Minimal",
    background: "#0b0c10",
    surface: "#1a1c23",
    textPrimary: "#f5f5f7",
    textSecondary: "#86868b",
    accent: "#ff9f0a",
    accentSecondary: "#ff375f",
    glow: "rgba(255, 159, 10, 0.35)",
  },

  cyberpunk: {
    name: "Cyberpunk HUD",
    background: "#05060b",
    surface: "#0e111d",
    textPrimary: "#ffffff",
    textSecondary: "#6a7b9b",
    accent: "#00f0ff",
    accentSecondary: "#ff007f",
    glow: "rgba(0, 240, 255, 0.45)",
    glowSecondary: "rgba(255, 0, 127, 0.4)",
  },

  deepSpace: {
    name: "Deep Space / Interstellar",
    background: "#03050d",
    surface: "#0c1022",
    textPrimary: "#eaf2ff",
    textSecondary: "#7280a5",
    accent: "#7928ca",
    accentSecondary: "#0070f3",
    glow: "rgba(121, 40, 202, 0.4)",
  },

  solarEarth: {
    name: "Solar Earth",
    background: "#030712",
    surface: "#0f172a",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    ocean: "#0284c7",
    continent: "#10b981",
    atmosphere: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.35)",
  },

  darkLuxury: {
    name: "Dark Luxury",
    background: "#0a0a0c",
    surface: "#18181b",
    textPrimary: "#fafafa",
    textSecondary: "#a1a1aa",
    accent: "#d4af37",
    accentSecondary: "#a3704c",
    glow: "rgba(212, 175, 55, 0.3)",
  },
} as const;

export type PaletteName = keyof typeof palettes;
