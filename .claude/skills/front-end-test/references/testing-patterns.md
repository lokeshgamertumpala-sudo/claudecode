# React UI Testing Patterns

## Locator Strategy (Priority Order)

Use the most semantically meaningful locator first:

1. **Role + Name** (best — resilient, accessible)
   ```python
   page.get_by_role("button", name="Submit")
   page.get_by_role("link", name="Dashboard")
   page.get_by_role("heading", name="Settings")
   page.get_by_role("textbox", name="Email")
   ```

2. **Label** (great for form fields)
   ```python
   page.get_by_label("Email address")
   page.get_by_label("Password")
   ```

3. **Text** (visible text content)
   ```python
   page.get_by_text("Welcome back")
   page.get_by_text("No results found", exact=True)
   ```

4. **Test ID** (explicit test hooks)
   ```python
   page.get_by_test_id("submit-btn")
   page.get_by_test_id("user-avatar")
   ```

5. **CSS Selector** (last resort)
   ```python
   page.locator(".btn-primary")
   page.locator("#main-content > div:first-child")
   ```

## Wait Strategies

### After Navigation
```python
page.goto(url, wait_until="networkidle")
# OR for SPAs that load data after mount:
page.goto(url)
page.wait_for_load_state("networkidle")
```

### For Specific Elements
```python
page.wait_for_selector(".dashboard-content", state="visible")
page.get_by_role("heading", name="Dashboard").wait_for(state="visible")
```

### After Actions
```python
page.get_by_role("button", name="Save").click()
page.wait_for_url("**/settings/saved")
# OR
page.get_by_text("Settings saved").wait_for(state="visible")
```

### For Network Requests
```python
with page.expect_response("**/api/users") as response_info:
    page.get_by_role("button", name="Load Users").click()
response = response_info.value
assert response.status == 200
```

## Form Testing Patterns

### Fill and Submit
```python
page.get_by_label("Name").fill("John Doe")
page.get_by_label("Email").fill("john@example.com")
page.get_by_role("combobox", name="Country").select_option("US")
page.get_by_label("Terms").check()
page.get_by_role("button", name="Submit").click()
```

### Validation Errors
```python
# Submit empty form
page.get_by_role("button", name="Submit").click()
# Check for error messages
page.get_by_text("Email is required").wait_for(state="visible")
assert page.get_by_label("Email").evaluate("el => el.validity.valid") == False
```

### File Upload
```python
page.get_by_label("Upload file").set_input_files("path/to/file.pdf")
```

## Navigation Testing

### SPA Route Changes
```python
page.get_by_role("link", name="Dashboard").click()
page.wait_for_url("**/dashboard")
assert page.url.endswith("/dashboard")
page.get_by_role("heading", name="Dashboard").wait_for(state="visible")
```

### Back/Forward
```python
page.goto(base_url + "/page-a")
page.get_by_role("link", name="Page B").click()
page.wait_for_url("**/page-b")
page.go_back()
page.wait_for_url("**/page-a")
page.go_forward()
page.wait_for_url("**/page-b")
```

## State Management Testing (Zustand/Redux)

### Read Store State
```python
state = page.evaluate("() => window.__STORE__?.getState()")
# For Zustand with devtools:
state = page.evaluate("() => JSON.parse(JSON.stringify(window.__zustand_store__))")
```

### Trigger State Changes via UI
```python
page.get_by_role("button", name="Add Item").click()
# Verify UI reflects state change
assert page.get_by_test_id("item-count").text_content() == "1"
```

## Error Boundary Testing

### Simulate Errors
```python
# Inject an error via console
page.evaluate("() => { throw new Error('Test error') }")
# Check error boundary rendered
page.get_by_text("Something went wrong").wait_for(state="visible")
```

### Network Error Simulation
```python
# Block API calls
page.route("**/api/**", lambda route: route.abort())
page.reload()
# Check error state renders
page.get_by_text("Unable to load").wait_for(state="visible")
```

## Console Error Capture Pattern

```python
errors = []
page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
page.on("pageerror", lambda err: errors.append(str(err)))

page.goto(url, wait_until="networkidle")
# ... perform actions ...

assert len(errors) == 0, f"Console errors: {errors}"
```

## Screenshot Patterns

### Full Page
```python
page.screenshot(path="screenshot.png", full_page=True)
```

### Specific Element
```python
page.get_by_test_id("chart-widget").screenshot(path="chart.png")
```

### Multiple Viewports
```python
for name, size in [("mobile", (375, 812)), ("tablet", (768, 1024)), ("desktop", (1440, 900))]:
    page.set_viewport_size({"width": size[0], "height": size[1]})
    page.screenshot(path=f"page_{name}.png", full_page=True)
```
