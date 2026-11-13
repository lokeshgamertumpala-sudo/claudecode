---
description: Fan out specialized agents to a task using Ruflo swarm
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, Task
---

# /fan agent - Fan Out Specialized Agents

Spawn one or more specialized agents from the Ruflo hierarchical swarm to work on a task.

## Usage

```
/fan agent <agent-type> [--task "description"] [--count N] [--parallel]
```

## Agent Types

| Type | Role | Best For |
|------|------|----------|
| `orchestrator` | Master Orchestrator | Planning, coordination, task decomposition |
| `architect` | Principal Architect | System design, architecture decisions, scalability |
| `researcher` | Research Specialist | Documentation lookup, API verification, best practices |
| `backend` | Senior Backend Engineer | API design, database, reliability, data handling |
| `frontend` | Senior Frontend Engineer | React/Next.js, components, performance, UX |
| `ux` | UI/UX Design Director | Visual design, design systems, accessibility |
| `debugger` | Debugging Specialist | Root cause analysis, regression testing, fixes |
| `qa` | QA & Security Reviewer | Security audit, code review, vulnerability scanning |

## Options

- `--task "description"` — Task description for the agent(s)
- `--count N` — Number of agents to spawn (default: 1, max: 8)
- `--parallel` — Run agents in parallel (default: true for count > 1)
- `--swarm <id>` — Target swarm ID (default: current active swarm)
- `--wait` — Wait for completion before returning

## Examples

```
/fan agent backend --task "Design REST API for user management"
/fan agent frontend ux --task "Redesign dashboard with new design system" --count 2 --parallel
/fan agent researcher --task "Find current best practices for React Server Components"
/fan agent debugger qa --task "Investigate memory leak in production" --count 2 --wait
/fan agent orchestrator --task "Plan migration from REST to GraphQL"
```

## Implementation

This command uses Ruflo CLI to spawn agents in the active swarm.

```bash
#!/usr/bin/env bash
set -euo pipefail

# Parse arguments
AGENT_TYPES=()
TASK_DESC=""
COUNT=1
PARALLEL=true
SWARM_ID=""
WAIT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --task)
      TASK_DESC="$2"
      shift 2
      ;;
    --count)
      COUNT="$2"
      shift 2
      ;;
    --parallel)
      PARALLEL=true
      shift
      ;;
    --no-parallel)
      PARALLEL=false
      shift
      ;;
    --swarm)
      SWARM_ID="$2"
      shift 2
      ;;
    --wait)
      WAIT=true
      shift
      ;;
    *)
      AGENT_TYPES+=("$1")
      shift
      ;;
  esac
done

# Validate
if [[ ${#AGENT_TYPES[@]} -eq 0 ]]; then
  echo "Error: At least one agent type required"
  echo "Usage: /fan agent <type> [options]"
  exit 1
fi

if [[ -z "$TASK_DESC" ]]; then
  echo "Error: --task description required"
  exit 1
fi

# Map agent types to Ruflo types
declare -A TYPE_MAP=(
  ["orchestrator"]="coordinator"
  ["architect"]="architect"
  ["researcher"]="researcher"
  ["backend"]="coder"
  ["frontend"]="coder"
  ["ux"]="reviewer"
  ["debugger"]="tester"
  ["qa"]="security-auditor"
)

# Get active swarm if not specified
if [[ -z "$SWARM_ID" ]]; then
  SWARM_ID=$(npx ruflo@latest swarm status --json 2>/dev/null | jq -r '.swarm_id // empty')
  if [[ -z "$SWARM_ID" ]]; then
    echo "Error: No active swarm found. Run 'ruflo swarm init' first."
    exit 1
  fi
fi

echo "🎯 Fanning out ${#AGENT_TYPES[@]} agent type(s) to swarm $SWARM_ID"
echo "📋 Task: $TASK_DESC"

# Create task
TASK_ID=$(npx ruflo@latest task create \
  --swarm "$SWARM_ID" \
  --type implementation \
  --description "$TASK_DESC" \
  --priority high \
  --json 2>/dev/null | jq -r '.id')

if [[ -z "$TASK_ID" ]]; then
  echo "Error: Failed to create task"
  exit 1
fi

echo "✅ Task created: $TASK_ID"

# Spawn and assign agents
for i in $(seq 1 "$COUNT"); do
  for TYPE in "${AGENT_TYPES[@]}"; do
    RUFLO_TYPE="${TYPE_MAP[$TYPE]}"
    if [[ -z "$RUFLO_TYPE" ]]; then
      echo "Warning: Unknown agent type '$TYPE', skipping"
      continue
    fi

    AGENT_NAME="${TYPE}-${i}-$(date +%s)"
    echo "🚀 Spawning $TYPE ($RUFLO_TYPE) as $AGENT_NAME..."

    AGENT_ID=$(npx ruflo@latest agent spawn \
      --type "$RUFLO_TYPE" \
      --name "$AGENT_NAME" \
      --description "$TASK_DESC" \
      --json 2>/dev/null | jq -r '.id')

    if [[ -n "$AGENT_ID" ]]; then
      npx ruflo@latest task assign "$TASK_ID" --agent "$AGENT_ID" >/dev/null
      echo "   ✅ Assigned $AGENT_ID to task"
    else
      echo "   ❌ Failed to spawn agent"
    fi
  done
done

# Wait for completion if requested
if [[ "$WAIT" == "true" ]]; then
  echo "⏳ Waiting for task completion..."
  while true; do
    STATUS=$(npx ruflo@latest task status "$TASK_ID" --json 2>/dev/null | jq -r '.status // "unknown"')
    if [[ "$STATUS" == "completed" ]]; then
      echo "✅ Task completed successfully"
      break
    elif [[ "$STATUS" == "failed" ]]; then
      echo "❌ Task failed"
      exit 1
    fi
    sleep 5
  done
else
  echo "📊 Task $TASK_ID is running. Check status with:"
  echo "   npx ruflo@latest task status $TASK_ID"
fi
```

## Notes

- Requires Ruflo swarm to be initialized (`ruflo swarm init`)
- Agents are spawned with the task description as their context
- Use `--wait` for synchronous execution (blocks until done)
- For parallel execution, agents share the same task ID and coordinate via Ruflo's message bus
- Each agent type gets appropriate skills auto-assigned:
  - `orchestrator` → Superpowers planning
  - `architect` → Superpowers + Differential Review
  - `researcher` → Context7 MCP
  - `backend` → Superpowers TDD + Context7
  - `frontend` → Vercel React Best Practices + Frontend Design
  - `ux` → UI UX Pro Max + Frontend Design
  - `debugger` → Superpowers debugging + Sentry (if auth'd) + Context7
  - `qa` → Differential Review + Superpowers verification