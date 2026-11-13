#!/usr/bin/env python3
"""
WCAG 2.1 AA accessibility audit for web pages.

Usage:
    python scripts/a11y_check.py --url http://localhost:5173/dashboard --output /tmp/a11y_report.json
    python scripts/a11y_check.py --url http://localhost:5173 --pages /,/dashboard,/settings --output /tmp/a11y_report.json
"""

import argparse
import json
import os
import sys
from datetime import datetime
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright


def make_page_name(url):
    path = urlparse(url).path.strip("/")
    return path.replace("/", "_") if path else "root"


def audit_page(page, url):
    """Run comprehensive a11y audit on a single page."""
    results = []

    try:
        page.goto(url, wait_until="networkidle", timeout=15000)
        page.wait_for_load_state("networkidle")
    except Exception as e:
        return [{"check": "page_load", "status": "fail", "detail": str(e),
                 "severity": "critical", "wcag": "N/A", "principle": "N/A"}]

    # --- PERCEIVABLE ---

    # 1.1.1 Non-text Content: Images must have alt text
    img_audit = page.evaluate("""() => {
        const imgs = document.querySelectorAll('img');
        let missing = [], empty = [], decorative = 0;
        imgs.forEach(img => {
            if (!img.hasAttribute('alt')) {
                missing.push(img.src.substring(0, 80));
            } else if (img.alt === '') {
                decorative++;
            } else if (img.alt.trim() === '') {
                empty.push(img.src.substring(0, 80));
            }
        });
        return { total: imgs.length, missing, empty, decorative };
    }""")
    results.append({
        "check": "images_have_alt",
        "status": "fail" if img_audit["missing"] else "pass",
        "detail": f"{len(img_audit['missing'])} images without alt attribute, {img_audit['decorative']} decorative (alt='')",
        "severity": "high" if img_audit["missing"] else "info",
        "wcag": "1.1.1",
        "principle": "Perceivable"
    })

    # 1.3.1 Info and Relationships: Heading hierarchy
    headings = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
            level: parseInt(h.tagName[1]),
            text: h.textContent.trim().substring(0, 80)
        }));
    }""")
    h1s = [h for h in headings if h["level"] == 1]
    levels = [h["level"] for h in headings]
    skipped = any(levels[i] > levels[i-1] + 1 for i in range(1, len(levels))) if len(levels) > 1 else False

    results.append({
        "check": "single_h1",
        "status": "pass" if len(h1s) == 1 else "warn" if len(h1s) == 0 else "fail",
        "detail": f"{len(h1s)} h1 element(s) found" + (f": '{h1s[0]['text']}'" if len(h1s) == 1 else ""),
        "severity": "medium",
        "wcag": "1.3.1",
        "principle": "Perceivable"
    })
    results.append({
        "check": "heading_hierarchy_no_skip",
        "status": "fail" if skipped else "pass",
        "detail": f"Heading levels: {levels}" + (" — skipped levels detected" if skipped else ""),
        "severity": "medium" if skipped else "info",
        "wcag": "1.3.1",
        "principle": "Perceivable"
    })

    # 1.3.1 Form labels
    form_labels = page.evaluate("""() => {
        const inputs = document.querySelectorAll(
            'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea'
        );
        let issues = [];
        inputs.forEach(input => {
            const hasLabel = input.labels?.length > 0;
            const hasAriaLabel = !!input.getAttribute('aria-label');
            const hasAriaLabelledBy = !!input.getAttribute('aria-labelledby');
            const hasTitle = !!input.getAttribute('title');
            if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
                issues.push({
                    tag: input.tagName.toLowerCase(),
                    type: input.type || null,
                    name: input.name || input.id || '(unnamed)'
                });
            }
        });
        return { total: inputs.length, issues };
    }""")
    results.append({
        "check": "form_inputs_labeled",
        "status": "fail" if form_labels["issues"] else "pass",
        "detail": f"{len(form_labels['issues'])}/{form_labels['total']} inputs lack accessible labels",
        "severity": "high" if form_labels["issues"] else "info",
        "wcag": "1.3.1",
        "principle": "Perceivable"
    })

    # 1.4.3 Contrast (basic check via computed styles on body text)
    contrast_info = page.evaluate("""() => {
        function luminance(r, g, b) {
            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        function contrastRatio(l1, l2) {
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
        }
        function parseColor(str) {
            const match = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?/);
            if (!match) return null;
            const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
            if (alpha < 0.1) return null;  // transparent/inherited — skip
            return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
        }
        const textEls = document.querySelectorAll('p, span, li, td, th, label, a, h1, h2, h3, h4, h5, h6');
        let lowContrast = 0, checked = 0;
        textEls.forEach(el => {
            if (!el.textContent.trim()) return;
            const style = window.getComputedStyle(el);
            const fg = parseColor(style.color);
            const bg = parseColor(style.backgroundColor);
            if (fg && bg && bg[0] !== undefined) {
                checked++;
                const fgL = luminance(...fg);
                const bgL = luminance(...bg);
                const ratio = contrastRatio(fgL, bgL);
                const fontSize = parseFloat(style.fontSize);
                const isBold = parseInt(style.fontWeight) >= 700;
                const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && isBold);
                const minRatio = isLargeText ? 3 : 4.5;
                if (ratio < minRatio) lowContrast++;
            }
        });
        return { checked, lowContrast };
    }""")
    results.append({
        "check": "color_contrast",
        "status": "fail" if contrast_info["lowContrast"] > 0 else "pass",
        "detail": f"{contrast_info['lowContrast']}/{contrast_info['checked']} text elements may have insufficient contrast (checked against direct background only)",
        "severity": "high" if contrast_info["lowContrast"] > 0 else "info",
        "wcag": "1.4.3",
        "principle": "Perceivable"
    })

    # --- OPERABLE ---

    # 2.1.1 Keyboard accessible
    keyboard_info = page.evaluate("""() => {
        const interactive = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex], [role="button"], [role="link"]');
        let issues = [];
        interactive.forEach(el => {
            const tabindex = el.getAttribute('tabindex');
            if (tabindex && parseInt(tabindex) < 0 && el.offsetWidth > 0) {
                issues.push({
                    tag: el.tagName.toLowerCase(),
                    text: (el.textContent || '').trim().substring(0, 50),
                    issue: 'negative tabindex on visible element'
                });
            }
        });
        // Check for click handlers on non-interactive elements
        const divButtons = document.querySelectorAll('div[onclick], span[onclick]');
        divButtons.forEach(el => {
            if (!el.getAttribute('role') && !el.getAttribute('tabindex')) {
                issues.push({
                    tag: el.tagName.toLowerCase(),
                    text: (el.textContent || '').trim().substring(0, 50),
                    issue: 'onclick without role or tabindex'
                });
            }
        });
        return { total: interactive.length, issues };
    }""")
    results.append({
        "check": "keyboard_accessible",
        "status": "fail" if keyboard_info["issues"] else "pass",
        "detail": f"{len(keyboard_info['issues'])} keyboard accessibility issues",
        "severity": "high" if keyboard_info["issues"] else "info",
        "wcag": "2.1.1",
        "principle": "Operable"
    })

    # 2.4.1 Skip to content link
    skip_link = page.evaluate("""() => {
        const first_link = document.querySelector('a[href^="#"]');
        const has_skip = first_link && /skip|main|content/i.test(first_link.textContent);
        return { hasSkipLink: has_skip };
    }""")
    results.append({
        "check": "skip_navigation",
        "status": "pass" if skip_link["hasSkipLink"] else "warn",
        "detail": "Skip navigation link " + ("found" if skip_link["hasSkipLink"] else "not found"),
        "severity": "medium" if not skip_link["hasSkipLink"] else "info",
        "wcag": "2.4.1",
        "principle": "Operable"
    })

    # 2.4.2 Page title
    title = page.title()
    results.append({
        "check": "page_has_title",
        "status": "pass" if title.strip() else "fail",
        "detail": f"Page title: '{title}'" if title else "Page has no title",
        "severity": "high" if not title.strip() else "info",
        "wcag": "2.4.2",
        "principle": "Operable"
    })

    # 2.4.7 Focus visible
    focus_info = page.evaluate("""() => {
        const interactive = document.querySelectorAll('a, button, input, select, textarea, [tabindex="0"]');
        let noOutline = 0;
        interactive.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.outlineStyle === 'none') noOutline++;
        });
        return { total: interactive.length, noOutline };
    }""")
    results.append({
        "check": "focus_visible",
        "status": "warn" if focus_info["noOutline"] > 0 else "pass",
        "detail": f"{focus_info['noOutline']}/{focus_info['total']} elements have outline:none (may still have custom focus styles)",
        "severity": "medium" if focus_info["noOutline"] > 0 else "info",
        "wcag": "2.4.7",
        "principle": "Operable"
    })

    # --- UNDERSTANDABLE ---

    # 3.1.1 Language of page
    lang = page.evaluate("() => document.documentElement.getAttribute('lang')")
    results.append({
        "check": "html_lang_attribute",
        "status": "pass" if lang else "fail",
        "detail": f"html lang='{lang}'" if lang else "Missing lang attribute on <html>",
        "severity": "high" if not lang else "info",
        "wcag": "3.1.1",
        "principle": "Understandable"
    })

    # 3.3.2 Labels or instructions for inputs
    # (Covered by form_inputs_labeled above)

    # --- ROBUST ---

    # 4.1.1 Valid ARIA usage
    aria_issues = page.evaluate("""() => {
        let issues = [];
        // Buttons/links without accessible names
        document.querySelectorAll('button, [role="button"]').forEach(el => {
            const name = el.textContent.trim() || el.getAttribute('aria-label') || el.getAttribute('title');
            if (!name && el.offsetWidth > 0) {
                issues.push({ element: 'button', issue: 'no accessible name', id: el.id || null });
            }
        });
        document.querySelectorAll('a[href]').forEach(el => {
            const name = el.textContent.trim() || el.getAttribute('aria-label') || el.getAttribute('title');
            if (!name && el.offsetWidth > 0) {
                issues.push({ element: 'link', issue: 'no accessible name', href: el.href.substring(0, 50) });
            }
        });
        // Check for invalid ARIA roles
        document.querySelectorAll('[role]').forEach(el => {
            const validRoles = ['alert','alertdialog','application','article','banner','button','cell','checkbox',
                'columnheader','combobox','complementary','contentinfo','definition','dialog','directory','document',
                'feed','figure','form','grid','gridcell','group','heading','img','link','list','listbox','listitem',
                'log','main','marquee','math','menu','menubar','menuitem','menuitemcheckbox','menuitemradio',
                'navigation','none','note','option','presentation','progressbar','radio','radiogroup','region',
                'row','rowgroup','rowheader','scrollbar','search','searchbox','separator','slider','spinbutton',
                'status','switch','tab','table','tablist','tabpanel','term','textbox','timer','toolbar','tooltip',
                'tree','treegrid','treeitem'];
            const role = el.getAttribute('role');
            if (!validRoles.includes(role)) {
                issues.push({ element: el.tagName.toLowerCase(), issue: `invalid role: ${role}` });
            }
        });
        return issues;
    }""")
    results.append({
        "check": "valid_aria",
        "status": "fail" if aria_issues else "pass",
        "detail": f"{len(aria_issues)} ARIA issues found" + (f": {json.dumps(aria_issues[:3])}" if aria_issues else ""),
        "severity": "high" if aria_issues else "info",
        "wcag": "4.1.2",
        "principle": "Robust"
    })

    # 4.1.2 Landmark roles
    landmarks = page.evaluate("""() => {
        return {
            main: !!document.querySelector('main, [role="main"]'),
            nav: !!document.querySelector('nav, [role="navigation"]'),
            banner: !!document.querySelector('header, [role="banner"]'),
            contentinfo: !!document.querySelector('footer, [role="contentinfo"]')
        };
    }""")
    missing_landmarks = [k for k, v in landmarks.items() if not v]
    results.append({
        "check": "landmark_regions",
        "status": "pass" if not missing_landmarks else "warn",
        "detail": f"Missing landmarks: {missing_landmarks}" if missing_landmarks else "All key landmark regions present",
        "severity": "medium" if missing_landmarks else "info",
        "wcag": "4.1.2",
        "principle": "Robust"
    })

    return results


def main():
    parser = argparse.ArgumentParser(
        description='WCAG 2.1 AA accessibility audit for web pages'
    )
    parser.add_argument('--url', required=True, help='Base URL or specific page URL')
    parser.add_argument('--pages', default=None,
                        help='Comma-separated URL paths to audit (default: just the --url)')
    parser.add_argument('--output', required=True, help='Output JSON file path')

    args = parser.parse_args()

    if args.pages:
        pages = [urljoin(args.url, p.strip()) for p in args.pages.split(",")]
    else:
        pages = [args.url]

    all_results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        for url in pages:
            print(f"Auditing: {url}")
            page_results = audit_page(page, url)
            all_results[url] = page_results

            pass_count = sum(1 for r in page_results if r["status"] == "pass")
            fail_count = sum(1 for r in page_results if r["status"] == "fail")
            warn_count = sum(1 for r in page_results if r["status"] == "warn")
            print(f"  Results: {pass_count} pass, {fail_count} fail, {warn_count} warn")

        browser.close()

    # Build report
    total_checks = sum(len(r) for r in all_results.values())
    total_pass = sum(sum(1 for c in r if c["status"] == "pass") for r in all_results.values())
    total_fail = sum(sum(1 for c in r if c["status"] == "fail") for r in all_results.values())
    total_warn = sum(sum(1 for c in r if c["status"] == "warn") for r in all_results.values())

    report = {
        "timestamp": datetime.now().isoformat(),
        "standard": "WCAG 2.1 AA",
        "pages_audited": len(pages),
        "summary": {
            "total_checks": total_checks,
            "pass": total_pass,
            "fail": total_fail,
            "warn": total_warn,
            "compliance_rate": f"{(total_pass / total_checks * 100):.1f}%" if total_checks > 0 else "N/A"
        },
        "results": all_results
    }

    # Ensure output directory exists
    output_dir = os.path.dirname(args.output)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\nAccessibility Audit Summary:")
    print(f"  Standard: WCAG 2.1 AA")
    print(f"  Pages: {len(pages)}")
    print(f"  Checks: {total_checks} ({total_pass} pass, {total_fail} fail, {total_warn} warn)")
    print(f"  Compliance: {report['summary']['compliance_rate']}")
    print(f"  Report: {args.output}")

    if total_fail > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
