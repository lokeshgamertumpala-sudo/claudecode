# Clean Code Standards & Architectural Guidelines

## 1. Zero Stubs Mandate
- Never emit `// TODO: implement later` or `pass # stub`.
- Every generated class, function, or handler must be completely functional immediately upon creation.

## 2. Type Safety
- In Python: always use `typing` annotations (`Optional`, `Dict`, `List`, `Any`, `Tuple`).
- In TypeScript: define strict interfaces (`interface Result { status: "success" | "error"; ... }`) rather than `any`.

## 3. Error Handling
- Wrap I/O operations and network calls in structured exception handlers.
- Return structured status dictionaries or objects rather than naked booleans or unchecked nulls.

## 4. AST Validation
- Run AST syntax validation (`ast.parse`) before saving or emitting Python code.
- Run `node --check` or TypeScript compilation before delivering JS/TS assets.
