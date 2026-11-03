---
name: code-crafter
description: Intelligent code generation, architectural refactoring, zero-error code authoring, and test generation across Python, TypeScript, JavaScript, and HTML.
---

# 🛠️ Code Crafter Skill

High-precision autonomous code craftsman specializing in zero-stub implementation, idiomatic architectural modularization, and automated syntax repair.

## Capabilities

1. **Production Module Generation** (`generate`):
   - Synthesizes fully-typed, syntactically verified Python and TypeScript services.
   - Enforces zero stubs, comprehensive docstrings, and verified return signatures.
2. **Architectural Refactoring** (`refactor`):
   - Modularizes complex monolithic functions into composable subroutines.
   - Preserves strict external contracts and runtime behavior.
3. **Automated Syntax Repair** (`repair`):
   - Detects and repairs broken syntax (unclosed quotes/braces, missing colons).
   - Validates code compilation via AST parsing prior to emission.

## CLI Usage

```bash
# Generate a new Python service module
python .agents/skills/code-crafter/scripts/code_craftsman.py generate --name OrderProcessor --lang python --out src/orders.py

# Repair code syntax
python .agents/skills/code-crafter/scripts/code_craftsman.py repair --file broken_module.py

# Refactor code
python .agents/skills/code-crafter/scripts/code_craftsman.py refactor --file monolith.py
```

## Python API

```python
from code_craftsman import CodeCraftsman

code = CodeCraftsman.generate_module(name="UserService", language="python", spec={"functions": ["create_user", "get_user"]})
repaired = CodeCraftsman.repair_syntax(broken_code, language="python")
```
