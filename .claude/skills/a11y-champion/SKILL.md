---
name: a11y-champion
description: Audit and implement web accessibility standards adhering to WCAG 2.2 Level AA/AAA, screen reader compatibility, ARIA landmarks, focus traps, and keyboard navigation.
---

# Accessibility (a11y) Champion Skill

This skill guides accessibility auditing, keyboard navigation engineering, screen reader compatibility, and WCAG 2.2 AA/AAA compliance.

## The Four Principles of Accessibility (POUR)

### 1. Perceivable
- **Contrast**: Text contrast must achieve at least `4.5:1` for normal text and `3:1` for large text (`18pt` or `14pt bold`) against background.
- **Alt Text**: All informative `<img>` tags must have descriptive `alt` attributes. Decorative images must have `alt=""` and `aria-hidden="true"`.
- **Form Labels**: Every `<input>`, `<select>`, `<textarea>` must have an associated `<label for="...">` or `aria-label`.

### 2. Operable
- **Full Keyboard Navigation**:
  - Every interactive element must be reachable and operable using only `Tab`, `Shift+Tab`, `Enter`, and `Space`.
  - Never set `outline: none` without providing an explicit, high-contrast `:focus-visible` state.
- **Focus Management**:
  - In modal dialogs, trap focus within the dialog while open. Return focus to the trigger button upon closing.
  - Provide a "Skip to main content" link as the first focusable element on the page.

### 3. Understandable
- Set page language: `<html lang="en">`.
- Group related form controls with `<fieldset>` and `<legend>`.
- Provide meaningful error announcements via `aria-live="polite"` or `aria-describedby`.

### 4. Robust
- Use native HTML elements first (`<button>`, `<dialog>`, `<nav>`, `<main>`, `<header>`) instead of clickable `<div>` elements.
- Avoid redundant ARIA (e.g., `<button role="button">` is unnecessary; use native `<button>`).

## Accessible Modal Pattern

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
  className="modal-overlay"
>
  <div className="modal-content">
    <h2 id="dialog-title">Confirm Account Deletion</h2>
    <p id="dialog-desc">This action cannot be undone. Are you sure you wish to proceed?</p>
    <div className="flex gap-3 justify-end mt-4">
      <button onClick={onClose} ref={initialFocusRef}>Cancel</button>
      <button onClick={onConfirm} className="btn-destructive">Delete</button>
    </div>
  </div>
</div>
```

## Invocation Examples
- `/a11y-champion Audit this form component for WCAG 2.2 AA accessibility and screen reader support`
- "Implement keyboard navigation and focus trapping for our custom dropdown component."
- "Review our color palette for contrast ratios against WCAG AAA requirements."
