# Report Generation Guide

Templates and formatting for code review and security audit reports.

## Report Structure

### 1. Executive Summary

```markdown
# Code Review Report: [Project/PR Name]

**Date:** YYYY-MM-DD
**Reviewer:** Claude (automated review)
**Scope:** [Files/components reviewed]

| Severity | Count |
|----------|-------|
| Critical | X |
| High | Y |
| Medium | Z |
| Low | W |

**Overall Risk:** Critical / High / Medium / Low
**Recommendation:** APPROVE / REQUEST CHANGES / REJECT
**Confidence:** High / Medium / Low

**Key Metrics:**
- Files analyzed: X/Y (Z%)
- Test coverage gaps: N functions
- High blast radius changes: M functions
- Security regressions detected: P
```

### 2. What Changed (Differential Mode)

```markdown
## What Changed

**Commit Range:** `base..head`
**Timeline:** YYYY-MM-DD to YYYY-MM-DD

| File | +Lines | -Lines | Risk | Blast Radius |
|------|--------|--------|------|--------------|
| file1.py | +50 | -20 | HIGH | 23 callers |
| file2.ts | +10 | -5 | MEDIUM | 3 callers |

**Total:** +N, -M lines across K files
```

### 3. Findings

```markdown
## Findings

### [CRITICAL] Title

**File:** `path/to/file.py:123`
**Confidence:** High
**Blast Radius:** N callers

**Description:**
[Clear explanation of the issue]

**Impact:**
[What an attacker/bug could cause]

**Evidence:**
```code
[Vulnerable/problematic code snippet]
```

**Fix:**
```code
[Corrected code]
```

**Historical Context:** (differential mode)
- Git blame: Added in commit X (date)
- Original commit message: "[message]"
```

### 4. Needs Verification

```markdown
## Needs Verification

Items requiring manual testing or additional context:

- [ ] [Item 1] — [What needs to be checked and why]
- [ ] [Item 2] — [Context needed]
```

### 5. Test Coverage Analysis

```markdown
## Test Coverage

**Untested Changes:**
| Function | Risk | Gap |
|----------|------|-----|
| functionA() | HIGH | No validation tests |
| functionB() | MEDIUM | Error paths untested |
```

### 6. Strengths

```markdown
## Strengths

- [What was done well]
- [Good patterns or approaches used]
```

### 7. Recommendations

```markdown
## Recommendations

### Immediate (Blocking)
- [ ] Fix CRITICAL issue in file.py:123
- [ ] Add tests for untested validation

### Before Production
- [ ] Load test high blast radius functions
- [ ] Security audit of auth changes

### Technical Debt
- [ ] Refactor duplicated validation logic
- [ ] Add monitoring for new endpoints
```

### 8. Methodology

```markdown
## Methodology

**Review Mode:** Quick Triage / Standard / Deep Audit / Differential
**Strategy:** Based on codebase size and risk profile

**Scope:**
- Files reviewed: X/Y (Z%)
- HIGH RISK: 100% coverage
- MEDIUM RISK: X% coverage
- LOW RISK: Surface scan only

**Techniques Applied:**
- Git blame on removed code
- Blast radius calculation
- Test coverage analysis
- Adversarial modeling (HIGH risk only)

**Limitations:**
- [What was NOT covered]
- [Assumptions made]

**Confidence:** HIGH for analyzed scope, MEDIUM overall
```

---

## Severity Labels

| Label | Meaning | Action |
|-------|---------|--------|
| `[blocking]` | Must fix before merge | Block merge |
| `[important]` | Should fix, discuss if disagree | Track |
| `[nit]` | Nice to have, non-blocking | Optional |
| `[suggestion]` | Alternative approach | Consider |
| `[question]` | Need clarity | Respond |

---

## File Naming

```
<PROJECT>_CODE_REVIEW_<DATE>.md
<PROJECT>_SECURITY_AUDIT_<DATE>.md
<PROJECT>_DIFFERENTIAL_REVIEW_<DATE>.md

Examples:
DemandDemon_CODE_REVIEW_2026-03-07.md
FoldForm_SECURITY_AUDIT_2026-03-07.md
```

**Output location priority:**
1. Current working directory (project repo)
2. User's Desktop
3. `~/.claude/reviews/`

---

## Quick Inline Format

For quick reviews without full report:

```markdown
**file.py:123** — [SEVERITY] Brief description
  Problem: [What's wrong]
  Fix: [How to fix]

**file.ts:45** — [SEVERITY] Brief description
  Problem: [What's wrong]
  Fix: [How to fix]
```
