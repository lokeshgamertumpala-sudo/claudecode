---
description: Static code analytics, dependency topologies, circular import detection, and security scanning
---

# 🔍 Codebase Analyzer (/analyze)

Target / Operation: $ARGUMENTS

Run static analysis, dependency topologies, and security vulnerability scans using the `codebase-analyzer` skill:

```cmd
python .agents/skills/codebase-analyzer/scripts/codebase_analyzer.py $ARGUMENTS
```

## Capabilities
- `full [--path <dir>]`: Full audit including metrics, dependency cycles, orphans, and security scan.
- `metrics [--path <dir>]`: LOC, language distribution, and complexity breakdown.
- `deps [--path <dir>]`: Dependency graph topology, circular import detection, and orphan module identification.
- `security [--path <dir>]`: Secret leak scanning, dangerous execution detection (`eval`, `exec`, `shell=True`).
