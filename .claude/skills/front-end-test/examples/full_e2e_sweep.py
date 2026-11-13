#!/usr/bin/env python3
"""
Full E2E sweep example: discover app structure, test every discovered page, generate report.

Usage:
    # With server already running
    python examples/full_e2e_sweep.py --url http://localhost:5173 --output /tmp/e2e_results/

    # With server management
    python scripts/with_server.py --server "npm run dev" --port 5173 \
      -- python examples/full_e2e_sweep.py --url http://localhost:5173 --output /tmp/e2e_results/
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime


def get_scripts_dir():
    """Get the absolute path to the scripts directory."""
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts")


def main():
    parser = argparse.ArgumentParser(description='Full E2E sweep of a web application')
    parser.add_argument('--url', required=True, help='Base URL of the running app')
    parser.add_argument('--output', required=True, help='Output directory for all results')
    parser.add_argument('--depth', type=int, default=2, help='Crawl depth (default: 2)')
    parser.add_argument('--checks', default='all', help='Check categories (default: all)')

    args = parser.parse_args()
    scripts = get_scripts_dir()
    os.makedirs(args.output, exist_ok=True)

    print("=" * 60)
    print("FULL E2E SWEEP")
    print(f"URL: {args.url}")
    print(f"Output: {args.output}")
    print("=" * 60)

    # Phase 1: Discovery
    print("\n--- Phase 1: Discovery ---")
    app_map_path = os.path.join(args.output, "app_map.json")
    result = subprocess.run([
        sys.executable, os.path.join(scripts, "discover_app.py"),
        "--url", args.url,
        "--depth", str(args.depth),
        "--output", app_map_path
    ])
    if result.returncode != 0:
        print("Discovery failed!")
        sys.exit(1)

    with open(app_map_path, 'r') as f:
        app_map = json.load(f)

    routes = app_map.get("routes", [args.url])
    print(f"\nDiscovered {len(routes)} route(s)")

    # Phase 2: Test each discovered page
    print("\n--- Phase 2: Testing ---")
    all_page_results = {}

    for i, route in enumerate(routes):
        print(f"\n[{i+1}/{len(routes)}] Testing: {route}")
        page_output = os.path.join(args.output, f"page_{i}")
        os.makedirs(page_output, exist_ok=True)

        result = subprocess.run([
            sys.executable, os.path.join(scripts, "test_module.py"),
            "--url", route,
            "--checks", args.checks,
            "--output", page_output
        ])

        # Load results if available
        from urllib.parse import urlparse
        path = urlparse(route).path.strip("/")
        page_name = path.replace("/", "_") if path else "root"
        results_file = os.path.join(page_output, f"{page_name}_results.json")

        if os.path.exists(results_file):
            with open(results_file, 'r') as f:
                all_page_results[route] = json.load(f)

    # Phase 3: Accessibility audit
    print("\n--- Phase 3: Accessibility Audit ---")
    a11y_output = os.path.join(args.output, "a11y_report.json")
    pages_arg = ",".join(routes)
    subprocess.run([
        sys.executable, os.path.join(scripts, "a11y_check.py"),
        "--url", args.url,
        "--pages", pages_arg,
        "--output", a11y_output
    ])

    # Phase 4: Generate consolidated report
    print("\n--- Phase 4: Report ---")
    report = {
        "timestamp": datetime.now().isoformat(),
        "base_url": args.url,
        "pages_tested": len(routes),
        "routes": routes,
        "page_results": all_page_results,
        "a11y_report": a11y_output,
        "app_map": app_map_path
    }

    report_path = os.path.join(args.output, "e2e_report.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print("E2E SWEEP COMPLETE")
    print(f"Pages tested: {len(routes)}")
    print(f"Report: {report_path}")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    main()
