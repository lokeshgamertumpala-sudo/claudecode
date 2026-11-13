# Welcome to ORBITFORGE AI Team

## How We Use Claude

Based on lokeshgamertumpala-sudo's usage over the last 30 days:

Work Type Breakdown:
  Build Feature       ████████████████░░░░  60%
  Prototype           ██████████░░░░░░░░░░  30%
  Plan Design         ████░░░░░░░░░░░░░░░░  10%

Top Skills & Commands:
  /effort             ████████░░░░░░░░░░░░░  8x/month
  /boost              ███████░░░░░░░░░░░░░░  7x/month
  /goal               ███░░░░░░░░░░░░░░░░░░  3x/month
  /remotion-motion-graphics ██░░░░░░░░░░░░░░░  2x/month
  /grill-me           █░░░░░░░░░░░░░░░░░░░  1x/month
  /google-analytics   █░░░░░░░░░░░░░░░░░░░  1x/month
  /fable-goal         █░░░░░░░░░░░░░░░░░░░  1x/month
  /team-onboarding    █░░░░░░░░░░░░░░░░░░░  1x/month

Top MCP Servers:
  (none configured)

## Your Setup Checklist

### Codebases
- [ ] orbitforge-ai — https://github.com/lokeshgamertumpala-sudo/claudecode (current repo)

### MCP Servers to Activate
- [ ] (none) — No MCP servers configured. Consider adding GitHub, Linear, or database servers.

### Skills to Know About
- /effort — Adjust reasoning effort level (low/medium/high/xhigh/max). Team uses this for complex debugging.
- /boost — Enable boosted reasoning for difficult tasks. Used 7x/month.
- /goal — Set a focused goal for the session. Used for planning new features.
- /remotion-motion-graphics — Create Remotion animations. Used for space/physics visualizations.
- /grill-me — Interactive code review / challenge session.
- /google-analytics — Query GA data if connected.
- /fable-goal — Fable model specific goal setting.
- /team-onboarding — Generate this onboarding guide.

## Team Tips

- This project (ORBITFORGE AI) is a React + Three.js space mission design platform with orbital mechanics, satellite design, and AI-assisted engineering.
- The stack: React 18, Vite, Three.js (@react-three/fiber, @react-three/drei), Zustand, Tailwind CSS, Express backend.
- Use `launch.bat` for one-click dev server startup (handles dependencies, .env, concurrent client/server).
- AI features require NVIDIA_API_KEY in .env (get from https://build.nvidia.com).
- BrowserRouter is used — for static hosting, switch to HashRouter.
- All imports use `@/` alias pointing to `./src`.

## Get Started

1. Run `launch.bat` (or `npm run dev`) to start both client (port 5173) and API server (port 3001).
2. Open http://localhost:5173 — you should see the Dashboard with orbital mechanics calculations.
3. Explore the 7 pages: Dashboard, Mission Design, Sketch Analysis, Satellite Designer, Orbital Simulator, Mission Report, Settings.
4. Check `src/store/appStore.js` — it's the single source of truth for all spacecraft/orbital/mission state and calculations.
5. Try the Sketch Analysis page — upload a satellite sketch image to see the mock AI analysis pipeline.

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->