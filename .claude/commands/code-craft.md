---
description: Autonomous code craftsman for module generation, architectural refactoring, and zero-error syntax repair
---

# 🛠️ Code Craftsman (/code-craft)

Target / Operation: $ARGUMENTS

Execute code generation, refactoring, or syntax repair using the `code-crafter` skill:

```cmd
python .agents/skills/code-crafter/scripts/code_craftsman.py $ARGUMENTS
```

## Capabilities
- `generate --name <Name> --lang <python|typescript> [--out <file>]`: Generate a production module with complete type annotations.
- `refactor --file <file>`: Modularize monolithic functions and clean formatting.
- `repair --file <file>`: Repair syntax anomalies and assert clean AST compilation.
