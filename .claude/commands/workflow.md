---
description: Multi-step pipeline execution, dual-workspace release synchronization, and slash command validation
---

# ⚡ Workflow Automator (/workflow)

Target / Operation: $ARGUMENTS

Orchestrate multi-step pipelines and synchronize local workspaces using the `workflow-automator` skill:

```cmd
python .agents/skills/workflow-automator/scripts/workflow_automator.py $ARGUMENTS
```

## Capabilities
- `sync --source <src> --target <tgt> [--dry-run]`: Symmetrically sync changes between dual workspaces using SHA-256 parity verification.
- `validate-commands [--dir <dir>]`: Inspect and validate all `.claude/commands/*.md` files.
