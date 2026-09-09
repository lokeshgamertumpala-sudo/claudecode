---
name: responsive-wizard
description: Build fluid, mobile-first responsive layouts, dynamic CSS Grid & Flexbox structures, container queries, touch targets, and resilient viewports across mobile, tablet, and desktop.
---

# Responsive Wizard Skill

This skill guides the implementation of flawless responsive layouts that adapt smoothly across any device viewport width from 320px phones to 4K ultra-wide monitors.

## Core Directives

1. **Mobile-First Philosophy**:
   - Write default styles for the smallest mobile screen first (`360px`).
   - Layer progressive enhancements using min-width media queries (`sm:`, `md:`, `lg:`, `xl:` in Tailwind, `@media (min-width: ...)` in CSS).
2. **Modern CSS Grid for Fluid Cards**:
   - Avoid rigid column definitions. Use `auto-fit` with `minmax`:
   ```css
   .card-grid {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
     gap: 1.5rem;
   }
   ```
3. **Container Queries (`@container`)**:
   - Size components based on their immediate container's width rather than the entire browser viewport.
   ```css
   .widget-container {
     container-type: inline-size;
   }
   @container (min-width: 450px) {
     .widget-card {
       flex-direction: row;
     }
   }
   ```
4. **Touch Targets & Viewport Safe Areas**:
   - Mobile tap targets must be at least 44x44 CSS pixels.
   - Respect notched phones with safe-area insets:
     ```css
     padding-bottom: env(safe-area-inset-bottom, 16px);
     ```

## Responsive Viewport Checklist

- [ ] **No Horizontal Scroll**: Ensure no element overflows `100vw` or parent container boundaries.
- [ ] **Fluid Typography**: Use `clamp()` for smooth font scaling between mobile and desktop (`font-size: clamp(1.25rem, 2.5vw + 0.5rem, 2.5rem);`).
- [ ] **Collapsible Navigation**: Smooth transition from bottom nav / hamburger drawer on mobile to horizontal menu on desktop.
- [ ] **Images & Media**: Set `max-width: 100%; height: auto;` or `object-fit: cover` with proper aspect ratios.

## Invocation Examples
- `/responsive-wizard Fix horizontal scroll bug and make this pricing table responsive on mobile`
- "Design a fluid dashboard layout that gracefully transitions from 1 column on phones to 3 columns on desktop."
- "Implement modern CSS container queries for an embeddable widget component."
