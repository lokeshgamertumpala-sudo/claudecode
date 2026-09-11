# 📂 File Management Standards

## 1. Strict Directory Hierarchy
- Maintain clean modular folders:
  - src/: Core application modules, components, utilities, and screens.
  - game_src/ / games/: Complete game source, assets, engines, and tests.
  - .agents/skills/ & .claude/skills/: Skills and autonomous runbooks.
  - scripts/: Production verification and operational scripts.

## 2. Interconnected Completeness (Zero Orphaned Files)
- Every relative import (import ... from './path', 
equire('./path')) MUST point to a file that physically exists on disk.
- When creating a module that references dependencies, implement all referenced dependencies in full during the same workflow.
- Ensure 100% symmetrical signatures:
  - Default exports (export default Component) -> import Component from ...
  - Named exports (export const util) -> import { util } from ...
  - Ensure package names match package.json exactly.

## 3. Atomic Editing & Git Cleanliness
- Use precise line-level replacement tools (
eplace_file_content) to prevent accidental truncation.
- Prevent UTF-8 BOM corruption (never write ﻿ to scripts).
- Keep .gitignore updated so runtime logs (*.log), caches (__pycache__), and temporary test artifacts are never checked into version control.
