---
name: tailwind-ninja
description: Master modern Tailwind CSS styling, responsive utilities, dark mode variants, arbitrary properties, fluid typography, gradients, glassmorphism, and shadcn/ui patterns.
---

# Tailwind Ninja Skill

This skill guides the construction of modern, aesthetic, and responsive web interfaces using Tailwind CSS v3 & v4 best practices.

## Modern Styling Techniques

### 1. Modern Surface Treatments & Glassmorphism
- **Frosted Glass**:
  ```html
  <div class="bg-white/10 dark:bg-zinc-900/60 backdrop-blur-md border border-white/20 dark:border-zinc-800/80 rounded-2xl shadow-xl p-6">
  ```
- **Radial Glow Gradients**:
  ```html
  <div class="absolute -inset-px bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-100 transition duration-500"></div>
  ```

### 2. State & Interaction Styling
- Use `group` and `peer` modifiers for coordinated multi-element animations:
  ```html
  <div class="group flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
    <span class="text-zinc-500 group-hover:text-blue-500 transition-colors">Icon</span>
    <span class="text-sm font-medium group-hover:translate-x-0.5 transition-transform">Interactive item</span>
  </div>
  ```
- Always style `:focus-visible` with high-contrast outline rings (`focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`).

### 3. Component Cleanliness with `clsx` and `tailwind-merge` (`cn` utility)
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Anti-Patterns to Avoid
- ❌ Hardcoding pixel values (`w-[347px]`) when standard scale or flex/grid handles it.
- ❌ Neglecting dark mode variants (`dark:`).
- ❌ Using `!important` (`!mt-4`) instead of fixing CSS specificity.

## Invocation Examples
- `/tailwind-ninja Style a sleek dark-mode pricing card with highlighted featured tier`
- "Convert this raw CSS mockup into modern Tailwind CSS classes using glassmorphism."
- "Build a responsive navigation header with hamburger menu and dark mode toggle in Tailwind."
