# Visual Regression Testing Guide

## Overview

Visual regression testing catches unintended UI changes by comparing screenshots against approved baselines. This guide covers methodology, threshold tuning, and handling common edge cases.

## Baseline Management

### Directory Structure
```
test-results/visual/
├── baselines/          # Approved reference screenshots
│   ├── manifest.json   # Metadata about each baseline
│   ├── root_desktop.png
│   ├── root_mobile.png
│   ├── dashboard_desktop.png
│   └── ...
├── current/            # Latest capture
└── diff/               # Comparison results
    ├── visual_diff_report.json
    ├── diff_root_desktop.png
    └── ...
```

### Workflow
1. **Initial capture**: Run `visual_baseline.py capture` to create baselines
2. **Make changes**: Modify the UI code
3. **Capture current**: Run `visual_baseline.py capture` with `--output ./current/`
4. **Compare**: Run `visual_baseline.py compare` to generate diff report
5. **Review**: Inspect diff images and percentages
6. **Update baselines**: If changes are intentional, replace baselines with current

## Threshold Tuning

The `--threshold` parameter (default 0.1%) controls sensitivity:

| Threshold | Use Case |
|-----------|----------|
| 0.0%      | Pixel-perfect matching (unreliable due to font rendering) |
| 0.05%     | Very strict — catches subtle color/spacing changes |
| 0.1%      | Standard — good balance for most UI testing |
| 0.5%      | Lenient — catches major layout shifts only |
| 1.0%      | Very lenient — only catches gross layout breakage |

**Recommendation**: Start at 0.1% and increase if you get false positives from:
- Anti-aliasing differences across renders
- Subpixel font rendering variations
- Animation timing differences

## Handling Dynamic Content

Dynamic elements cause false positives. Strategies:

### Hide Dynamic Elements Before Capture
```python
# Hide timestamps, avatars, animations
page.evaluate("""() => {
    document.querySelectorAll('.timestamp, .avatar, .animated').forEach(el => {
        el.style.visibility = 'hidden';
    });
}""")
page.screenshot(path="page.png", full_page=True)
```

### Mask Specific Regions
After capturing, use Pillow to mask known dynamic areas:
```python
from PIL import Image, ImageDraw
img = Image.open("screenshot.png")
draw = ImageDraw.Draw(img)
draw.rectangle([x1, y1, x2, y2], fill="magenta")  # Mask region
img.save("screenshot_masked.png")
```

### Freeze Animations
```python
page.evaluate("""() => {
    const style = document.createElement('style');
    style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
    document.head.appendChild(style);
}""")
```

### Mock Date/Time
```python
page.evaluate("""() => {
    const fixedDate = new Date('2024-01-01T12:00:00');
    Date.now = () => fixedDate.getTime();
}""")
```

## Multi-Viewport Strategy

Always capture at three breakpoints to catch responsive regressions:

| Viewport | Size | Device |
|----------|------|--------|
| Mobile   | 375x812 | iPhone SE / 13 mini |
| Tablet   | 768x1024 | iPad |
| Desktop  | 1440x900 | Standard laptop |

For critical pages, also consider:
- **Wide desktop**: 1920x1080
- **Small mobile**: 320x568 (iPhone SE 1st gen)

## Reading Diff Reports

The comparison output includes:
- **diff_percentage**: Percentage of pixels that changed beyond tolerance
- **status**: pass (within threshold), fail (exceeds threshold), missing, new
- **Diff images**: Amplified difference images highlighting changed areas

### Interpreting Diff Images
- **Black areas**: No change
- **Colored areas**: Changed pixels (brighter = larger difference)
- Focus on structural changes (layout shifts) vs. rendering artifacts

## CI/CD Integration

For automated visual testing in CI:

```bash
# 1. Baselines committed to repo (or fetched from artifact storage)
# 2. Capture current state
python scripts/visual_baseline.py capture --url $APP_URL --pages /,/dashboard --output ./current/
# 3. Compare
python scripts/visual_baseline.py compare --baseline ./baselines/ --current ./current/ --output ./diff/ --threshold 0.1
# 4. Exit code 1 on failure — CI will fail the build
```

Store baselines in the repo under `test-results/visual/baselines/` or in an artifact store for large projects.
