#!/usr/bin/env python3
"""
Crawl a running web app to discover its structure: routes, forms, and interactive elements.

Usage:
    python scripts/discover_app.py --url http://localhost:5173 --output /tmp/app_map.json
    python scripts/discover_app.py --url http://localhost:5173 --depth 3 --output /tmp/app_map.json
    python scripts/discover_app.py --url http://localhost:5173 --depth 2 --timeout 10 --output /tmp/app_map.json
"""

import argparse
import json
import sys
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright


def discover_page(page, url, base_host, timeout_ms=15000):
    """Discover interactive elements on a single page."""
    result = {
        "url": url,
        "title": "",
        "links": [],
        "forms": [],
        "buttons": [],
        "inputs": [],
        "headings": [],
        "images": [],
        "errors": []
    }

    try:
        page.goto(url, wait_until="networkidle", timeout=timeout_ms)
        page.wait_for_load_state("networkidle")
        result["title"] = page.title()

        # Discover links
        links = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a[href]')).map(a => ({
                href: a.href,
                text: a.textContent.trim().substring(0, 100),
                isInternal: a.hostname === window.location.hostname
            }));
        }""")
        result["links"] = links

        # Discover forms
        forms = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('form')).map(form => ({
                action: form.action,
                method: form.method,
                id: form.id || null,
                fields: Array.from(form.querySelectorAll('input, select, textarea')).map(el => ({
                    tag: el.tagName.toLowerCase(),
                    type: el.type || null,
                    name: el.name || null,
                    id: el.id || null,
                    placeholder: el.placeholder || null,
                    required: el.required,
                    label: el.labels?.[0]?.textContent?.trim() || null
                }))
            }));
        }""")
        result["forms"] = forms

        # Discover buttons
        buttons = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]')).map(btn => ({
                tag: btn.tagName.toLowerCase(),
                type: btn.type || null,
                text: btn.textContent.trim().substring(0, 100),
                id: btn.id || null,
                ariaLabel: btn.getAttribute('aria-label') || null,
                disabled: btn.disabled || false
            }));
        }""")
        result["buttons"] = buttons

        # Discover standalone inputs (not in forms)
        inputs = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('input:not(form input), select:not(form select), textarea:not(form textarea)')).map(el => ({
                tag: el.tagName.toLowerCase(),
                type: el.type || null,
                name: el.name || null,
                id: el.id || null,
                placeholder: el.placeholder || null,
                ariaLabel: el.getAttribute('aria-label') || null
            }));
        }""")
        result["inputs"] = inputs

        # Discover headings
        headings = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
                level: parseInt(h.tagName.substring(1)),
                text: h.textContent.trim().substring(0, 200)
            }));
        }""")
        result["headings"] = headings

        # Discover images
        images = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt || null,
                hasAlt: img.hasAttribute('alt')
            }));
        }""")
        result["images"] = images

    except Exception as e:
        result["errors"].append(str(e))

    return result


def crawl(page, base_url, max_depth, base_host, timeout_ms=15000):
    """Crawl the app starting from base_url up to max_depth."""
    visited = set()
    results = []
    queue = [(base_url, 0)]

    while queue:
        url, depth = queue.pop(0)

        # Normalize URL (remove fragment and trailing slash)
        parsed = urlparse(url)
        normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path.rstrip('/')}"
        if normalized in visited:
            continue
        if parsed.hostname != base_host:
            continue

        visited.add(normalized)
        print(f"[depth={depth}] Discovering: {normalized}")

        page_data = discover_page(page, normalized, base_host, timeout_ms=timeout_ms)
        results.append(page_data)

        # Queue internal links for further crawling
        if depth < max_depth:
            for link in page_data["links"]:
                if link.get("isInternal"):
                    link_parsed = urlparse(link["href"])
                    link_normalized = f"{link_parsed.scheme}://{link_parsed.netloc}{link_parsed.path.rstrip('/')}"
                    if link_normalized not in visited:
                        queue.append((link["href"], depth + 1))

    return results


def main():
    parser = argparse.ArgumentParser(
        description='Crawl a running web app to discover routes, forms, and interactive elements'
    )
    parser.add_argument('--url', required=True, help='Base URL of the running app')
    parser.add_argument('--depth', type=int, default=2, help='Maximum crawl depth (default: 2)')
    parser.add_argument('--timeout', type=int, default=15,
                        help='Page navigation timeout in seconds (default: 15)')
    parser.add_argument('--output', required=True, help='Output JSON file path')

    args = parser.parse_args()

    base_host = urlparse(args.url).hostname

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900}
        )
        page = context.new_page()

        timeout_ms = args.timeout * 1000
        print(f"Crawling {args.url} (max depth: {args.depth}, timeout: {args.timeout}s)...")
        results = crawl(page, args.url, args.depth, base_host, timeout_ms=timeout_ms)

        browser.close()

    # Build summary
    app_map = {
        "base_url": args.url,
        "pages_discovered": len(results),
        "routes": [r["url"] for r in results],
        "pages": results,
        "summary": {
            "total_links": sum(len(r["links"]) for r in results),
            "total_forms": sum(len(r["forms"]) for r in results),
            "total_buttons": sum(len(r["buttons"]) for r in results),
            "total_inputs": sum(len(r["inputs"]) for r in results),
            "total_images": sum(len(r["images"]) for r in results),
            "pages_with_errors": sum(1 for r in results if r["errors"])
        }
    }

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(app_map, f, indent=2, ensure_ascii=False)

    print(f"\nDiscovery complete:")
    print(f"  Pages discovered: {app_map['pages_discovered']}")
    print(f"  Total links: {app_map['summary']['total_links']}")
    print(f"  Total forms: {app_map['summary']['total_forms']}")
    print(f"  Total buttons: {app_map['summary']['total_buttons']}")
    print(f"  Output saved to: {args.output}")


if __name__ == '__main__':
    main()
