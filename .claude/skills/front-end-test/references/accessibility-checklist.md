# WCAG 2.1 AA Accessibility Checklist

Organized by the four WCAG principles. Each item lists the requirement, how to test it with Playwright, and common failures.

## 1. Perceivable

### 1.1.1 Non-text Content
- **Requirement**: All images have descriptive alt text (or alt="" for decorative)
- **Test**: `document.querySelectorAll('img:not([alt])')` should return empty
- **Common failures**: Missing alt, alt="image", alt="logo.png", SVG icons without aria-label

### 1.3.1 Info and Relationships
- **Requirement**: Heading hierarchy is logical (h1→h2→h3, no skipping)
- **Test**: Extract all heading levels, verify no level is skipped
- **Common failures**: h1→h3 (skipping h2), multiple h1 elements, headings used for styling

### 1.3.1 Form Structure
- **Requirement**: All form inputs have associated labels
- **Test**: `input.labels.length > 0 || aria-label || aria-labelledby`
- **Common failures**: Placeholder used instead of label, label not associated via `for`/`id`

### 1.3.4 Orientation
- **Requirement**: Content works in both portrait and landscape
- **Test**: Check layout at 375x812 and 812x375
- **Common failures**: Content cut off in landscape, forced orientation

### 1.4.1 Use of Color
- **Requirement**: Color is not the only way to convey information
- **Test**: Check error states have icons/text not just red color
- **Common failures**: Red text only for errors, green/red only for status

### 1.4.3 Contrast (Minimum)
- **Requirement**: Text has 4.5:1 contrast ratio (3:1 for large text ≥18pt or ≥14pt bold)
- **Test**: Compute luminance contrast ratio for text against background
- **Common failures**: Light gray on white, low-contrast placeholder text

### 1.4.4 Resize Text
- **Requirement**: Text resizable up to 200% without loss of content
- **Test**: `page.evaluate("document.documentElement.style.fontSize = '200%'")`
- **Common failures**: Text overflow, overlapping elements, hidden content

### 1.4.11 Non-text Contrast
- **Requirement**: UI components and graphics have 3:1 contrast
- **Test**: Check border colors on inputs, icon contrast
- **Common failures**: Light borders on input fields, low-contrast icons

## 2. Operable

### 2.1.1 Keyboard
- **Requirement**: All functionality accessible via keyboard
- **Test**: Tab through all interactive elements, verify all reachable
- **Common failures**: Custom widgets not keyboard accessible, div onclick without tabindex/role

### 2.1.2 No Keyboard Trap
- **Requirement**: Focus can move away from any component via keyboard
- **Test**: Tab through elements, verify focus moves freely
- **Common failures**: Modal dialogs trapping focus (or not trapping when they should)

### 2.4.1 Bypass Blocks
- **Requirement**: Mechanism to skip repeated navigation
- **Test**: Check for "Skip to content" link as first focusable element
- **Common failures**: No skip link, skip link doesn't work

### 2.4.2 Page Titled
- **Requirement**: Pages have descriptive titles
- **Test**: `document.title` should be non-empty and descriptive
- **Common failures**: Default "React App", same title on every page

### 2.4.3 Focus Order
- **Requirement**: Focus order is logical and meaningful
- **Test**: Tab through page, verify order matches visual layout
- **Common failures**: Positive tabindex disrupting order, off-screen elements receiving focus

### 2.4.6 Headings and Labels
- **Requirement**: Headings and labels are descriptive
- **Test**: Review heading and label text for clarity
- **Common failures**: "Click here", "Read more", generic headings

### 2.4.7 Focus Visible
- **Requirement**: Focus indicator is visible on interactive elements
- **Test**: Check for outline or custom focus styles on :focus
- **Common failures**: `outline: none` without replacement, invisible focus ring

### 2.5.5 Target Size
- **Requirement**: Touch targets at least 44x44px
- **Test**: Measure bounding rect of interactive elements on mobile
- **Common failures**: Small icon buttons, tight link spacing

## 3. Understandable

### 3.1.1 Language of Page
- **Requirement**: `<html>` has valid `lang` attribute
- **Test**: `document.documentElement.getAttribute('lang')` should return valid code
- **Common failures**: Missing lang, wrong lang code

### 3.2.1 On Focus
- **Requirement**: Focus doesn't trigger unexpected context changes
- **Test**: Tab to elements, verify no unexpected navigation/popups
- **Common failures**: Select dropdown navigating on focus, auto-submitting forms

### 3.3.1 Error Identification
- **Requirement**: Input errors are clearly identified and described
- **Test**: Submit invalid form, check for specific error messages
- **Common failures**: Generic "invalid input", no error messages, error only indicated by color

### 3.3.2 Labels or Instructions
- **Requirement**: Form inputs have clear labels/instructions
- **Test**: All inputs have visible labels (not just placeholders)
- **Common failures**: Placeholder-only labels, missing required field indicators

## 4. Robust

### 4.1.1 Parsing
- **Requirement**: Valid HTML, unique IDs
- **Test**: Check for duplicate IDs: `document.querySelectorAll('[id]')` → verify uniqueness
- **Common failures**: Duplicate IDs (especially in repeated components)

### 4.1.2 Name, Role, Value
- **Requirement**: All UI components have accessible name, role, and state
- **Test**: Check buttons/links have text or aria-label, custom widgets have proper roles
- **Common failures**: Icon buttons without labels, custom dropdowns without ARIA, toggle state not announced

### ARIA Landmark Regions
- **Requirement**: Page uses landmark regions (main, nav, banner, contentinfo)
- **Test**: Check for `<main>`, `<nav>`, `<header>`, `<footer>` or role equivalents
- **Common failures**: No landmarks, all content in generic divs
