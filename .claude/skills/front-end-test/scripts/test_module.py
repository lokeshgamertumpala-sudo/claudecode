#!/usr/bin/env python3
"""
Execute configurable test checks against a specific page or module.

Usage:
    # All checks on a page
    python scripts/test_module.py --url http://localhost:5173/dashboard --checks all --output /tmp/results/

    # Specific checks
    python scripts/test_module.py --url http://localhost:5173/settings --checks functional,a11y,console --output /tmp/results/

    # With custom viewports
    python scripts/test_module.py --url http://localhost:5173 --checks responsive --output /tmp/results/

Check categories: functional, visual, a11y, responsive, console, performance, all
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

VIEWPORTS = {
    "mobile": {"width": 375, "height": 812},
    "tablet": {"width": 768, "height": 1024},
    "desktop": {"width": 1440, "height": 900},
}

ALL_CHECKS = ["functional", "visual", "a11y", "responsive", "console", "performance"]


def make_page_name(url):
    """Convert URL to a safe filename component."""
    path = urlparse(url).path.strip("/")
    return path.replace("/", "_") if path else "root"


def check_functional(page, url, output_dir):
    """Run functional checks on the page."""
    results = []

    # Check page loads successfully
    try:
        response = page.goto(url, wait_until="networkidle", timeout=15000)
        status = response.status if response else None
        results.append({
            "check": "page_loads",
            "status": "pass" if status and status < 400 else "fail",
            "detail": f"HTTP {status}" if status else "No response",
            "severity": "critical" if not status or status >= 500 else "high"
        })
    except Exception as e:
        results.append({
            "check": "page_loads",
            "status": "fail",
            "detail": str(e),
            "severity": "critical"
        })
        return results

    page.wait_for_load_state("networkidle")

    # Check for broken links on the page
    links = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href]'))
            .filter(a => a.hostname === window.location.hostname)
            .map(a => ({ href: a.href, text: a.textContent.trim().substring(0, 50) }));
    }""")
    results.append({
        "check": "internal_links_found",
        "status": "pass" if links else "warn",
        "detail": f"{len(links)} internal links found",
        "severity": "low"
    })

    # Check for forms
    forms = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('form')).map(f => ({
            id: f.id || null,
            fieldCount: f.querySelectorAll('input, select, textarea').length,
            hasSubmit: !!f.querySelector('button[type="submit"], input[type="submit"]')
        }));
    }""")
    for i, form in enumerate(forms):
        results.append({
            "check": f"form_{i}_has_submit",
            "status": "pass" if form["hasSubmit"] else "warn",
            "detail": f"Form '{form['id'] or f'#{i}'}': {form['fieldCount']} fields, submit={'yes' if form['hasSubmit'] else 'no'}",
            "severity": "medium"
        })

    # Check for error boundary / error display elements
    error_elements = page.evaluate("""() => {
        const selectors = ['.error', '.error-boundary', '[role="alert"]', '.alert-danger', '.toast-error'];
        let found = [];
        for (const sel of selectors) {
            const els = document.querySelectorAll(sel);
            els.forEach(el => {
                if (el.textContent.trim()) {
                    found.push({ selector: sel, text: el.textContent.trim().substring(0, 100) });
                }
            });
        }
        return found;
    }""")
    if error_elements:
        for err in error_elements:
            results.append({
                "check": "visible_error_element",
                "status": "warn",
                "detail": f"Error element found ({err['selector']}): {err['text']}",
                "severity": "medium"
            })
    else:
        results.append({
            "check": "no_visible_errors",
            "status": "pass",
            "detail": "No error elements visible on page load",
            "severity": "info"
        })

    # Check page has meaningful content
    body_text = page.evaluate("() => document.body?.innerText?.trim()?.length || 0")
    results.append({
        "check": "has_content",
        "status": "pass" if body_text > 50 else "warn",
        "detail": f"Page body text length: {body_text} chars",
        "severity": "medium" if body_text <= 50 else "info"
    })

    return results


def check_visual(page, url, output_dir):
    """Capture screenshots for visual inspection."""
    results = []
    page_name = make_page_name(url)

    page.goto(url, wait_until="networkidle", timeout=15000)
    page.wait_for_load_state("networkidle")

    # Full page screenshot at desktop viewport
    page.set_viewport_size(VIEWPORTS["desktop"])
    time.sleep(0.5)
    screenshot_path = os.path.join(output_dir, f"{page_name}_desktop_full.png")
    page.screenshot(path=screenshot_path, full_page=True)
    results.append({
        "check": "screenshot_desktop",
        "status": "pass",
        "detail": f"Screenshot saved: {screenshot_path}",
        "severity": "info"
    })

    # Check for layout overflow
    has_overflow = page.evaluate("""() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    }""")
    results.append({
        "check": "no_horizontal_overflow",
        "status": "fail" if has_overflow else "pass",
        "detail": "Horizontal overflow detected" if has_overflow else "No horizontal overflow",
        "severity": "medium"
    })

    # Check for overlapping elements (basic)
    overlap_check = page.evaluate("""() => {
        const elements = document.querySelectorAll('button, a, input, [role="button"]');
        let overlaps = 0;
        const rects = Array.from(elements).map(el => el.getBoundingClientRect());
        for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
                const a = rects[i], b = rects[j];
                if (a.width === 0 || a.height === 0 || b.width === 0 || b.height === 0) continue;
                if (!(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)) {
                    overlaps++;
                }
            }
        }
        return overlaps;
    }""")
    results.append({
        "check": "no_element_overlaps",
        "status": "pass" if overlap_check == 0 else "warn",
        "detail": f"{overlap_check} potential element overlaps detected",
        "severity": "medium" if overlap_check > 0 else "info"
    })

    return results


def check_a11y(page, url, output_dir):
    """Run accessibility checks."""
    results = []

    page.goto(url, wait_until="networkidle", timeout=15000)
    page.wait_for_load_state("networkidle")

    # Heading hierarchy
    headings = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            level: parseInt(h.tagName.substring(1)),
            text: h.textContent.trim().substring(0, 100)
        }));
    }""")

    h1_count = sum(1 for h in headings if h["level"] == 1)
    results.append({
        "check": "single_h1",
        "status": "pass" if h1_count == 1 else "warn" if h1_count == 0 else "fail",
        "detail": f"Found {h1_count} h1 elements",
        "severity": "medium"
    })

    # Check heading skip levels
    levels = [h["level"] for h in headings]
    skipped = False
    for i in range(1, len(levels)):
        if levels[i] > levels[i - 1] + 1:
            skipped = True
            break
    results.append({
        "check": "heading_hierarchy",
        "status": "fail" if skipped else "pass",
        "detail": f"Heading levels: {levels}" + (" (skipped levels)" if skipped else ""),
        "severity": "medium"
    })

    # Form labels
    unlabeled = page.evaluate("""() => {
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
        let unlabeled = [];
        inputs.forEach(input => {
            const hasLabel = input.labels?.length > 0;
            const hasAria = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
            const hasTitle = input.getAttribute('title');
            const hasPlaceholder = input.getAttribute('placeholder');
            if (!hasLabel && !hasAria && !hasTitle) {
                unlabeled.push({
                    tag: input.tagName.toLowerCase(),
                    type: input.type || null,
                    name: input.name || input.id || '(unnamed)',
                    hasPlaceholder: !!hasPlaceholder
                });
            }
        });
        return unlabeled;
    }""")
    results.append({
        "check": "form_labels",
        "status": "fail" if unlabeled else "pass",
        "detail": f"{len(unlabeled)} inputs without labels" + (f": {json.dumps(unlabeled[:3])}" if unlabeled else ""),
        "severity": "high" if unlabeled else "info"
    })

    # Image alt text
    images_without_alt = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('img'))
            .filter(img => !img.hasAttribute('alt'))
            .map(img => img.src.substring(0, 100));
    }""")
    results.append({
        "check": "image_alt_text",
        "status": "fail" if images_without_alt else "pass",
        "detail": f"{len(images_without_alt)} images without alt text",
        "severity": "high" if images_without_alt else "info"
    })

    # ARIA roles
    aria_issues = page.evaluate("""() => {
        let issues = [];
        // Check for buttons without accessible names
        document.querySelectorAll('button, [role="button"]').forEach(btn => {
            const name = btn.textContent.trim() || btn.getAttribute('aria-label') || btn.getAttribute('title');
            if (!name) issues.push({ element: 'button', issue: 'no accessible name', id: btn.id || null });
        });
        // Check for links without text
        document.querySelectorAll('a[href]').forEach(a => {
            const name = a.textContent.trim() || a.getAttribute('aria-label') || a.getAttribute('title');
            if (!name) issues.push({ element: 'link', issue: 'no accessible name', href: a.href.substring(0, 50) });
        });
        return issues;
    }""")
    results.append({
        "check": "aria_accessible_names",
        "status": "fail" if aria_issues else "pass",
        "detail": f"{len(aria_issues)} elements without accessible names" + (f": {json.dumps(aria_issues[:3])}" if aria_issues else ""),
        "severity": "high" if aria_issues else "info"
    })

    # Landmark roles
    landmarks = page.evaluate("""() => {
        return {
            main: !!document.querySelector('main, [role="main"]'),
            nav: !!document.querySelector('nav, [role="navigation"]'),
            header: !!document.querySelector('header, [role="banner"]'),
            footer: !!document.querySelector('footer, [role="contentinfo"]')
        };
    }""")
    missing = [k for k, v in landmarks.items() if not v]
    results.append({
        "check": "landmark_roles",
        "status": "pass" if not missing else "warn",
        "detail": f"Missing landmarks: {missing}" if missing else "All key landmarks present",
        "severity": "medium" if missing else "info"
    })

    # Focus indicators (basic check)
    focus_issues = page.evaluate("""() => {
        const interactive = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
        let noOutline = 0;
        interactive.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.outlineStyle === 'none' && style.outlineWidth === '0px') {
                // Check if there's a :focus style (can't fully check this from JS)
                noOutline++;
            }
        });
        return { total: interactive.length, potentiallyNoFocus: noOutline };
    }""")
    results.append({
        "check": "focus_indicators",
        "status": "warn" if focus_issues["potentiallyNoFocus"] > 0 else "pass",
        "detail": f"{focus_issues['potentiallyNoFocus']}/{focus_issues['total']} interactive elements may lack focus indicators (check manually)",
        "severity": "medium"
    })

    # Keyboard tab order
    tab_order = page.evaluate("""() => {
        const tabbable = document.querySelectorAll('[tabindex]');
        let negativeTabindex = 0;
        let highTabindex = 0;
        tabbable.forEach(el => {
            const ti = parseInt(el.getAttribute('tabindex'));
            if (ti < 0) negativeTabindex++;
            if (ti > 0) highTabindex++;
        });
        return { negativeTabindex, highTabindex, total: tabbable.length };
    }""")
    results.append({
        "check": "tab_order",
        "status": "warn" if tab_order["highTabindex"] > 0 else "pass",
        "detail": f"Positive tabindex: {tab_order['highTabindex']}, negative: {tab_order['negativeTabindex']} (positive tabindex disrupts natural order)",
        "severity": "medium" if tab_order["highTabindex"] > 0 else "info"
    })

    return results


def check_responsive(page, url, output_dir):
    """Check responsiveness at multiple viewports."""
    results = []
    page_name = make_page_name(url)

    for vp_name, vp_size in VIEWPORTS.items():
        page.set_viewport_size(vp_size)
        page.goto(url, wait_until="networkidle", timeout=15000)
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)

        # Screenshot
        screenshot_path = os.path.join(output_dir, f"{page_name}_{vp_name}.png")
        page.screenshot(path=screenshot_path, full_page=True)

        # Check horizontal overflow
        has_overflow = page.evaluate("""() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        }""")
        results.append({
            "check": f"no_overflow_{vp_name}",
            "status": "fail" if has_overflow else "pass",
            "detail": f"{vp_name} ({vp_size['width']}x{vp_size['height']}): {'horizontal overflow detected' if has_overflow else 'no overflow'}",
            "severity": "medium" if has_overflow else "info"
        })

        # Check touch target sizes on mobile
        if vp_name == "mobile":
            small_targets = page.evaluate("""() => {
                const interactive = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
                let small = 0;
                interactive.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
                        small++;
                    }
                });
                return { small, total: interactive.length };
            }""")
            results.append({
                "check": "touch_target_size_mobile",
                "status": "warn" if small_targets["small"] > 0 else "pass",
                "detail": f"{small_targets['small']}/{small_targets['total']} interactive elements smaller than 44x44px",
                "severity": "medium" if small_targets["small"] > 0 else "info"
            })

        # Check text is readable (font size >= 12px on mobile)
        if vp_name == "mobile":
            small_text = page.evaluate("""() => {
                const textElements = document.querySelectorAll('p, span, li, td, th, label, a');
                let tooSmall = 0;
                textElements.forEach(el => {
                    const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
                    if (fontSize < 12 && el.textContent.trim().length > 0) tooSmall++;
                });
                return tooSmall;
            }""")
            results.append({
                "check": "text_readability_mobile",
                "status": "warn" if small_text > 0 else "pass",
                "detail": f"{small_text} text elements with font-size < 12px on mobile",
                "severity": "low" if small_text > 0 else "info"
            })

        results.append({
            "check": f"screenshot_{vp_name}",
            "status": "pass",
            "detail": f"Screenshot saved: {screenshot_path}",
            "severity": "info"
        })

    return results


def check_console(page, url, output_dir):
    """Capture console errors and warnings."""
    results = []
    console_messages = []
    page_errors = []

    page.on("console", lambda msg: console_messages.append({
        "type": msg.type,
        "text": msg.text,
        "location": str(msg.location) if hasattr(msg, 'location') else None
    }))
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    page.goto(url, wait_until="networkidle", timeout=15000)
    page.wait_for_load_state("networkidle")
    time.sleep(1)  # Wait for any delayed console messages

    # Categorize console messages
    errors = [m for m in console_messages if m["type"] == "error"]
    warnings = [m for m in console_messages if m["type"] == "warning"]

    results.append({
        "check": "no_console_errors",
        "status": "fail" if errors else "pass",
        "detail": f"{len(errors)} console errors" + (f": {json.dumps([e['text'][:100] for e in errors[:5]])}" if errors else ""),
        "severity": "high" if errors else "info"
    })

    results.append({
        "check": "no_console_warnings",
        "status": "warn" if warnings else "pass",
        "detail": f"{len(warnings)} console warnings" + (f": {json.dumps([w['text'][:100] for w in warnings[:5]])}" if warnings else ""),
        "severity": "low" if warnings else "info"
    })

    results.append({
        "check": "no_page_errors",
        "status": "fail" if page_errors else "pass",
        "detail": f"{len(page_errors)} unhandled page errors" + (f": {json.dumps([e[:100] for e in page_errors[:3]])}" if page_errors else ""),
        "severity": "critical" if page_errors else "info"
    })

    # Save full console log
    console_log_path = os.path.join(output_dir, f"{make_page_name(url)}_console.json")
    with open(console_log_path, 'w', encoding='utf-8') as f:
        json.dump({
            "messages": console_messages,
            "page_errors": page_errors
        }, f, indent=2, ensure_ascii=False)

    results.append({
        "check": "console_log_saved",
        "status": "pass",
        "detail": f"Full console log saved: {console_log_path}",
        "severity": "info"
    })

    return results


def check_performance(page, url, output_dir):
    """Basic performance checks."""
    results = []

    start_time = time.time()
    page.goto(url, wait_until="networkidle", timeout=30000)
    load_time = time.time() - start_time

    results.append({
        "check": "page_load_time",
        "status": "pass" if load_time < 3 else "warn" if load_time < 5 else "fail",
        "detail": f"Page loaded in {load_time:.2f}s",
        "severity": "high" if load_time >= 5 else "medium" if load_time >= 3 else "info"
    })

    # Performance timing metrics
    perf_timing = page.evaluate("""() => {
        const perf = performance.getEntriesByType('navigation')[0];
        if (!perf) return null;
        return {
            domContentLoaded: perf.domContentLoadedEventEnd - perf.startTime,
            loadComplete: perf.loadEventEnd - perf.startTime,
            domInteractive: perf.domInteractive - perf.startTime,
            responseTime: perf.responseEnd - perf.requestStart,
            transferSize: perf.transferSize
        };
    }""")

    if perf_timing:
        results.append({
            "check": "dom_content_loaded",
            "status": "pass" if perf_timing["domContentLoaded"] < 2000 else "warn",
            "detail": f"DOMContentLoaded: {perf_timing['domContentLoaded']:.0f}ms",
            "severity": "medium" if perf_timing["domContentLoaded"] >= 2000 else "info"
        })
        results.append({
            "check": "dom_interactive",
            "status": "pass" if perf_timing["domInteractive"] < 1500 else "warn",
            "detail": f"DOM Interactive: {perf_timing['domInteractive']:.0f}ms",
            "severity": "medium" if perf_timing["domInteractive"] >= 1500 else "info"
        })

    # Resource count and sizes
    resources = page.evaluate("""() => {
        const entries = performance.getEntriesByType('resource');
        let summary = { js: 0, css: 0, img: 0, other: 0, totalSize: 0, count: entries.length };
        entries.forEach(e => {
            summary.totalSize += e.transferSize || 0;
            if (e.initiatorType === 'script') summary.js++;
            else if (e.initiatorType === 'css' || e.name.endsWith('.css')) summary.css++;
            else if (e.initiatorType === 'img') summary.img++;
            else summary.other++;
        });
        return summary;
    }""")

    if resources:
        total_mb = resources["totalSize"] / (1024 * 1024)
        results.append({
            "check": "resource_count",
            "status": "warn" if resources["count"] > 50 else "pass",
            "detail": f"{resources['count']} resources (JS: {resources['js']}, CSS: {resources['css']}, IMG: {resources['img']}, other: {resources['other']}), total: {total_mb:.2f}MB",
            "severity": "medium" if resources["count"] > 50 else "info"
        })

    # LCP approximation
    lcp = page.evaluate("""() => {
        return new Promise(resolve => {
            new PerformanceObserver(list => {
                const entries = list.getEntries();
                resolve(entries.length ? entries[entries.length - 1].startTime : null);
            }).observe({ type: 'largest-contentful-paint', buffered: true });
            setTimeout(() => resolve(null), 3000);
        });
    }""")

    if lcp is not None:
        results.append({
            "check": "largest_contentful_paint",
            "status": "pass" if lcp < 2500 else "warn" if lcp < 4000 else "fail",
            "detail": f"LCP: {lcp:.0f}ms (target: <2500ms)",
            "severity": "high" if lcp >= 4000 else "medium" if lcp >= 2500 else "info"
        })

    return results


CHECK_FUNCTIONS = {
    "functional": check_functional,
    "visual": check_visual,
    "a11y": check_a11y,
    "responsive": check_responsive,
    "console": check_console,
    "performance": check_performance,
}


def main():
    parser = argparse.ArgumentParser(
        description='Run configurable test checks against a web page/module'
    )
    parser.add_argument('--url', required=True, help='URL of the page to test')
    parser.add_argument('--checks', required=True,
                        help='Comma-separated check categories: functional,visual,a11y,responsive,console,performance,all')
    parser.add_argument('--output', required=True, help='Output directory for results and screenshots')

    args = parser.parse_args()

    # Parse check categories
    if args.checks.strip().lower() == "all":
        checks = ALL_CHECKS
    else:
        checks = [c.strip().lower() for c in args.checks.split(",")]
        invalid = [c for c in checks if c not in CHECK_FUNCTIONS]
        if invalid:
            print(f"Error: Unknown check categories: {invalid}")
            print(f"Valid categories: {', '.join(ALL_CHECKS)}")
            sys.exit(1)

    os.makedirs(args.output, exist_ok=True)

    page_name = make_page_name(args.url)
    all_results = {}
    timestamp = datetime.now().isoformat()

    print(f"Testing: {args.url}")
    print(f"Checks: {', '.join(checks)}")
    print(f"Output: {args.output}\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for check_name in checks:
            print(f"Running {check_name} checks...")
            context = browser.new_context(viewport=VIEWPORTS["desktop"])
            page = context.new_page()

            try:
                check_fn = CHECK_FUNCTIONS[check_name]
                results = check_fn(page, args.url, args.output)
                all_results[check_name] = results

                pass_count = sum(1 for r in results if r["status"] == "pass")
                fail_count = sum(1 for r in results if r["status"] == "fail")
                warn_count = sum(1 for r in results if r["status"] == "warn")
                print(f"  {check_name}: {pass_count} pass, {fail_count} fail, {warn_count} warn")
            except Exception as e:
                all_results[check_name] = [{
                    "check": f"{check_name}_error",
                    "status": "fail",
                    "detail": f"Check failed with error: {str(e)}",
                    "severity": "critical"
                }]
                print(f"  {check_name}: ERROR - {e}")
            finally:
                context.close()

        browser.close()

    # Generate summary
    summary = {}
    for category, results in all_results.items():
        summary[category] = {
            "pass": sum(1 for r in results if r["status"] == "pass"),
            "fail": sum(1 for r in results if r["status"] == "fail"),
            "warn": sum(1 for r in results if r["status"] == "warn"),
            "skip": sum(1 for r in results if r["status"] == "skip"),
            "total": len(results)
        }

    output = {
        "url": args.url,
        "timestamp": timestamp,
        "checks_run": checks,
        "summary": summary,
        "results": all_results
    }

    results_path = os.path.join(args.output, f"{page_name}_results.json")
    with open(results_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nResults saved to: {results_path}")

    # Print summary table
    print(f"\n{'Category':<14} {'Pass':>5} {'Fail':>5} {'Warn':>5} {'Total':>6}")
    print("-" * 40)
    total_pass = total_fail = total_warn = total_total = 0
    for cat in checks:
        s = summary[cat]
        print(f"{cat:<14} {s['pass']:>5} {s['fail']:>5} {s['warn']:>5} {s['total']:>6}")
        total_pass += s["pass"]
        total_fail += s["fail"]
        total_warn += s["warn"]
        total_total += s["total"]
    print("-" * 40)
    print(f"{'TOTAL':<14} {total_pass:>5} {total_fail:>5} {total_warn:>5} {total_total:>6}")

    # Exit with error code if any failures
    if total_fail > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
