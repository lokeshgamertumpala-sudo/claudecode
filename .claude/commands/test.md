---
description: Autonomous multi-language test runner for Node, Python, and Remotion with zero manual intervention
---

# 🧪 Autonomous Multi-Language Test Runner (/test)

Target Suite / Scope: $ARGUMENTS

You are operating under the **Autonomous Zero-Error Testing Protocol**.
Your goal is to discover, execute, and validate all tests across the repository, trace any failure to its fundamental root cause, and apply self-healing corrections.

---

## ⚡ 1. Autonomous Execution Matrix

Execute the relevant test suites according to the project type or `$ARGUMENTS`:

### A. Remotion & TypeScript Type-Check
Run TypeScript compilation check in `motion-studio/`:
```cmd
cd motion-studio && npm run check
```
Verifies strict TypeScript typing, JSX syntax, and Remotion composition signatures.

### B. Universal Multi-Language AST Auditor
Run the universal zero-error AST verifier across JavaScript, TypeScript, Python, HTML, CSS, JSON, and YAML:
```cmd
python .agents/skills/zero-error-architect/scripts/universal_verifier.py
```
Ensures 100% interconnected completeness and zero syntax errors.

### C. Python Test Suites
Run pytest or unittest if test files are present:
```cmd
python -m pytest -v
```

### D. Node / JavaScript Tests
Run npm test or node syntax validation if package.json contains test scripts:
```cmd
npm test
```

---

## 🔍 2. Failure Analysis & Self-Correction Protocol

If any test or verification fails:
1. **Analyze Failure**: Extract exact file path, line number, and stack trace.
2. **Root Cause**: Determine why the test failed (do NOT disable or weaken the test).
3. **Targeted Patch**: Modify the implementation to resolve the failure cleanly.
4. **Re-Test**: Re-run the test suite to confirm 100% pass rate.

Provide a concise summary table of all test suites executed, total tests run, and final pass/fail status.
