---
name: code-refactor
description: Refactor code for optimal readability, maintainability, SOLID principles, performance, and adherence to clean code standards. Use when reviewing, modernizing, or cleaning up messy, legacy, or complex code.
---

# Code Refactor Skill

This skill guides Claude in transforming messy, legacy, repetitive, or complex code into clean, modular, and maintainable software without breaking existing behavior.

## Core Directives

1. **Behavior Preservation First**: Never change the external behavior or contract of the code unless explicitly asked. Keep all inputs, outputs, and side effects consistent.
2. **SOLID & Clean Code Principles**:
   - **Single Responsibility (SRP)**: Each function, class, or module must have one reason to change.
   - **Open/Closed (OCP)**: Code should be open for extension, closed for modification.
   - **Liskov Substitution (LSP)**: Subtypes must be substitutable for base types.
   - **Interface Segregation (ISP)**: Keep interfaces lean and specialized.
   - **Dependency Inversion (DIP)**: Depend upon abstractions, not concrete implementations.
3. **Eliminate Code Smells**:
   - Long functions (>30 lines) -> Extract into focused helper functions.
   - Deep nesting (>3 levels) -> Guard clauses, early returns, or polymorphism.
   - Magic numbers / string literals -> Named constants or enums.
   - Duplicate logic (DRY) -> Shared utilities or parameterized functions.
   - Bloated parameter lists -> Parameter objects or configuration interfaces.

## Step-by-Step Refactoring Workflow

1. **Analysis & Scope**:
   - Read the target file(s) and identify tightly coupled logic, dead code, and duplication.
   - Identify existing test coverage or verify behavior requirements before modifying.
2. **Decomposition**:
   - Break down monolithic functions into atomic, single-purpose functions.
   - Use descriptive, intention-revealing names (`calculateCartTotalWithTaxes` instead of `calc`).
3. **Modern Idioms**:
   - Modernize syntax (e.g., modern ES6+/TypeScript features, Python 3.10+ match-case/type hints, etc.).
   - Replace manual loops with declarative patterns where readability improves.
4. **Validation**:
   - Verify that all imports/exports remain intact.
   - Ensure type definitions and edge cases (null, undefined, empty collections) are safely handled.

## Invocation Examples
- `/code-refactor path/to/file.js`
- "Refactor this function to be cleaner and follow SOLID principles."
- "Extract the duplicated validation logic into a reusable utility."
