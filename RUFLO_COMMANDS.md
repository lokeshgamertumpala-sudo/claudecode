# 🌊 Ruflo & Claude-Flow Full-Fledged Command Catalog

> **Installed Location**: `.claude/commands/` across Desktop, Worktree, and User Home (`~/.claude/commands`).  
> **Core Files Status**: **100% Unmodified & Preserved** (Zero changes to proxy, config, or runtime files).  
> **Total Command Files Installed**: **196 Files** spanning 19 functional domains.

---

## 🚀 Quick Start: How to Invoke Commands in Claude Code

Any command in `.claude/commands/` is natively available as a slash command in your Claude Code terminal. You can run them by typing `/` followed by the command path, or by stating the command directly:

```text
> /claude-flow-help
> /sparc
> /analysis/performance-report
> /automation/self-healing
> /verify/check
```

---

## 📋 Comprehensive Category Index

### 1. 🏗️ SPARC Methodology (`.claude/commands/sparc/`)
The systematic development framework: **Specification $\rightarrow$ Pseudocode $\rightarrow$ Architecture $\rightarrow$ Refinement $\rightarrow$ Completion**.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/sparc` | `sparc.md` | Master SPARC development entry point |
| `/sparc/spec-pseudocode` | `sparc/spec-pseudocode.md` | Formal specifications & pseudocode designs |
| `/sparc/architect` | `sparc/architect.md` | System design, component boundaries & data contracts |
| `/sparc/code-analyzer` | `sparc/code-analyzer.md` | Static analysis, dependency mapping & complexity audit |
| `/sparc/code-reviewer` | `sparc/code-reviewer.md` | Rigorous quality and convention enforcement |
| `/sparc/debugger` | `sparc/debugger.md` | Root-cause analysis and minimal targeted repair |
| `/sparc/tdd` | `sparc/tdd.md` | Test-driven development loop (Red $\rightarrow$ Green $\rightarrow$ Refactor) |
| `/sparc/tester` | `sparc/tester.md` | Comprehensive test suite creation and edge-case coverage |
| `/sparc/workflow-manager` | `sparc/workflow-manager.md` | Multi-step task sequencing and checkpoint management |
| `/sparc/api-designer` | `sparc/api-designer.md` | REST/GraphQL schema contracts & endpoint validation |

---

### 2. 🤖 Agent Orchestration (`.claude/commands/agents/`)
Specialized agent coordination and capability discovery.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/agents/agent-types` | `agents/agent-types.md` | Catalog of 55+ specialized agent personas |
| `/agents/agent-capabilities` | `agents/agent-capabilities.md` | Skill & tool matrix for assigned roles |
| `/agents/agent-spawning` | `agents/agent-spawning.md` | Launch isolated subagent instances |
| `/agents/agent-coordination` | `agents/agent-coordination.md` | Synchronize cross-agent data handoffs |

---

### 3. 📊 Deep Analysis & Telemetry (`.claude/commands/analysis/`)
Performance, bottleneck, and token efficiency analysis.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/analysis/performance-report` | `analysis/performance-report.md` | Generate end-to-end performance benchmarks |
| `/analysis/bottleneck-detect` | `analysis/bottleneck-detect.md` | Detect CPU, I/O, network, and async bottlenecks |
| `/analysis/token-efficiency` | `analysis/token-efficiency.md` | Measure prompt/completion token density |
| `/analysis/token-usage` | `analysis/token-usage.md` | Real-time session token consumption report |
| `/analysis/compliance` | `analysis/COMMAND_COMPLIANCE_REPORT.md` | Verify project compliance against Ruflo standards |

---

### 4. ⚡ Automation & Self-Healing (`.claude/commands/automation/`)
Autonomous execution and failure recovery.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/automation/auto-agent` | `automation/auto-agent.md` | Autonomous task continuation loop |
| `/automation/self-healing` | `automation/self-healing.md` | Detect, diagnose, and auto-repair broken tests/code |
| `/automation/session-memory` | `automation/session-memory.md` | Persist discoveries and active state |

---

### 5. 🧠 Memory & Persistent Context (`.claude/commands/memory/`)
Semantic vector retrieval and cross-session knowledge base.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/claude-flow-memory` | `claude-flow-memory.md` | Master memory manager |
| `/memory/store` | `memory/store.md` | Store facts, architectural decisions, and patterns |
| `/memory/retrieve` | `memory/retrieve.md` | HNSW semantic similarity retrieval |
| `/memory/summary` | `memory/summary.md` | Compact and summarize project memories |

---

### 6. 🌐 Flow-Nexus & Federation (`.claude/commands/flow-nexus/`)
Distributed agent workflows and cloud federation.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/flow-nexus/status` | `flow-nexus/status.md` | Cloud federation and node connectivity status |
| `/flow-nexus/sync` | `flow-nexus/sync.md` | Bidirectional state synchronization |
| `/flow-nexus/deploy` | `flow-nexus/deploy.md` | Package and deploy agent workflows |

---

### 7. 🐙 GitHub & Git Lifecycle (`.claude/commands/github/`)
Automated version control and PR engineering.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/github/pr-create` | `github/pr-create.md` | Draft structured, auditable pull requests |
| `/github/pr-review` | `github/pr-review.md` | Comprehensive multi-perspective code review |
| `/github/issue-triage` | `github/issue-triage.md` | Label, prioritize, and scaffold issue solutions |

---

### 8. 👥 Pair Programming (`.claude/commands/pair/`)
Collaborative AI-assisted code pairing.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/pair/start` | `pair/start.md` | Initiate structured driver-navigator pairing |
| `/pair/review` | `pair/review.md` | Real-time inline feedback during development |
| `/pair/commands` | `pair/commands.md` | Available pairing shortcuts and modes |

---

### 9. 🛡️ Verification & Truth Engine (`.claude/commands/verify/` & `truth/`)
Zero-error integrity checks and mathematical verification.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/verify/check` | `verify/check.md` | Full multi-language syntax & AST verification |
| `/verify/start` | `verify/start.md` | Automated regression test runner |
| `/truth/start` | `truth/start.md` | Strict invariant and formal logic validation |

---

### 10. 🔄 Workflows & Streaming (`.claude/commands/workflows/` & `stream-chain/`)
Composable pipelines and long-horizon tasks.

| Command | File Path | Description |
| :--- | :--- | :--- |
| `/workflows/workflow-create` | `workflows/workflow-create.md` | Define declarative task pipelines |
| `/workflows/workflow-execute` | `workflows/workflow-execute.md` | Execute dependency-linked workflow waves |
| `/workflows/workflow-export` | `workflows/workflow-export.md` | Export pipeline states to JSON/YAML |
| `/stream-chain/pipeline` | `stream-chain/pipeline.md` | Real-time event streaming execution |

---

## 🛠️ Verification & Confirmation
* **Zero Core File Changes**: `config.yaml`, `sanitize_hook.py`, litellm proxy settings, and environment variables are **completely untouched**.
* **Installed Commands**: All 196 files copied with 100% data integrity and balanced structures.
* **Skill Integration**: `/ruflo` skill registered at `.claude/skills/ruflo/SKILL.md`.
