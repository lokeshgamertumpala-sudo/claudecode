# 🛡️ Zero-Error Architecture & Execution Protocol (ALWAYS ACTIVE)

This workspace operates under the **Zero-Error Architecture Protocol**. Every tool call, code modification, file generation, and system command must adhere strictly to these 4 operational pillars:

---

## ⚡ 1. Efficiency Standard
- **Sub-Second Latency**: Model routing, cooldowns, and request sanitization run entirely in-memory without blocking network probes or disk bottlenecks.
- **Fast Readiness Probing**: Always check health via http://127.0.0.1:4000/health/readiness (responds in <5ms without touching upstream LLMs). Never poll /v1/models in tight loops.
- **Single-Instance Daemon Guard**: Never spawn multiple litellm or proxy daemons. Port 4000 must be owned by exactly one process pair. Clean stale processes using full process-tree termination (`taskkill /F /T /PID`).
- **High-Capacity Routing**: Primary traffic routes to `mistralai/mistral-large-4-1t-a52b` (Mistral Large 4, 1.05T Frontier MoE, 52B Active - Primary Default Flagship) and `nvidia/nemotron-3-ultra-550b-a55b` (NVIDIA Nemotron Ultra 550B MoE). Overloaded models (429 or concurrency exhaustion) enter adaptive cooldowns.

---

## 📂 2. File Management Standard
- **100% Interconnected Completeness**: Whenever writing an import or require referring to a relative path (./src/..., ../utils/...), you MUST immediately implement that target file in full during the same workflow. Zero orphaned files allowed.
- **Symmetrical Signatures**: Match default exports (export default) with default imports, and named exports (export const x) with named imports (import { x }).
- **Atomic Modifications**: Modify code using targeted replacement to prevent truncation. Never commit UTF-8 BOM (\ufeff) markers to code files.
- **Clean Workspace**: Keep the workspace clean. No duplicate confirmation files (FINAL_README.md, CONFIRM_WORKING.txt). All documentation resides in designated READMEs or skill references.

---

## 🔍 3. Pre- & Post-Execution Analysis
- **Universal Multi-Language Verification**: Every generated or modified file must pass syntax and integrity verification before declaring success:
  - **JavaScript / TypeScript**: Node syntax check (`node --check <file>`) and import path verification.
  - **Python**: AST syntax parse (`ast.parse`) and byte compilation.
  - **HTML**: HTML tag nesting balance and inline script syntax validation.
  - **JSON / YAML**: Strict deserialization parse.
  - **CSS**: Balanced brace validation.
- **Zero-Stub Mandate**: Zero // TODO: implement later, zero empty callbacks, zero mock dummy returns. All buttons, links, and forms must be wired to functional handlers.
- **Verification Runner**: Run python .agents/skills/zero-error-architect/scripts/universal_verifier.py or `verify-all.bat` to verify 100% integrity.

---

## 🎯 4. Final Output Standard
- Every file must be production-ready and functional immediately upon creation.
- For user-facing deliverables (games, web apps, tools), always provide a frictionless 1-click batch launcher (e.g. `play-game.bat`, `verify-all.bat`, `doctor.bat`).
- When asked what model, engine, or system is running, state clearly and accurately: **Mistral Large 4** (or active model) powered by **NVIDIA NIM** via local proxy routing.

---

## 🌐 5. Standalone Runtime & Process Standard (Zero White-Screens & Zero Process Orphanage)
- **Zero Blank-Screen Mandate**: Web deliverables must never produce a blank white screen when opened.
  - **No Absolute Root Paths**: In HTML, never use `/assets/...` or `/src/...`. Always use relative paths (`./assets/...`, `./dist/...`) or bundle self-contained assets.
  - **No Unbundled ES Modules on file://**: Browsers block `<script type="module">` under `file://` due to CORS. Always provide a 1-click localhost launcher (`launch.bat` using `python -m http.server` or `npx vite preview`) OR an IIFE bundle (`format: 'iife'`).
  - **No Raw JSX in Script Tags**: Never point `<script>` tags to raw `.jsx` files without compiling.
  - **HashRouter for Static Deliverables**: Use `HashRouter` instead of `BrowserRouter` when client-side routing must work under static or local protocols.
- **Process Orphanage Guard**:
  - Never leave runaway background dev servers (`vite`, `node`, `esbuild`, `webpack`) running untracked.
  - Check port availability before starting servers; never cascade duplicate instances across multiple ports (3000, 3001, 3002...).
  - Terminate background dev servers cleanly using full process-tree termination (`taskkill /F /T /PID`).
  - Run `python .agents/skills/runtime-deliverable-guardian/scripts/audit_deliverable.py <folder>` to verify runtime integrity.

---

## ⚡ 6. Native Slash Command Suite Protocol
- `/plan`: Strict Zero-Edit Planning (inspect codebase, create architecture design document, require explicit approval before modifying code).
- `/grill-me`: 1-by-1 Interactive Interview walking down each branch of the design tree.
- `/motion`: 1-Shot Turbo Remotion 60FPS pipeline (<2s check, <8s MP4 render, port 3100 preview).
- `/test`: Autonomous test runner for Node, Python, and Remotion.
- `/review`: Automated code review on git diff for bugs, memory leaks, missing types, and security.
- `/git-sync`: 1-click git pull, status check, commit, and push to origin/main.
- `/doctor`: Real-time system diagnostic report and auto-healing verification.
- `/model`: Switch models across all 11 NVIDIA NIM models.
- `/clean`: Clean caches, logs, and temp files.
