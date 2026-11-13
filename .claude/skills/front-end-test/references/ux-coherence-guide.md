# UX Coherence Review Guide

This review is performed by Claude using vision — not by automated scripts. After the automated test phases capture screenshots of every page, Claude reads them all and analyzes the app holistically.

## When to Perform This Review

- After automated checks (functional, visual, a11y, responsive, console, performance) are complete
- Screenshots must exist for every discoverable page
- The app's purpose and target users should be understood (ask the user if unclear)

## Pre-Review: Gather Context

Before analyzing screenshots, understand the app:

1. **What does this app do?** Read the README, CLAUDE.md, or ask the user. A demand planning tool, an expense tracker, and a project management app all have different UX expectations.
2. **Who are the users?** Power users who live in the app daily? Occasional users? Admins vs. regular users?
3. **What are the core workflows?** The 3-5 things users do most often. These flows deserve the most scrutiny.
4. **What is the app's navigation model?** Single sidebar? Multi-app with app switcher? Tab-based? Understand the intended IA before judging it.

## Analysis Framework

Read ALL screenshots, then evaluate each dimension below. For each finding, note:
- **What you observed** (specific screenshot / page)
- **Why it's a problem** (what would confuse or frustrate a user)
- **Severity**: Critical (users will get lost/stuck), High (confusing but recoverable), Medium (inconsistent but functional), Low (polish/nitpick)
- **Suggested fix** (concrete recommendation)

### 1. Navigation & Wayfinding

**Check**: Does the user always know where they are and how to get where they need to go?

| What to look for | Red flags |
|-------------------|-----------|
| Active nav item matches current page | Nav highlight on wrong item, or no highlight at all |
| Breadcrumbs (if present) are accurate | Breadcrumb shows wrong path or stale state |
| Sidebar/nav context matches the current app area | Clicking settings in App A shows App B's sidebar |
| Back button behavior is predictable | Back goes somewhere unexpected after a modal or nested view |
| Page titles/headings match what the nav link said | Nav says "Reports" but page heading says "Analytics" |
| App switcher (if multi-app) clearly indicates current app | No visual distinction between apps, or wrong app appears active |

**Interaction test**: Click each nav item and verify the page + nav state are consistent. Capture before/after screenshots for any suspicious transitions.

### 2. Context Preservation

**Check**: Does the app maintain appropriate state when navigating between views?

| What to look for | Red flags |
|-------------------|-----------|
| Settings pages keep you in the current app context | Global settings gear drops you into a different app's context |
| Filters/selections persist when navigating away and back | Returning to a filtered list resets all filters |
| Form state preserved during accidental navigation | Half-filled form lost with no warning |
| Modal/dialog dismissal returns to previous state | Closing a modal changes the underlying page |

### 3. Information Hierarchy

**Check**: Does the visual layout communicate the right priorities?

| What to look for | Red flags |
|-------------------|-----------|
| Primary action is the most prominent element | "Delete" button is more prominent than "Save" |
| Page heading clearly describes the page's purpose | Generic heading or heading that doesn't match content |
| Most important data/content is above the fold | Key information buried below secondary content |
| Empty states guide the user toward action | Blank page with no guidance on what to do next |
| Data density appropriate for the page type | Dashboard too sparse or too dense; tables with too many columns |

### 4. State Consistency

**Check**: Does the UI accurately reflect the current application state?

| What to look for | Red flags |
|-------------------|-----------|
| Loading states are shown during data fetching | Content area blank with no spinner/skeleton |
| Error states are contextual and helpful | Generic "Something went wrong" with no context |
| Success feedback confirms completed actions | Action completes silently with no confirmation |
| Counts and badges update correctly | Badge says "3" but list shows 5 items |
| Toggle/switch states match the actual setting | Toggle shows "on" but feature is off |

### 5. Cross-Page Consistency

**Check**: Are the same patterns used for the same concepts throughout the app?

| What to look for | Red flags |
|-------------------|-----------|
| Tables styled and behave the same across pages | Different sort indicators, different row heights, different hover states |
| Buttons follow a consistent hierarchy (primary/secondary/tertiary) | Primary button style used for cancel on one page |
| Icons mean the same thing everywhere | Gear icon means "settings" on one page, "configure" on another |
| Date formats consistent | "Mar 17, 2026" on one page, "2026-03-17" on another |
| Card layouts follow the same structure | Different card padding, different header treatments across pages |
| Action patterns consistent | "Edit" is inline on one page, modal on another, new page on a third |

### 6. Flow Logic

**Check**: Do multi-step workflows progress logically?

| What to look for | Red flags |
|-------------------|-----------|
| Steps proceed in a logical order | Required data entry comes after the step that needs it |
| User can tell where they are in a process | No progress indicator or step counter |
| Completing a flow returns you somewhere sensible | Creating an item dumps you on the home page instead of the item |
| Destructive actions require confirmation | Delete happens immediately with no undo or confirm |
| Form validation happens at the right time | All errors shown only after submit, not inline |

### 7. Labels & Copy

**Check**: Do words accurately describe what they do?

| What to look for | Red flags |
|-------------------|-----------|
| Button labels describe the action | "Submit" when "Create Project" would be clearer |
| Menu items describe the destination | "More" that opens an unrelated section |
| Error messages explain what went wrong and how to fix it | "Invalid input" with no specifics |
| Tooltip/help text is actually helpful | Tooltip restates the label ("Name: Enter name") |
| Terminology is consistent | "Project" on one page, "Workspace" on another for the same thing |

### 8. Empty & Edge States

**Check**: Does the app handle non-ideal situations gracefully?

| What to look for | Red flags |
|-------------------|-----------|
| Empty lists show helpful guidance | "No data" with no explanation or action |
| First-time user experience makes sense | App assumes existing data on first load |
| Zero-state has a clear call to action | Empty page with no "Create your first X" prompt |
| Long content handled gracefully | Text overflow, missing truncation, broken layouts |
| Many items handled gracefully | No pagination, infinite scroll with no end indicator |

## Capturing Interaction Flows

Some UX issues only appear during transitions. For any suspicious interaction:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    # Step 1: Capture the starting state
    page.goto('http://localhost:5173/expenses')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='flow_step1_expenses_page.png', full_page=True)

    # Step 2: Perform the interaction
    page.click('text=Settings')  # or whatever triggers the transition
    page.wait_for_load_state('networkidle')
    page.screenshot(path='flow_step2_after_settings_click.png', full_page=True)

    # Step 3: Check where we ended up
    print(f"Current URL: {page.url}")
    active_nav = page.evaluate("""() => {
        const active = document.querySelector('[aria-current="page"], .active, [data-active="true"]');
        return active ? active.textContent.trim() : 'none found';
    }""")
    print(f"Active nav item: {active_nav}")

    browser.close()
```

Then read both screenshots to analyze whether the transition makes sense in context.

## Report Format

Add a "UX Coherence" section to the test report:

```markdown
## UX Coherence Review

Reviewed [N] pages via screenshot analysis. App context: [brief description].

### Findings

#### [SEVERITY] [Title]
- **Pages**: [which screenshots show this]
- **Observed**: [what you see]
- **Expected**: [what a user would expect]
- **Impact**: [how this affects the user experience]
- **Recommendation**: [concrete fix]

### Consistency Notes
- [Patterns that are consistent and well-done]
- [Patterns that vary across pages]

### Flow Issues
- [Any navigation or state transition problems found]
```

## Severity Guide for UX Issues

| Severity | Criteria | Example |
|----------|----------|---------|
| **Critical** | User gets lost, stuck, or loses work | Settings click navigates to wrong app with no way back; form data lost on accidental navigation |
| **High** | Confusing but recoverable; user wastes significant time | Active nav doesn't match page; action completes with no feedback |
| **Medium** | Inconsistent but functional; user notices but isn't blocked | Different date formats; inconsistent card layouts; generic empty states |
| **Low** | Polish issue; only noticed by careful observers | Slightly different padding; tooltip restates label; minor copy inconsistency |
