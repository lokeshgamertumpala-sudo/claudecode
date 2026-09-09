---
name: bug-hunter
description: Diagnose, trace, and resolve stubborn bugs, crashes, race conditions, memory leaks, and logic errors with systematic root cause analysis. Use when troubleshooting errors, unexpected behavior, or broken code.
---

# Bug Hunter Skill

This skill provides a battle-tested diagnostic procedure to isolate, reproduce, root-cause, and fix complex software bugs.

## Core Methodology

1. **Reproduce & Isolate**:
   - Determine the exact trigger: input values, environment state, timing, or missing preconditions.
   - Eliminate unrelated variables to produce a minimal reproduction case.
2. **Trace the Execution Flow**:
   - Follow data transformations step-by-step from entry point to failure site.
   - Scrutinize boundaries: off-by-one errors, null/undefined propagation, type coercions, unhandled Promise rejections, and async race conditions.
3. **Hypothesize & Verify**:
   - Form a concrete hypothesis for the failure mechanism.
   - Verify the hypothesis against logs, stack traces, and variable values before editing code.
4. **Permanent Fix (Not Band-Aids)**:
   - Fix the actual root cause rather than suppressing symptoms (e.g., don't just wrap in an empty `try/catch`).
   - Add defensive checks at the boundary and assert invariants.

## Diagnostic Checklist

- [ ] **Stack Trace Inspection**: Locate exact file and line where error originates.
- [ ] **Nullish / Type Checks**: Check for optional chaining (`?.`), null coalescing (`??`), or type mismatches.
- [ ] **State Mutation**: Ensure immutable state isn't being accidentally mutated in React/Redux/state trees.
- [ ] **Async & Concurrency**: Check for unawaited promises, stale closures, missing cleanup in `useEffect`, or race conditions.
- [ ] **Network & Parsing**: Validate API status codes, JSON parsing failures, and CORS/header issues.

## Invocation Examples
- `/bug-hunter Fix this TypeError: Cannot read property 'map' of undefined in Dashboard.tsx`
- "Why does this function return NaN when quantity is 0?"
- "Trace why this database query hangs after 30 seconds."
