# Architecture Review Guide

Architecture and design review covering SOLID, anti-patterns, coupling, and layered architecture.

## SOLID Principles

### S — Single Responsibility (SRP)

**Warning signals:**
- Class name contains "And", "Manager", "Handler", "Processor"
- Class exceeds 200-300 lines
- Class has >7 public methods
- Different methods operate on completely unrelated data

**Review question:** "If requirement X changes, which methods change? If Y changes? Same answer = violation."

### O — Open/Closed (OCP)

**Warning signals:**
- Long `switch`/`if-else` chains for handling types
- Adding new functionality requires modifying core classes
- `instanceof`/`typeof` checks scattered throughout code

**Review question:** "To add a new type/variant, how many files must change?"

### L — Liskov Substitution (LSP)

**Warning signals:**
- Explicit type casting (downcasting)
- Subclass methods throw `NotImplementedError`
- Empty method implementations in subclasses
- Base class usage requires checking concrete type

### I — Interface Segregation (ISP)

**Warning signals:**
- Interface with >7 methods
- Implementations have empty/stub methods
- Different clients use different subsets of the interface

### D — Dependency Inversion (DIP)

**Warning signals:**
- High-level module directly `new`-ing low-level concrete classes
- Importing concrete implementations instead of interfaces
- Hard to write unit tests (can't mock dependencies)

**Review question:** "Can this class's dependencies be swapped in tests?"

---

## Architecture Anti-Patterns

### Critical Anti-Patterns

| Anti-Pattern | Signal | Impact |
|-------------|--------|--------|
| **God Object** | Single class >1000 lines, does everything | High coupling, untestable |
| **Big Ball of Mud** | No module boundaries, anything calls anything | Unmaintainable |
| **Spaghetti Code** | Deep nesting, tangled control flow | Unreadable |
| **Lava Flow** | Ancient untouchable code, no docs/tests | Technical debt accumulation |

### Design Anti-Patterns

| Anti-Pattern | Signal | Fix |
|-------------|--------|-----|
| **Golden Hammer** | Same pattern/technology for every problem | Choose tools for the problem |
| **Over-Engineering** | Simple problem, complex solution, many abstractions | YAGNI — simplify |
| **Boat Anchor** | Code for "future needs" that never materialize | Delete unused code |
| **Copy-Paste** | Same logic in multiple places | Extract shared function/module |

---

## Coupling & Cohesion

### Coupling (Good to Bad)

| Type | Description | Quality |
|------|------------|---------|
| **Message** | Parameters only | Best |
| **Data** | Shared simple data structures | Good |
| **Stamp** | Shared complex structure, uses partial | Acceptable |
| **Control** | Passes control flags | Warning |
| **Common** | Shared global state | Bad |
| **Content** | Directly accesses another's internals | Worst |

### Cohesion (Good to Bad)

| Type | Description | Quality |
|------|------------|---------|
| **Functional** | All elements complete a single task | Best |
| **Sequential** | Output feeds next step's input | Good |
| **Communicational** | Operates on same data | Acceptable |
| **Temporal** | Grouped by when they execute | Poor |
| **Logical** | Logically related but functionally different | Bad |
| **Coincidental** | No meaningful relationship | Worst |

### Metrics

```yaml
Class Coupling (CBO):
  Good: < 5
  Warning: 5-10
  Bad: > 10

Lack of Cohesion (LCOM):
  1: Single responsibility (good)
  2-3: Consider splitting
  >3: Must split
```

---

## Layered Architecture

### Clean Architecture Dependency Rule

```
Frameworks & Drivers  →  Interface Adapters  →  Application  →  Domain
     (outermost)                                              (innermost)
```

**Core rule: Dependencies point inward only.**

```typescript
// BAD — Domain depends on infrastructure
// domain/User.ts
import { MySQLConnection } from '../infrastructure/database';

// GOOD — Domain defines interface, infrastructure implements
// domain/UserRepository.ts
interface UserRepository {
  findById(id: string): Promise<User>;
}

// infrastructure/MySQLUserRepository.ts
class MySQLUserRepository implements UserRepository {
  findById(id: string): Promise<User> { /* ... */ }
}
```

### Layer Boundary Checklist
- [ ] Domain layer has no external dependencies (DB, HTTP, filesystem)
- [ ] Application layer doesn't directly operate DB or call external APIs
- [ ] Controllers don't contain business logic
- [ ] No cross-layer calls (UI directly calling repository)
- [ ] Business logic separated from presentation logic
- [ ] Configuration centralized, not scattered

---

## Design Pattern Usage

### When to Use

| Pattern | Use When | Don't Use When |
|---------|---------|---------------|
| **Factory** | Multiple types created at runtime | Single fixed type |
| **Strategy** | Algorithms need runtime switching | Only one algorithm |
| **Observer** | One-to-many state notifications | Simple direct calls suffice |
| **Singleton** | Truly need global unique instance | Can use dependency injection |
| **Decorator** | Dynamic responsibility addition | Fixed responsibilities |

### Over-Engineering Signals

- Simple `if/else` replaced by Strategy + Factory + Registry
- Interface with only one implementation
- Abstractions added for "future flexibility"
- Code lines increased significantly for patterns with no current benefit

---

## Code Structure

### Directory Organization

```
# GOOD — Organized by feature/domain
src/
├── user/
│   ├── User.ts
│   ├── UserService.ts
│   ├── UserRepository.ts
│   └── UserController.ts
├── order/
│   └── ...
└── shared/

# LESS IDEAL — Organized by technical layer
src/
├── controllers/    # Different domains mixed
├── services/
├── repositories/
└── models/
```

### Size Guidelines

```yaml
Single file: < 300 lines
Single function: < 50 lines
Single class: < 200 lines
Function parameters: < 4
Nesting depth: < 4 levels
```

---

## Quick Reference Checklist

### 5-Minute Architecture Scan
- [ ] Dependencies flow in correct direction (outer → inner)
- [ ] No circular dependencies
- [ ] Core business logic decoupled from framework/UI/database
- [ ] SOLID principles followed
- [ ] No obvious anti-patterns (God Object, spaghetti)

### Red Flags (Must Address)
- God Object — single class >1000 lines
- Circular dependency — A → B → C → A
- Domain layer imports framework/infrastructure
- Hardcoded secrets or configuration
- External service calls without interface abstraction

### Yellow Flags (Should Address)
- Class coupling (CBO) > 10
- Method parameters > 5
- Nesting depth > 4 levels
- Repeated code blocks > 10 lines
- Interface with single implementation
