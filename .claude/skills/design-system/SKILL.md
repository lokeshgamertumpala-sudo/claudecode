---
name: design-system
description: Architect comprehensive design systems, CSS variables/tokens, typography scales, cohesive color palettes (OKLCH, HSL), elevation shadows, and modular UI component libraries.
---

# Design System Skill

This skill guides the construction of cohesive, accessible, and scalable design systems from primitives to composite components.

## Core Foundations

### 1. Color Palette & Semantic Tokens
- Use perceptual color spaces like **OKLCH** or **HSL** for harmonious lightness and chroma transitions.
- Structure tokens into three layers:
  - **Primitive Tokens**: Raw values (`--color-blue-500: #3b82f6;`).
  - **Semantic Tokens**: Contextual roles (`--color-primary: var(--color-blue-500);`, `--color-surface-bg: #09090b;`).
  - **Component Tokens**: Component-scoped overrides (`--btn-primary-bg: var(--color-primary);`).
- Ensure contrast ratio meets WCAG 2.2 AA (minimum 4.5:1 for normal text, 3:1 for large text and UI borders).

### 2. Typographic Scale
- Use a proportional modular scale (Major Second 1.125 or Minor Third 1.2):
  - `xs`: 0.75rem (12px) - Meta tags, captions
  - `sm`: 0.875rem (14px) - Secondary text, inputs
  - `base`: 1.000rem (16px) - Body copy
  - `lg`: 1.125rem (18px) - Emphasized text
  - `xl`: 1.250rem (20px) - Subheadings
  - `2xl`: 1.500rem (24px) - Card headings
  - `3xl`: 1.875rem (30px) - Section headings
  - `4xl`: 2.250rem (36px) - Hero headlines

### 3. Spacing & Elevation Scale
- Base unit: 4px / 8px grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- Elevation shadows: Use multi-layered soft shadows with low opacity rather than harsh single-layer drop shadows.

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

## Invocation Examples
- `/design-system Build a complete semantic color and typography token set for dark & light mode`
- "Design a modular button component supporting variant (primary, secondary, ghost, destructive) and size (sm, md, lg)."
- "Create design guidelines and CSS variables for a fintech dashboard."
