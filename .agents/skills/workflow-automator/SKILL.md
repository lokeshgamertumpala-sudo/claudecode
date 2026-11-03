---
name: workflow-automator
description: Multi-step pipeline orchestration, dual-workspace release synchronization, and Claude Code custom slash command automation.
---

# ⚡ Workflow Automator Skill

Autonomous workflow engine for multi-step task execution, verified dual-workspace synchronization, and slash command integrity auditing.

## Capabilities

1. **Multi-Step Pipeline Orchestration** (`pipeline`):
   - Executes sequential and dependency-chained tasks with context passing and error recovery.
2. **Dual-Workspace Symmetrical Sync** (`sync`):
   - Synchronizes files between local workspaces (`CLAUDE CODE E` <-> `claudecode`).
   - Uses SHA-256 hash comparison to detect drift and copy changed assets atomically.
   - Supports `--dry-run` inspection mode.
3. **Slash Command Integrity Validation** (`validate-commands`):
   - Audits all `.claude/commands/*.md` files for syntax compliance and valid execution targets.

## CLI Usage

```bash
# Sync local workspaces symmetrically
python .agents/skills/workflow-automator/scripts/workflow_automator.py sync --source "C:/Users/NEW/OneDrive/Desktop/CLAUDE CODE E" --target "C:/Users/NEW/OneDrive/Desktop/claudecode"

# Dry run sync
python .agents/skills/workflow-automator/scripts/workflow_automator.py sync --source "src" --target "dist" --dry-run
```

## Python API

```python
from workflow_automator import WorkflowAutomator

res = WorkflowAutomator.sync_workspaces(src, tgt, dry_run=False)
pipe = WorkflowAutomator.run_pipeline({"steps": [{"name": "Step 1", "action": lambda ctx: "OK"}]})
```
