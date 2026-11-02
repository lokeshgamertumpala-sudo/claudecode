---
description: Strict Zero-Edit Planning - inspect codebase, build architectural design, and require explicit user approval before touching code
---

# 📐 Strict Zero-Edit Planning Protocol

Target Goal / Feature: $ARGUMENTS

You are operating under the **Strict Zero-Edit Planning Protocol**.
Your objective is to thoroughly inspect the codebase, synthesize a comprehensive architectural design, and produce a definitive implementation plan **WITHOUT modifying or creating any code files** until the user gives explicit written approval.

---

## 🚫 1. Absolute Zero-Edit Mandate

1. **NO CODE MODIFICATIONS**:
   - You MUST NOT call `Write`, `Edit`, `Replace`, `Patch`, or destructive `Bash` commands that alter files.
   - Any modification to existing source code or creation of new files during this phase is a **protocol violation**.
2. **READ-ONLY INSPECTION**:
   - You are permitted to use read-only inspection tools: `Glob`, `Grep`, `View`, and non-mutating inspection commands (`git status`, `git diff`).
   - Identify existing patterns, dependency trees, entry points, interfaces, and potential breaking changes.

---

## 🏗️ 2. Architectural Design Document Generation

Produce an exhaustive, structured Architectural Design Document covering:

### Phase 1: Problem Analysis & Requirements Mapping
- **Objective**: Detailed restatement of the user's requirements and constraints.
- **Affected Subsystems**: Specific folders, files, and modules that will be involved.
- **Dependencies & Interconnections**: Cross-file imports, exports, and shared interfaces that must stay synchronized.

### Phase 2: Architectural Solution & Data Flow
- **Design Topology**: Modular decomposition, data flow diagrams (ASCII/Markdown), and state transitions.
- **Interface Contracts**: Precise TypeScript types, function signatures, props, or schema definitions to be added/altered.
- **Zero-Error Invariants**: Edge cases (empty inputs, network timeouts, invalid payloads, race conditions).

### Phase 3: Step-by-Step Execution Plan
- **Step 1**: Target file(s), changes, and specific functions/components.
- **Step 2**: Symmetrical export/import wiring.
- **Step 3**: Verification procedures (unit tests, `tsc --noEmit`, AST linting).
- **Rollback Strategy**: Recovery path if unexpected edge cases arise.

---

## 🚦 3. Explicit Approval Gate

Conclude your response strictly with:

> ⚠️ **Zero-Edit Planning Phase Complete**: No code has been written or modified.
> 
> Review the architectural design above. Once you approve, reply with **"Approved"** or **"Proceed"** to begin autonomous implementation under the Zero-Error Protocol.
