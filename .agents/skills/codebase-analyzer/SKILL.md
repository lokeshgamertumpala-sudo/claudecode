---
name: codebase-analyzer
description: Deep codebase analytics, dependency graph topology, circular import detection, security vulnerability scanning, and performance bottleneck profiling.
---

# 🔍 Codebase Analyzer Skill

Comprehensive static analysis and security scanning tool providing AST-driven code metrics, dependency topologies, circular import detection, and secret leak scanning.

## Capabilities

1. **Metrics & Language Breakdown** (`metrics`):
   - Computes total files, physical lines of code, and language distribution.
2. **Dependency Graph & Circular Imports** (`deps`):
   - Builds directed dependency graphs for Python and TypeScript/JavaScript modules.
   - Detects circular dependencies (`A -> B -> A`) and identifies orphaned files.
3. **Security Vulnerability Scanner** (`security`):
   - Scans for hardcoded API keys, tokens, and secrets.
   - Flags dangerous execution patterns (`eval()`, `exec()`, `shell=True` without sanitization).

## CLI Usage

```bash
# Full analysis of current workspace
python .agents/skills/codebase-analyzer/scripts/codebase_analyzer.py full --path .

# Metrics only
python .agents/skills/codebase-analyzer/scripts/codebase_analyzer.py metrics --path src

# Security scan with JSON output
python .agents/skills/codebase-analyzer/scripts/codebase_analyzer.py security --path . --json
```

## Python API

```python
from codebase_analyzer import CodebaseAnalyzer

metrics = CodebaseAnalyzer.get_metrics(".")
graph = CodebaseAnalyzer.get_dependency_graph(".")
security = CodebaseAnalyzer.security_scan(".")
```
