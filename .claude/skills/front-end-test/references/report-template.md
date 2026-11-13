# Test Report Format Specification

## Report Structure

When generating the final test report, use this format:

```markdown
# Front-End Test Report

**Application**: [App name]
**URL**: [Base URL]
**Date**: [ISO timestamp]
**Tested by**: Claude Code /front-end-test
**Test user**: [email/username] (role: [role], permissions: [list of app/module access])
**Servers**: Frontend on :[port], Backend on :[port] [or "not running — API-dependent pages not tested"]

---

## Executive Summary

[1-2 sentence overview of overall results and critical findings]

## Test Summary

| Category     | Pass | Fail | Warn | Skip | Total |
|-------------|------|------|------|------|-------|
| Functional  |    0 |    0 |    0 |    0 |     0 |
| Visual      |    0 |    0 |    0 |    0 |     0 |
| A11y        |    0 |    0 |    0 |    0 |     0 |
| Responsive  |    0 |    0 |    0 |    0 |     0 |
| Console     |    0 |    0 |    0 |    0 |     0 |
| Performance |    0 |    0 |    0 |    0 |     0 |
| **TOTAL**   |    0 |    0 |    0 |    0 |     0 |

## Critical Issues

[List any critical/high severity failures first]

### Issue 1: [Title]
- **Severity**: Critical / High
- **Category**: [category]
- **Page**: [URL]
- **Detail**: [description]
- **Recommendation**: [fix suggestion]

## Detailed Results

### [Page Name] ([URL])

#### Functional
| Check | Status | Detail | Severity |
|-------|--------|--------|----------|
| page_loads | PASS | HTTP 200 | info |
| ... | ... | ... | ... |

#### Visual
| Check | Status | Detail | Severity |
|-------|--------|--------|----------|
| screenshot_desktop | PASS | Saved to ... | info |
| ... | ... | ... | ... |

#### Accessibility
| Check | Status | WCAG | Detail | Severity |
|-------|--------|------|--------|----------|
| images_have_alt | PASS | 1.1.1 | All images have alt text | info |
| ... | ... | ... | ... | ... |

#### Responsive
| Check | Status | Detail | Severity |
|-------|--------|--------|----------|
| no_overflow_mobile | PASS | No horizontal overflow | info |
| ... | ... | ... | ... |

#### Console Errors
| Check | Status | Detail | Severity |
|-------|--------|--------|----------|
| no_console_errors | PASS | 0 errors | info |
| ... | ... | ... | ... |

#### Performance
| Check | Status | Detail | Severity |
|-------|--------|--------|----------|
| page_load_time | PASS | 1.2s | info |
| ... | ... | ... | ... |

## UX Coherence Review

Reviewed [N] page screenshots in context. App purpose: [brief description].

### Findings

#### [SEVERITY] [Title]
- **Pages**: [which pages/screenshots]
- **Observed**: [what the screenshots show]
- **Expected**: [what a user would expect]
- **Impact**: [how this affects UX]
- **Recommendation**: [concrete fix]

### Cross-Page Consistency
- [Patterns that are consistent and well-done]
- [Patterns that vary across pages and should be unified]

### Navigation & Flow Issues
- [Any transitions that don't make sense]
- [Context preservation problems]

## Authorization Enforcement

> Only include this section if a restricted-access test was performed (Phase B).

**Test user**: [restricted email] (role: [role], lacks access to: [modules])

| Restricted Route        | Direct URL Access | Behavior                  | Nav Hidden? | Status |
|------------------------|-------------------|---------------------------|-------------|--------|
| /analytics             | Blocked           | Redirected to /dashboard  | Yes         | PASS   |
| /analytics/leaderboard | Blocked           | Shows "No access" card    | Yes         | PASS   |
| /admin/settings        | NOT blocked       | Page loads with empty data | No         | FAIL   |

### Authorization Findings
- [List any routes that should be restricted but aren't]
- [List any nav items that should be hidden but are still visible]
- [Note if 403s are handled gracefully (error card) vs. poorly (blank page, crash)]

## Screenshots

[List of captured screenshots with viewport info]
- `root_desktop.png` — Home page at 1440x900
- `root_mobile.png` — Home page at 375x812
- ...

## Recommendations

[Prioritized list of improvements]
1. **Critical**: [fix X]
2. **High**: [fix Y]
3. **Medium**: [improve Z]
```

## Severity Classification

| Severity | Criteria | Examples |
|----------|----------|---------|
| **Critical** | App crash, data loss, security risk | Unhandled exceptions, XSS, blank page |
| **High** | Major feature broken, accessibility barrier | Forms don't submit, no keyboard access, images without alt |
| **Medium** | Minor functionality issue, visual inconsistency | Layout shift, missing landmark, contrast below threshold |
| **Low** | Cosmetic issue, non-blocking warning | Console warnings, minor spacing, decorative image alt |
| **Info** | Suggestion, best practice | Performance optimization, code quality |

## Status Definitions

| Status | Meaning |
|--------|---------|
| **PASS** | Check passed successfully |
| **FAIL** | Check failed — issue found |
| **WARN** | Potential issue — manual review needed |
| **SKIP** | Check skipped (not applicable or dependency failed) |
