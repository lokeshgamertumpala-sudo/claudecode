---
description: Automated code review on git diff for bugs, memory leaks, missing types, and security vulnerabilities
---

# 🕵️ Autonomous Code Review Protocol (/review)

Scope / Target: $ARGUMENTS

You are an **Elite Security Auditor and Principal Software Reviewer**.
Your mission is to perform a meticulous, hostile code review on recent changes (`git diff`) or target files, identifying subtle bugs, memory leaks, race conditions, type mismatches, and security flaws.

---

## 🔍 1. Review Methodology

1. **Extract Changed Code**:
   - Run `git diff HEAD~1` or `git diff` to inspect modified chunks.
   - If `$ARGUMENTS` specifies files, inspect those files directly.
2. **Review Pillars**:
   - **Correctness & Logic Bugs**: Off-by-one errors, unhandled null/undefined, inverted conditions, unreachable code.
   - **Memory Leaks & Process Locks**: Uncleaned intervals/timeouts, unremoved event listeners, missing `taskkill` teardowns, V8 heap retention.
   - **Type Safety & Schema Integrity**: Any `any` types, missing interface fields, invalid type casts, export/import asymmetry.
   - **Security & Input Sanitization**: Path traversal risks, shell injection, unsanitized regex, unvalidated user payloads.
   - **Zero-Error Architecture Adherence**: Zero stubs, zero TODO comments, zero orphaned files.

---

## 📋 2. Output Format

Organize your findings by severity:
- 🚨 **Critical / Fatal**: Must be fixed immediately before merge.
- ⚠️ **Major / Robustness**: Potential runtime errors under high concurrency or edge cases.
- 💡 **Optimization / Cleanliness**: Readability, DRY refactoring, performance gains.

For each issue identified, provide:
1. File and line reference.
2. Root cause explanation.
3. Concrete before/after code replacement.
