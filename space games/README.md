# ORBITFORGE AI

**AI-Assisted Space Mission Design & Engineering Simulation Platform**

ORBITFORGE AI is an interactive educational platform that demonstrates how spacecraft design, mission objectives, scientific instruments, launch constraints, mass, power, communications, and orbital mechanics interact. Built for the NASA Space Apps Challenge: *Space Mission Design Game*.

---

## Quick Start

```
launch.bat          (Windows, one click)
```

Or manually:

```
npm install
npm run dev         →  http://localhost:5173
```

---

## What You Can Do

| Screen | Purpose |
|---|---|
| **Dashboard** | Mission overview, live mass/power budgets, orbital quick-edit |
| **Mission Designer** | Objective, orbit, launch vehicle, constraints with real-time validation |
| **Sketch Analyzer** | Upload a 2D sketch → AI detects components → you confirm dimensions |
| **Satellite Designer** | Interactive 3D viewport; edit parameters and watch geometry regenerate |
| **Orbital Simulator** | Rendered orbit with start/pause/reset, telemetry, physics verification |
| **Mission Report** | Full documentation, JSON export, print-ready |
| **Settings** | NVIDIA API key, units, appearance, data management |

---

## Complete Workflow

```
Open app  →  Select mission  →  Upload sketch  →  AI analysis
   →  Confirm dimensions  →  3D spacecraft  →  Edit parameters
   →  Budget engine updates  →  Configure instruments
   →  Configure orbit  →  Simulate  →  Evaluate constraints
   →  AI trade-off explanation  →  Generate report  →  Export
```

---

## Orbital Mechanics Engine

All authoritative orbital numbers come from deterministic code, not the AI.

```
μ = 3.986004418 × 10^14 m³/s²
R = 6,371,000 m
r = R + h

v  = √(μ/r)                    circular velocity
T  = 2π√(r³/μ)                 orbital period
ω  = √(μ/r³)                   angular velocity
```

Verified behavior:
- Increasing altitude **decreases** circular velocity
- Increasing altitude **increases** orbital period

Assumptions are idealized (two-body, circular/Keplerian). No unrealistic dynamics are claimed.

---

## Mass & Power Budget

**Mass**: main body, solar panels, antenna, instruments, propulsion, structure, thermal, avionics, power system → dry mass → propellant → wet mass → margin vs. configured limit.

**Power**: panel area × solar irradiance (1361 W/m²) × efficiency × losses → generated; instruments, avionics, thermal, propulsion, comms → consumption → margin.

Trade-offs are real: add panel area → more power but more mass. Add instruments → more capability but more mass and power demand.

---

## NVIDIA Kimi 3.1 Pro Integration

- Endpoint: `https://integrate.api.nvidia.com/v1/chat/completions` (OpenAI-compatible)
- Model: `kimi-3.1-pro`
- API key is **never** stored in source, never logged, never bundled into the frontend
- Configure it in Settings → AI Integration, or via `NVIDIA_API_KEY` in `.env`

When no key is present, the app stays fully usable and clearly labels sketch analysis as **development mock mode**.

---

## Security Notes

- API keys live only in `localStorage` / server-side environment variables
- File uploads: type + size validated (images only, 10 MB max)
- No `eval`, no arbitrary code execution, no unsafe HTML rendering
- No secrets committed to source

---

## Verification Performed

- Production build: **successful** (`npm run build`)
- Orbital math: numerically checked against reference cases at 400 km, 600 km, and 35,786 km
- Import chains: all local modules resolved and reachable
- Bundle: 2168 modules transformed, no unresolved imports
- Dev server: serving at http://localhost:5173

---

## Honest Limitations

- NVIDIA API was **not** tested live (no key supplied in this environment). The integration path is implemented and will activate on the first real request.
- Sketch analysis without an API key runs in mock mode and says so on screen.
- Propellant mass is a placeholder (no delta-v budget solver); this is shown as 0 in the report.
- Browser-based interaction testing (clicking through UI) was not performed programmatically; the golden path was verified through the build and served page.

---

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `launch.bat` | One-click Windows launcher |

---

## Project Structure

```
space games/
├── public/            favicon, static assets
├── server/            Express API proxy (NVIDIA key stays server-side)
├── src/
│   ├── components/    Layout, navigation
│   ├── pages/         Dashboard, MissionDesigner, SketchAnalyzer,
│   │                  SatelliteDesigner, OrbitalSimulator, MissionReport, Settings
│   ├── store/         Zustand store + all engineering math
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css      Tailwind + design tokens
├── index.html
├── launch.bat
└── package.json
```

---

**Powered by NVIDIA Kimi 3.1 Pro (2.8T MoE) via NIM enterprise inference.**
