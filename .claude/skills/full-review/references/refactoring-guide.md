# Refactoring & Code Smell Detection

Identify code that works correctly but is hard to maintain, extend, or understand.
Based on Martin Fowler's refactoring catalog and industry-standard code smell taxonomies.

## When to Trigger This Pass

Always run during Standard and Deep Audit reviews. For Quick Triage, only flag
Critical/High items (God functions, extreme duplication).

---

## 1. Bloaters (Size & Complexity)

| Smell | Detection | Threshold | Severity |
|---|---|---|---|
| Long Function | Count lines per function | >50 lines | **High** |
| God Component (React) | Component lines + hook count | >200 lines or >6 hooks | **High** |
| Large File | Total file lines | >400 lines | **Medium** |
| Long Parameter List | Count function params | >4 params | **Medium** |
| Deep Nesting | Indentation depth | >3 levels | **Medium** |
| High Cyclomatic Complexity | Decision points per function | >10 branches | **Medium** |

### What to grep for
```
# Python: functions over 50 lines
# React: components over 200 lines
# Parameter lists: def/function with many commas in signature
# Deep nesting: 4+ levels of indentation in logic blocks
```

---

## 2. Duplication

| Smell | Detection | Threshold | Severity |
|---|---|---|---|
| Exact duplicates | Identical code blocks in 2+ places | Any | **High** |
| Structural duplicates | Same pattern with minor variations | 3+ instances | **High** |
| Semantic duplicates | Different code doing the same thing | 2+ approaches | **Medium** |

### Common duplication hotspots
- **Error handling** — same try/catch pattern repeated across files
- **API response mapping** — identical data transformation in multiple endpoints
- **Validation logic** — same checks in multiple handlers
- **SQL queries** — identical or near-identical queries for user/profile lookups
- **UI patterns** — mobile/desktop responsive rendering duplicated per page
- **Loading/error states** — identical spinner + error JSX in every page

### Rule of Three
Don't flag the first or second instance. Flag when the **third** copy appears — that's when extraction is clearly warranted.

---

## 3. Coupling & Cohesion

| Smell | Detection | Severity |
|---|---|---|
| Feature Envy | Method uses more data from another class than its own | **Medium** |
| Inappropriate Intimacy | Two modules that always change together or access each other's internals | **Medium** |
| Shotgun Surgery | One logical change requires editing 5+ files | **High** |
| Divergent Change | One file modified in unrelated PRs | **Medium** |

### How to detect
- **Shotgun Surgery:** If adding a new enum value, status, or field requires changes in >5 files, the abstraction is missing
- **Divergent Change:** Use `git log --follow <file>` — if commits are for unrelated features, the file has multiple responsibilities
- **Feature Envy:** Look for methods that call 3+ getters on another object

---

## 4. Dispensables

| Smell | Detection | Severity |
|---|---|---|
| Dead Code | Unreachable code, unused functions/variables/imports | **Low** |
| Commented-Out Code | Code blocks in comments (not documentation) | **Low** |
| Speculative Generality | Abstract class with 1 subclass, unused params, interfaces with 1 implementation | **Low** |
| Lazy Element | Class/function that just delegates without adding value | **Low** |

### What to grep for
```
# Dead code signals
TODO.*remove    DEPRECATED    UNUSED
# Commented code
^(\s*)//\s*(if|for|while|return|const|let|var|function|class|import|async)
^(\s*)#\s*(if|for|while|return|def|class|import|async)
```

---

## 5. Magic Values & Missing Abstractions

| Smell | Detection | Severity |
|---|---|---|
| Magic Numbers | Numeric literals in conditionals/assignments (not 0, 1, -1) | **Medium** |
| Magic Strings | String comparisons against hardcoded values | **Medium** |
| Primitive Obsession | String params named email/phone/url without value types | **Low** |
| Data Clumps | Same 2-3 params passed together to multiple functions | **Medium** |
| Hardcoded Config | URLs, ports, model IDs, timeouts in source code | **Medium** |

### What to grep for
```
# Magic numbers (skip 0, 1, -1)
\b[2-9]\d{2,}\b    # 3+ digit numbers
\b\d+\.\d+\b       # decimal numbers
# Repeated constants
min\(.*500\)        # hardcoded pagination limits
\.read\(8192\)      # hardcoded buffer sizes
```

---

## 6. React / Frontend-Specific

| Smell | Detection | Severity |
|---|---|---|
| God Component | >200 lines, mixed concerns (fetch + logic + render) | **High** |
| Prop Drilling | Prop passed through 3+ intermediate components | **Medium** |
| Multiple Boolean State | 3+ `useState<boolean>` for mutually exclusive states | **Medium** |
| Unnecessary useEffect | useEffect that sets state based on other state/props | **Medium** |
| Missing React.memo | List item components that re-render on parent state change | **Low** |
| Business Logic in Components | Validation/calculation/transformation in component body | **Medium** |

### What to grep for
```
# Boolean state sprawl
useState<boolean>    useState\(false\)    useState\(true\)
# Unnecessary useEffect (state derived from other state)
useEffect.*set[A-Z].*\[.*state
# Missing memo on list items
\.map\(\(.*\)\s*=>    # list rendering without memo
# Unsafe type assertions
as unknown as    as any
```

---

## 7. Python / Backend-Specific

| Smell | Detection | Severity |
|---|---|---|
| Mutable Default Args | `def foo(x=[])` or `def foo(x={})` | **High** |
| Bare Except | `except:` or `except Exception:` without specifics | **Medium** |
| Swallowed Exceptions | `except ... : pass` | **Medium** |
| God Handler | Route handler >50 lines mixing I/O + logic + response | **High** |
| N+1 Queries | Database query inside a loop | **High** |
| Inconsistent Return Types | Function returns data OR None OR raises | **Medium** |

### What to grep for
```python
# Mutable defaults (always a bug)
def.*=\s*\[\]     def.*=\s*\{\}
# Swallowed exceptions
except.*:\s*pass
# Bare except
except\s*:        except Exception\s*:
# N+1 queries
for.*:\n.*await.*execute\(    # query inside loop
for.*:\n.*\.get\(             # ORM get inside loop
```

---

## 8. TypeScript-Specific

| Smell | Detection | Severity |
|---|---|---|
| `any` type | `: any`, `as any`, `<any>` | **Medium** |
| Double assertion | `as unknown as SomeType` | **Medium** |
| Non-null assertion (`!`) | `value!.prop` without prior null check | **Low** |
| Missing discriminated union | Multiple optional fields that depend on each other | **Low** |

---

## 9. Consistency Issues

| Smell | Detection | Severity |
|---|---|---|
| Mixed async patterns | Callbacks + Promises + async/await in same codebase | **Medium** |
| Mixed import styles | `require()` + `import` in same project | **Low** |
| Inconsistent naming | camelCase + snake_case mixed in same language | **Low** |
| Inconsistent error format | Different error response shapes across endpoints | **Medium** |
| Mixed type syntax | `Optional[T]` + `T \| None` in same Python file | **Low** |

---

## Smell → Refactoring Quick Map

| Smell | Primary Fix |
|---|---|
| Long Function | Extract Method |
| Large Class/Component | Extract Class, Extract Component |
| Duplicate Code | Extract Method, Extract Hook, Extract Utility |
| Long Parameter List | Introduce Parameter Object |
| Feature Envy | Move Method |
| Data Clumps | Extract Class / Introduce Parameter Object |
| Primitive Obsession | Replace with Value Object / Enum |
| Shotgun Surgery | Move Method, Inline Class |
| Speculative Generality | Collapse Hierarchy, Delete unused code |
| Dead Code | Delete it (version control has history) |
| God Handler | Layered architecture (service/repository pattern) |
| N+1 Queries | Eager loading, batch queries, pre-fetch |
| Prop Drilling | React Context, component composition |
| Boolean State Sprawl | Single status enum, useReducer |

---

## Reviewer Checklist

- [ ] **No function over 50 lines** without clear justification
- [ ] **No component over 200 lines** — should be split
- [ ] **No file over 400 lines** — consider splitting
- [ ] **No code duplicated 3+ times** — extract to shared utility/component/hook
- [ ] **No magic numbers/strings** — use named constants
- [ ] **No bare except clauses** — catch specific exceptions
- [ ] **No mutable default arguments** in Python
- [ ] **No N+1 queries** — check for DB queries inside loops
- [ ] **No `any` type** without documented justification
- [ ] **Consistent patterns** across similar files (error handling, naming, imports)
- [ ] **Loading/error/empty states** handled in all data-fetching components
- [ ] **List items memoized** when parent state changes frequently
