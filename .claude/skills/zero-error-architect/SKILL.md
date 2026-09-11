---
name: zero-error-architect
description: >-
  Elite autonomous protocol for maximum efficiency, clean file management,
  rigorous pre/post analysis, and guaranteed zero-error file generation across
  JavaScript, TypeScript, Python, HTML, CSS, JSON, YAML, and Shell scripts.
  Use whenever creating new projects, modifying existing files, refactoring code,
  or running integrity verification across any repository.
---

# 🛡️ Zero-Error Architect

The Zero-Error Architect protocol guarantees that every piece of software produced is:
1. **100% Interconnected** (zero broken imports or missing files)
2. **Syntactically & Architecturally Verified** (zero runtime syntax or type mismatch errors)
3. **Hyper-Efficient** (sub-second execution, zero zombie processes, fast readiness checks)
4. **Complete & Production-Ready** (zero stubs, 0 TODO placeholders, live event wiring)

---

## ⚡ Core Operational Pillars

### 1. Efficiency Standard
- **Sub-Second Latency**: Optimize inference and proxy routing. Use in-memory model routing and /health/readiness (<5ms response).
- **Single-Instance Daemon Guard**: Never allow duplicate daemons or proxy processes to compete on port 4000. Clean stale processes with process tree termination (	askkill /F /T).
- Read full details in [Efficiency Standards](./references/efficiency_standards.md).

### 2. File Management Standard
- **Zero Orphaned Imports**: Every relative import (./src/...) must resolve to a valid file on disk.
- **Symmetrical Signatures**: Match default exports (export default) with default imports, and named exports with named imports.
- **Atomic Modification**: Use precise line replacement to prevent code truncation.
- Read full details in [File Management Standards](./references/file_management_standards.md).

### 3. Pre- & Post-Execution Analysis
- **Universal Multi-Language Verification**: Before declaring any task complete, run AST syntax validation across all affected files:
  - JavaScript / TypeScript: 
ode --check
  - Python: st.parse and byte compilation
  - HTML: Balanced tag parsing and inline <script> validation
  - JSON / YAML: Strict deserialization validation
  - CSS: Bracket matching and rule integrity
- Read full details in [Analysis Protocol](./references/analysis_protocol.md).

### 4. Final Output Standard
- Every file must be immediately usable by the user with zero setup hurdles.
- Provide 1-click launchers (.bat files) for interactive applications.
- Read full details in [Final Output Standards](./references/output_standards.md).

---

## 🛠️ Executable Power Tools

### 1. Universal Workspace Auditor
Audit every file in the repository across all languages with a single command:
`ash
python .agents/skills/zero-error-architect/scripts/universal_verifier.py
`
Or run the 1-click root launcher:
`ash
verify-all.bat
`

### 2. Power File Generator
Generate and verify any new file with 100% pre-checked syntax:
`ash
python .agents/skills/zero-error-architect/scripts/make_clean_file.py <path> <html|js|py|json|css> [title] [description]
`

### 3. Verification Command for Claude Code
Type /verify-all inside Claude Code CLI or /verify to crawl and check integrity.
