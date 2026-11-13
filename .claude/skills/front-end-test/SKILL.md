---
name: front-end-test
description: Comprehensive front-end UI/UX testing skill. End-to-end functional, visual, accessibility, responsive, and performance testing with module-targeting support.
allowed-tools: Read, Write, Grep, Glob, Bash, Agent
---

# Front-End Test

Comprehensive front-end UI/UX testing with module-targeting support. Covers functional, visual, accessibility, responsive, console error, and performance testing.

**Helper Scripts Available**:
- `scripts/with_server.py` - Server lifecycle management (enhanced with `--env` and `--wait-text`)
- `scripts/discover_app.py` - Crawl running app to discover routes, forms, and interactive elements
- `scripts/test_module.py` - Execute tests against a specific page/module
- `scripts/visual_baseline.py` - Capture screenshots and compare against baselines
- `scripts/a11y_check.py` - WCAG 2.1 AA accessibility audit

**Always run scripts with `--help` first** to see usage. DO NOT read script source until you've tried running the script and found that customization is absolutely necessary.

## CRITICAL: Server Requirements

**Before running any tests, verify that ALL required servers are running.** Most SaaS apps have both a frontend dev server AND a backend API server. Testing with only the frontend running will produce false failures on every API-dependent page.

**Pre-flight checklist:**
1. **Identify the architecture** — Check `package.json`, `docker-compose.yml`, or project docs for what services are needed (e.g., Vite + FastAPI, Next.js + Express)
2. **Start ALL servers** — Use `with_server.py` with multiple `--server`/`--port` pairs, or verify each is already running
3. **Verify API connectivity** — Before the full sweep, test one API-dependent page and confirm data loads (not just the shell/layout)

```bash
# Example: Full-stack app with Vite frontend + FastAPI backend
python scripts/with_server.py \
  --server "cd backend && python -m uvicorn main:app --port 8000" --port 8000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python scripts/test_module.py --url http://localhost:5173/dashboard --checks functional --output /tmp/preflight/
```

**If the backend is not running:** Flag all API-dependent failures as "EXPECTED FAIL — backend not running" in the report and explicitly ask the user if they want to start the backend before continuing with the full sweep. Do NOT silently run a full sweep knowing half the pages will fail due to missing API.

## Quick Start

```bash
# Full E2E sweep of a running app
python scripts/discover_app.py --url http://localhost:5173 --output /tmp/app_map.json
python scripts/test_module.py --url http://localhost:5173 --checks all --output /tmp/results/

# Test a specific module
python scripts/test_module.py --url http://localhost:5173/dashboard --checks functional,a11y --output /tmp/results/

# Visual regression
python scripts/visual_baseline.py capture --url http://localhost:5173 --pages /,/dashboard --output ./baselines/
python scripts/visual_baseline.py compare --baseline ./baselines/ --current ./current/ --output ./diff/

# Accessibility audit
python scripts/a11y_check.py --url http://localhost:5173/dashboard --output /tmp/a11y_report.json

# With server management
python scripts/with_server.py --server "npm run dev" --port 5173 -- python scripts/discover_app.py --url http://localhost:5173 --output /tmp/app_map.json
```

## Decision Tree

```
User request → What scope?
│
├─ ALWAYS FIRST: Are all required servers running?
│   ├─ Check: Is the frontend dev server running? (try curl localhost:<port>)
│   ├─ Check: Is the backend API server running? (try curl localhost:<api_port>/health or /docs)
│   ├─ If missing → Start with with_server.py or ask user
│   └─ If backend missing → STOP. Ask user before running full sweep with known API gaps.
│
├─ "Test everything" / "Full E2E sweep"
│   1. Verify ALL servers running (frontend + backend + any other services)
│   2. Discover app structure with scripts/discover_app.py
│   3. For each discovered route: run scripts/test_module.py --checks all
│   4. Generate consolidated report
│
├─ "Test [specific page/module]"
│   1. Verify required servers running
│   2. Run scripts/test_module.py --url <module_url> --checks all
│   3. Report results for that module
│
├─ "Visual regression" / "Screenshot comparison"
│   1. Capture baselines with scripts/visual_baseline.py capture
│   2. (After changes) Capture current with same script
│   3. Compare with scripts/visual_baseline.py compare
│   4. Report pixel diff percentages
│
├─ "Accessibility audit"
│   1. Run scripts/a11y_check.py on target page(s)
│   2. Report WCAG 2.1 AA compliance
│
└─ "Check for console errors" / "Performance check"
    1. Run scripts/test_module.py --checks console or --checks performance
    2. Report findings
```

## Test Phases

### Phase 1: Discovery
Crawl the running app to build a map of routes, pages, forms, and interactive elements.
```bash
python scripts/discover_app.py --url http://localhost:5173 --depth 3 --output /tmp/app_map.json
```
Read the output JSON to understand the app structure before planning tests.

### Phase 2: Planning
Based on discovery results, prioritize testing:
1. **High risk**: Pages with forms, authentication, payment flows, CRUD operations
2. **Medium risk**: Navigation, dashboards, data display pages
3. **Low risk**: Static pages, about pages, documentation

Generate a test plan listing which pages to test and which check categories to run.

### Phase 3: Execution
Run tests by category per page. Use `--checks` flag to scope:
```bash
# All checks on a critical page
python scripts/test_module.py --url http://localhost:5173/dashboard --checks all --output /tmp/results/

# Specific checks
python scripts/test_module.py --url http://localhost:5173/settings --checks functional,a11y --output /tmp/results/
```

### Phase 4: UX Coherence Review (Vision-Based)

**This phase uses Claude's vision capabilities — it is NOT automated by scripts.**

After the automated checks complete and screenshots exist for every page, perform a contextual UX review by reading all screenshots and analyzing them as a whole. This catches issues that no automated check can find — things that "work" but don't "make sense."

**How to execute this phase:**
1. Read ALL screenshots from the test output directory using the Read tool (which renders images visually)
2. Also read the app discovery JSON to understand the app's structure, navigation, and purpose
3. If the app's purpose or target users are unclear, ask the user before proceeding
4. Analyze the screenshots as a set — look for cross-page consistency, navigation logic, information hierarchy, and UX coherence
5. For suspicious interactions (e.g., a settings button that navigates somewhere unexpected), write a small Playwright script or use MCP to click through the flow and capture the state transition screenshots
6. Report findings in the "UX Coherence" section of the report

**What to look for** (see `references/ux-coherence-guide.md` for full framework):

- **Navigation logic**: Does clicking X take you where a user would expect? Does the sidebar/nav reflect the current context? Do back/forward behave sensibly?
- **Context preservation**: When switching between views, does the app maintain appropriate context? Does a settings page keep you in the current app context or unexpectedly switch?
- **Information hierarchy**: Does the page layout communicate the right priorities? Is the most important content prominent? Are secondary actions clearly secondary?
- **State consistency**: Does the UI accurately reflect the current state? Active nav items match the page content? Breadcrumbs correct?
- **Empty/loading states**: Do they make sense for the feature? Generic "no data" vs. helpful guidance?
- **Flow logic**: Do multi-step workflows progress logically? Can you tell where you are in a process?
- **Labeling & copy**: Do button labels, headings, and descriptions accurately describe what they do? Misleading labels?
- **Cross-page patterns**: Are similar features handled consistently across pages? Same action, different behavior in different places?

**Interaction flow captures**: For issues that only appear during navigation (like the settings gear switching sidebar context), capture sequential screenshots:
```python
# Example: Capture a state transition
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173/expenses')
    page.screenshot(path='flow_1_before.png')  # State before click
    page.click('[data-testid="settings-gear"]')  # Trigger the interaction
    page.wait_for_load_state('networkidle')
    page.screenshot(path='flow_2_after.png')    # State after click
    browser.close()
```
Then read both screenshots to analyze whether the transition makes sense.

### Phase 5: Reporting
After all tests complete (including UX coherence review), consolidate results into a structured markdown report. See `references/report-template.md` for the expected format.

## Test Categories

### 1. Functional Testing
- **Navigation**: All links work, SPA routing correct, back/forward behavior
- **Forms**: Input validation, submit behavior, error messages, success states
- **CRUD**: Create/Read/Update/Delete operations complete successfully
- **Error States**: 404 pages, network errors, empty states render correctly
- **Edge Cases**: Empty inputs, very long text, special characters, rapid clicks

### 2. Visual Testing
- **Screenshot Baselines**: Capture reference screenshots for each page
- **Layout Verification**: Elements positioned correctly, no overlap
- **Design Consistency**: Colors, fonts, spacing match across pages
- **Responsive Layouts**: Layout adapts correctly at each breakpoint

### 3. Accessibility Testing (WCAG 2.1 AA)
- **Heading Hierarchy**: Proper h1-h6 nesting, no skipped levels
- **ARIA Attributes**: Roles, labels, and states used correctly
- **Form Labels**: All inputs have associated labels
- **Focus Management**: Visible focus indicators, logical tab order
- **Keyboard Navigation**: All interactive elements reachable via keyboard
- **Color Contrast**: Text meets 4.5:1 ratio (3:1 for large text)
- **Image Alt Text**: All images have descriptive alt attributes
- **Landmark Roles**: Main, nav, header, footer landmarks present

### 4. Responsive Testing
Three viewport breakpoints:
- **Mobile**: 375x812 (iPhone SE/13 mini)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1440x900 (standard desktop)

Check at each viewport: layout correctness, no horizontal scroll, touch target sizes, text readability.

### 5. Console Error Testing
- **Runtime JS Errors**: Uncaught exceptions, TypeError, ReferenceError
- **Unhandled Promise Rejections**: Async errors not caught
- **React Warnings**: PropTypes, key warnings, deprecated lifecycle methods
- **Network Errors**: Failed API calls, 4xx/5xx responses
- **Deprecation Warnings**: Browser or library deprecations

### 6. Performance Testing
- **Page Load Time**: Time to DOMContentLoaded and load events
- **Largest Contentful Paint (LCP)**: Target < 2.5s
- **Interaction Responsiveness**: Click-to-response latency
- **Resource Count**: Number and size of JS/CSS/image assets
- **Memory Usage**: Check for obvious leaks during navigation

### 7. UX Coherence (Vision-Based — NOT automated)
This category is unique: it uses Claude's vision to analyze screenshots contextually, not automated scripts.
- **Navigation logic**: Clicks lead where users expect, sidebar reflects current context
- **Context preservation**: Switching views maintains appropriate state/context
- **Information hierarchy**: Page layout communicates correct priorities
- **State consistency**: Active nav items, breadcrumbs, headers match actual page
- **Cross-page consistency**: Same patterns used for same concepts across pages
- **Flow logic**: Multi-step workflows progress logically
- **Empty states**: Helpful guidance vs. generic "no data"
- **Labels & copy**: Buttons, headings, descriptions accurately describe their function

See `references/ux-coherence-guide.md` for the full analysis framework.

## Module Targeting

Users specify modules by URL path or page name:
- `/front-end-test /dashboard` → tests `http://localhost:<port>/dashboard`
- `/front-end-test /dashboard /settings /profile` → tests those three pages
- `/front-end-test all` → full discovery + test all discovered routes

When the user specifies a module:
1. Resolve the full URL using the running server's base URL
2. Run `test_module.py` with all check categories by default
3. If the user specifies categories, use only those

## Authentication & Authorization

### CRITICAL: Test User Selection

**Before running tests, understand the app's permission model and choose the right test user.**

Many SaaS apps have role-based access control (RBAC). A test user without the right permissions will produce false failures — 403 errors and "No access" messages that look like bugs but are actually correct authorization enforcement.

**Pre-test authorization checklist:**
1. **Map the permission model** — What roles/permissions exist? What routes require which permissions? Look for RBAC config, middleware, route guards, or ask the user.
2. **Choose a full-access test user for the main sweep** — Use an admin or user with access to ALL app modules. This tests the "happy path" — does everything work when you have permission?
3. **Ask the user** which test credentials to use if unclear. Do NOT guess or use the first credentials you find — a restricted user will waste an entire test run on expected 403s.
4. **Note which user is being used** in the test report header, including their role/permissions.

### Two-Phase Authorization Testing

Testing authorization properly requires TWO separate test passes with DIFFERENT users:

#### Phase A: Full-Access Sweep (Primary)
Log in as a user with access to ALL modules/features. This is the main test run — functional, visual, a11y, responsive, performance checks all happen here.
- **Goal**: Verify everything works when authorized
- **User**: Admin or user with maximum permissions
- **If pages fail here**: These are REAL bugs

#### Phase B: Restricted-Access Verification (Security)
Log in as a user who should NOT have access to certain modules. Attempt to navigate to restricted routes.
- **Goal**: Verify authorization is enforced — restricted users cannot access protected pages
- **User**: A user with limited permissions (e.g., no Analytics access)
- **Expected behavior**: Redirected away, shown access denied, or route not visible in navigation
- **What to check for each restricted route**:
  - Does the route redirect to a safe page (login, dashboard, 403 page)?
  - OR does it show a clear "access denied" message?
  - Does the navigation/sidebar hide links to restricted modules?
  - Can the user still reach the page by typing the URL directly? (should be blocked)
  - Are API calls returning 403 (not 200 with empty data, which leaks that the endpoint exists)?

**Report authorization results separately** — don't mix them into the main functional results. Use this format:

```markdown
## Authorization Enforcement

Test user: restricted-user@example.com (role: basic, no Analytics access)

| Restricted Route        | Direct URL Access | Behavior           | Status |
|------------------------|-------------------|--------------------|--------|
| /analytics             | Blocked           | Redirected to /dashboard | PASS |
| /analytics/leaderboard | Blocked           | Shows "No access"  | PASS   |
| /admin/settings        | Blocked           | 403 page           | PASS   |
| /analytics/insights    | NOT blocked       | Page loads with empty data | FAIL |
```

### Auth Patterns

Three patterns for logging in during tests:

#### Pattern 1: Environment Bypass (Recommended for Dev)
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 \
  --env VITE_DEV_AUTH_BYPASS=true -- python scripts/test_module.py ...
```
Check if the project has an auth bypass mechanism (e.g., `VITE_DEV_AUTH_BYPASS` env var).

#### Pattern 2: Mock Auth Helper
Write a small helper that sets auth tokens in localStorage/cookies before tests:
```python
page.evaluate("localStorage.setItem('auth_token', 'test-token-123')")
page.reload()
```

#### Pattern 3: Real Auth Flow
Use Playwright to fill login form with test credentials:
```python
page.goto('http://localhost:5173/login')
page.fill('[name="email"]', 'test@example.com')
page.fill('[name="password"]', 'testpassword')
page.click('button[type="submit"]')
page.wait_for_url('**/dashboard')
```

Detect which pattern the project uses by checking for auth-related env vars, middleware, or login pages.

### Interpreting 403s and "No Access" Responses

**403 errors during a test run are NOT automatically bugs.** Before flagging a 403 as a failure:
1. Check if the test user has permission for that route
2. If they don't → the 403 is CORRECT behavior, not a failure
3. If they do → the 403 is a REAL bug, flag it

**Console errors from 403 responses on restricted routes are also expected** — do not flag `Failed to load resource: 403 (Forbidden)` as a console error when the user lacks permission. The frontend should handle 403s gracefully (show an error card, redirect, or hide the content).

## Playwright MCP Integration

If the Playwright MCP server is configured in the user's Claude Code setup, prefer using MCP tools for interactive testing:
1. Check if `browser_navigate`, `browser_click`, `browser_screenshot` tools are available
2. If yes, use MCP for interactive exploration and targeted checks
3. If no, fall back to the Python scripts in `scripts/`

MCP is better for: exploratory testing, interactive debugging, quick visual checks.
Scripts are better for: automated sweeps, batch testing, CI/CD integration, structured reports.

## Report Format

All test results should be consolidated into a structured markdown report. See `references/report-template.md` for the full template.

Summary format:
```
## Test Summary
| Category     | Pass | Fail | Warn | Skip | Total |
|-------------|------|------|------|------|-------|
| Functional  |   12 |    1 |    2 |    0 |    15 |
| Visual      |    8 |    0 |    1 |    0 |     9 |
| A11y        |   15 |    3 |    2 |    0 |    20 |
| Responsive  |    9 |    0 |    0 |    0 |     9 |
| Console     |    5 |    2 |    0 |    0 |     7 |
| Performance |    4 |    0 |    1 |    0 |     5 |
```

Severity classification:
- **Critical**: App crashes, data loss, security issues
- **High**: Major functionality broken, accessibility barriers
- **Medium**: Minor functionality issues, visual inconsistencies
- **Low**: Cosmetic issues, non-blocking warnings
- **Info**: Suggestions and best practice recommendations

## Best Practices

### Locator Strategy (Priority Order)
1. `page.get_by_role("button", name="Submit")` - Role + accessible name
2. `page.get_by_label("Email")` - Form labels
3. `page.get_by_text("Welcome")` - Visible text
4. `page.get_by_test_id("submit-btn")` - data-testid attributes
5. `page.locator("css=.btn-primary")` - CSS selectors (last resort)

### Wait Strategies
- `page.wait_for_load_state('networkidle')` - After navigation
- `page.wait_for_selector('.content')` - For specific elements
- `page.wait_for_url('**/dashboard')` - After auth/redirect
- Avoid `page.wait_for_timeout()` except as last resort

### Screenshot Conventions
- Save to project's `test-results/` directory
- Name format: `{page_name}_{viewport}_{timestamp}.png`
- Full page screenshots for layout verification
- Element screenshots for component-level checks

## Reference Files

- **references/testing-patterns.md** - Common React UI test patterns and locator strategies
- **references/accessibility-checklist.md** - WCAG 2.1 AA checklist for web apps
- **references/visual-testing-guide.md** - Visual regression methodology
- **references/ux-coherence-guide.md** - UX coherence analysis framework (vision-based review)
- **references/report-template.md** - Test report format specification
- **examples/** - Working code examples:
  - `full_e2e_sweep.py` - Complete app E2E test workflow
  - `targeted_module_test.py` - Module-specific testing
  - `visual_regression.py` - Screenshot comparison workflow
