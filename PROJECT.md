# Project: All-In-One Terminal AI Agent Environment, Remotion Motion Graphics & Skills Suite

## Architecture
- **Client**: Claude Code CLI (`@anthropic-ai/claude-code`) executing locally on Windows with Pre/PostToolUse hooks.
- **Proxy Layer**: LiteLLM Proxy running on `http://127.0.0.1:4000` with `sanitize_hook.py` (`RequestSanitizer` pre-call hook + `anthropic_sse_reasoning_stream_middleware` SSE streaming transformer).
- **Inference Engine**: NVIDIA NIM Cloud API (`mistralai/mistral-large-4-1t-a52b` as primary flagship default).
- **Model Switcher**: `select_model.py` and `active_model.txt` dynamically configuring active inference targets and updating `.claude/settings.json` and user profile `~/.claude/settings.json`.
- **Motion Graphics Engine**: Remotion v4 in `motion-studio/` with Direct3D ANGLE hardware acceleration, 60FPS telemetry HUD (`ToolCallHUD.tsx`), live preview on port 3100, and headless still/video rendering.
- **Tool Call Trigger**: Non-blocking emitter (`tool_motion_trigger.py` / `.agents/motion/tool_motion_hook.py`) operating in <15ms, updating `current_tool_call.json` atomically and firing background renders without stalling agent execution flow.
- **Agent Skills Suite**: Three production-grade callable skills (`code-crafter`, `codebase-analyzer`, `workflow-automator`) with standard YAML frontmatter `SKILL.md` and CLI tools in `scripts/`.
- **Target Workspaces**: Dual synchronized local clones (`C:\Users\NEW\OneDrive\Desktop\CLAUDE CODE E` and `C:\Users\NEW\OneDrive\Desktop\claudecode`) tracking GitHub repository `https://github.com/lokeshgamertumpala-sudo/claudecode.git`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Retirement Banner Model ID Replacement | Replace `claude-3-7-sonnet-20250219` with `claude-sonnet-5` in `start-claude.ps1`, `.claude/settings.json`, `config.yaml`, and `select_model.py` | M1 | Survey (Explorer 1) |
| 2 | Active Model Alignment | Set `active_model.txt` to `mistralai/mistral-large-4-1t-a52b` in both workspaces and align `config.yaml` default route | M1 | Survey (Explorer 1 & 3) |
| 3 | Conversational Query Detection Expansion | Expand conversational phrases ("how are you", "who are you", "what can you do", "tell me about yourself", questions ending in "?") in `sanitize_hook.py` | M1 | Survey (Explorer 2) |
| 4 | Zero Tool Pressure Enforcement | In conversational mode, strip tools (`pop("tools")`), strip thinking (`pop("thinking")`), and suppress thinking/architectural directives | M1 | Survey (Explorer 2) |
| 5 | SSE Streaming Atomic Event Delivery | Refactor `sse_transformer` to eliminate ghost `event: content_block_delta` frames, ensure atomic event delivery, and flush text deltas without stalls | M1 | Survey (Explorer 2) |
| 6 | SSE Keepalive Dual-Ping Flushing | Flush both `: ping\n\n` comments and `event: ping\ndata: {"type": "ping"}\n\n` frames immediately without buffering or stalls | M1 | Survey (Explorer 2) |
| 7 | Non-Coding Prompt Hang Prevention | Prevent non-standard/unrecognized single words (e.g. "akazza") from triggering 32k thinking loops by classifying short non-coding prompts as conversational | M1 | Survey (Explorer r5_1) |
| 8 | Thinking Token Budget Optimization | Cap default thinking budget to 8,192 tokens in `start-claude.ps1` and `sanitize_hook.py` to prevent 5-minute thinking stalls | M1 | Survey (Explorer r5_1) |
| 9 | HTML Syntax Repair | Repair unclosed `<div>` and corrupted `</p>` tags in `space-landing.html` and sync across both workspaces | M1 | Survey (Explorer r5_1) |
| 10 | Diagnostic Subsystem Assertions | Update `doctor.ps1` to assert active model matches `mistralai/mistral-large-4-1t-a52b` | M1 | Survey (Explorer r5_1) |
| 11 | Tool Call Motion Graphics HUD | Implement `ToolCallHUD.tsx` in `motion-studio/src/compositions/` and register in `Root.tsx` | M2 | Survey (Explorer r5_2) |
| 12 | Non-Blocking Tool Call Hook & Trigger | Implement `tool_motion_trigger.py` and `.agents/motion/tool_motion_hook.py` with <15ms execution SLA and atomic state update to `current_tool_call.json` | M2 | Survey (Explorer r5_2) |
| 13 | Claude Code Hook Integration | Configure `.claude/settings.json` `PreToolUse` and `PostToolUse` command hooks to trigger motion graphics | M2 | Survey (Explorer r5_2) |
| 14 | Coding Skill (`code-crafter`) | Implement `.agents/skills/code-crafter/` with `SKILL.md`, `scripts/code_craftsman.py`, and generation/refactoring/repair CLI | M3 | Survey (Explorer r5_3) |
| 15 | Analysis Skill (`codebase-analyzer`) | Implement `.agents/skills/codebase-analyzer/` with `SKILL.md`, `scripts/codebase_analyzer.py`, metrics, dependency graphs, security scanning | M3 | Survey (Explorer r5_3) |
| 16 | Workflow Automation Skill (`workflow-automator`) | Implement `.agents/skills/workflow-automator/` with `SKILL.md`, `scripts/workflow_automator.py`, multi-step pipelines, dual-workspace sync | M3 | Survey (Explorer r5_3) |
| 17 | Dedicated Master Test Runner | Implement `test_all.py` and `test-all.bat` verifying all 3 skills, tool call motion trigger latency, and render output, exiting code 0 | M4 | Survey (Explorer r5_3) |
| 18 | Dual Workspace Symmetrical Sync & Git Push | Symmetrically mirror all changes to `claudecode`, run full multi-language verifications, and push to GitHub `origin/main` | M4 | Survey (Explorer r5_1, r5_3) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Workspace Diagnostics & Error Resolution | `space-landing.html`, `sanitize_hook.py`, `start-claude.ps1`, `active_model.txt`, `config.yaml`, `doctor.ps1`, `select_model.py` | none | IN_PROGRESS |
| M2 | Tool Call Remotion Motion Graphics Integration | `ToolCallHUD.tsx`, `Root.tsx`, `tool_motion_trigger.py`, `.agents/motion/tool_motion_hook.py`, `.claude/settings.json` | M1 | IN_PROGRESS |
| M3 | Agent Skills Suite (Coding, Analysis, Automation) | `.agents/skills/code-crafter/`, `.agents/skills/codebase-analyzer/`, `.agents/skills/workflow-automator/`, `.claude/commands/` | none | IN_PROGRESS |
| M4 | Automated Verification Suite & Symmetrical Git Push | `test_all.py`, `test-all.bat`, symmetrical dual-workspace sync to `claudecode`, universal verification, git push | M1, M2, M3 | IN_PROGRESS |

## Interface Contracts
### Claude Code CLI Hooks ↔ Tool Motion Trigger
- Input on stdin: `{ "session_id": "...", "tool_name": "Write", "tool_input": { ... } }`
- Output on stdout: `{ "continue": true, "suppressOutput": true }`
- Latency SLA: <15ms execution time, non-blocking fire-and-forget.
- State sync contract: Writes `motion-studio/src/data/current_tool_call.json` atomically via tmp file replace.

### Remotion Composition Contract (`ToolCallHUD.tsx`)
- Composition ID: `ToolCallHUD`
- Resolution: 1920x1080 @ 60 FPS, Duration: 180 frames (3 seconds)
- Fallback data source: `current_tool_call.json`

### Agent Skills Suite Contracts
- `code-crafter`: `CodeCraftsman.generate_module(name, lang, spec)`, `refactor_code(code)`, `repair_syntax(code)`
- `codebase-analyzer`: `CodebaseAnalyzer.get_metrics(path)`, `get_dependency_graph(path)`, `security_scan(path)`
- `workflow-automator`: `WorkflowAutomator.sync_workspaces(src, tgt, dry_run)`, `run_pipeline(pipeline)`

### Master Test Runner Contract (`test_all.py`)
- Standard library execution (`unittest`), zero external dependencies.
- Exit code: `0` on 100% test pass; non-zero on any failure.

## Code Layout
- `.agents/skills/code-crafter/`: Coding skill implementation
- `.agents/skills/codebase-analyzer/`: Analysis skill implementation
- `.agents/skills/workflow-automator/`: Workflow automation skill implementation
- `.agents/motion/`: Tool motion hooks and background worker
- `motion-studio/src/compositions/ToolCallHUD.tsx`: Remotion 60FPS tool call HUD
- `motion-studio/src/data/current_tool_call.json`: Dynamic tool call state
- `tool_motion_trigger.py`: Top-level tool motion trigger script
- `test_all.py`: Master automated verification test runner
- `test-all.bat`: 1-Click test execution script
