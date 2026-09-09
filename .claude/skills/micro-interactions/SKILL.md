---
name: micro-interactions
description: Craft polished UI animations, micro-interactions, state transitions, bouncy physics, skeleton loading states, and Framer Motion / CSS keyframes that make interfaces feel alive and tactile.
---

# Micro-Interactions Skill

This skill guides the design and implementation of fluid, tactile, and purposeful micro-interactions and animations that delight users without feeling sluggish.

## The Principles of Digital Motion

1. **Purpose-Driven Animation**:
   - Never animate for the sake of animation.
   - Use motion to:
     - **Direct Attention**: Highlight newly arrived items or errors.
     - **Provide Immediate Feedback**: Button clicks, active states, drag-and-drop.
     - **Explain Spatial Relationships**: Modals expanding from their trigger, tabs sliding into view.
2. **Timing & Easing**:
   - **Micro-feedback (clicks, toggles)**: 100ms - 200ms.
   - **UI transitions (dropdowns, accordions)**: 200ms - 300ms.
   - **Page / Modal transitions**: 300ms - 400ms.
   - **Easing curves**: Prefer ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) for entering elements, and ease-in for exiting elements.
3. **Respect User Motion Preferences**:
   - Always wrap significant animations with `@media (prefers-reduced-motion: reduce)`:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, ::before, ::after {
         animation-duration: 0.01ms !important;
         transition-duration: 0.01ms !important;
       }
     }
     ```

## Key Animation Patterns

### 1. Spring-like Button Press
```css
.btn-tactile {
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease;
}
.btn-tactile:active {
  transform: scale(0.97);
}
```

### 2. Shimmer Skeleton Loading
```css
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
}
.skeleton-shimmer::after {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0.3) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 1.8s infinite;
  content: '';
}
```

## Invocation Examples
- `/micro-interactions Add smooth micro-interactions to this toggle button, bookmark icon, and dropdown`
- "Implement spring physics animations with Framer Motion for opening and dismissing a modal."
- "Create an animated multi-step progress bar with milestone celebrations."
