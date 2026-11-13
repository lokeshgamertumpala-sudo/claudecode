#!/usr/bin/env python3
"""
Capture or compare screenshot baselines for visual regression testing.

Usage:
    # Capture baselines
    python scripts/visual_baseline.py capture --url http://localhost:5173 --pages /,/dashboard,/settings --output ./baselines/

    # Compare against baselines
    python scripts/visual_baseline.py compare --baseline ./baselines/ --current ./current/ --output ./diff/

    # Capture with specific viewports
    python scripts/visual_baseline.py capture --url http://localhost:5173 --pages / --viewports desktop,mobile --output ./baselines/
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from urllib.parse import urljoin
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

VIEWPORTS = {
    "mobile": {"width": 375, "height": 812},
    "tablet": {"width": 768, "height": 1024},
    "desktop": {"width": 1440, "height": 900},
}


def make_safe_name(path):
    """Convert a URL path to a safe filename."""
    name = path.strip("/").replace("/", "_")
    return name if name else "root"


def capture_baselines(args):
    """Capture screenshot baselines for specified pages."""
    pages = [p.strip() for p in args.pages.split(",")]
    viewports = [v.strip() for v in args.viewports.split(",")] if args.viewports else list(VIEWPORTS.keys())

    os.makedirs(args.output, exist_ok=True)
    manifest = {
        "base_url": args.url,
        "timestamp": datetime.now().isoformat(),
        "pages": pages,
        "viewports": viewports,
        "screenshots": []
    }

    print(f"Capturing baselines for {len(pages)} page(s) at {len(viewports)} viewport(s)...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for page_path in pages:
            url = urljoin(args.url, page_path)
            safe_name = make_safe_name(page_path)

            for vp_name in viewports:
                if vp_name not in VIEWPORTS:
                    print(f"  Warning: Unknown viewport '{vp_name}', skipping")
                    continue

                context = browser.new_context(viewport=VIEWPORTS[vp_name])
                page = context.new_page()

                try:
                    page.goto(url, wait_until="networkidle", timeout=15000)
                    page.wait_for_load_state("networkidle")
                    time.sleep(args.wait or 0.5)

                    filename = f"{safe_name}_{vp_name}.png"
                    filepath = os.path.join(args.output, filename)
                    page.screenshot(path=filepath, full_page=True)

                    manifest["screenshots"].append({
                        "page": page_path,
                        "viewport": vp_name,
                        "filename": filename,
                        "url": url
                    })
                    print(f"  Captured: {filename}")

                except Exception as e:
                    print(f"  Error capturing {page_path} at {vp_name}: {e}")
                finally:
                    context.close()

        browser.close()

    # Save manifest
    manifest_path = os.path.join(args.output, "manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)

    print(f"\nBaselines saved to: {args.output}")
    print(f"Manifest: {manifest_path}")
    print(f"Total screenshots: {len(manifest['screenshots'])}")


def compare_baselines(args):
    """Compare current screenshots against baselines."""
    os.makedirs(args.output, exist_ok=True)
    threshold = args.threshold or 0.1  # Default 0.1% pixel difference threshold

    # Load manifests
    baseline_manifest_path = os.path.join(args.baseline, "manifest.json")
    current_manifest_path = os.path.join(args.current, "manifest.json")

    if not os.path.exists(baseline_manifest_path):
        print(f"Error: No manifest.json found in baseline directory: {args.baseline}")
        sys.exit(1)
    if not os.path.exists(current_manifest_path):
        print(f"Error: No manifest.json found in current directory: {args.current}")
        sys.exit(1)

    with open(baseline_manifest_path, 'r') as f:
        baseline_manifest = json.load(f)
    with open(current_manifest_path, 'r') as f:
        current_manifest = json.load(f)

    # Build lookup by filename
    current_files = {s["filename"]: s for s in current_manifest["screenshots"]}
    results = []

    print(f"Comparing {len(baseline_manifest['screenshots'])} baseline(s) against current...")
    print(f"Threshold: {threshold}% pixel difference\n")

    for baseline_entry in baseline_manifest["screenshots"]:
        filename = baseline_entry["filename"]
        baseline_path = os.path.join(args.baseline, filename)
        current_path = os.path.join(args.current, filename)

        if not os.path.exists(current_path):
            results.append({
                "filename": filename,
                "page": baseline_entry["page"],
                "viewport": baseline_entry["viewport"],
                "status": "missing",
                "diff_percentage": None,
                "detail": "Current screenshot not found"
            })
            print(f"  MISSING: {filename}")
            continue

        try:
            baseline_img = Image.open(baseline_path).convert("RGB")
            current_img = Image.open(current_path).convert("RGB")

            # Resize current to match baseline if dimensions differ
            if baseline_img.size != current_img.size:
                current_img = current_img.resize(baseline_img.size, Image.LANCZOS)

            # Compute pixel difference
            diff = ImageChops.difference(baseline_img, current_img)
            total_pixels = diff.size[0] * diff.size[1]
            changed_pixels = sum(1 for pixel in diff.getdata() if sum(pixel) > 30)  # Tolerance per pixel
            diff_pct = (changed_pixels / total_pixels) * 100 if total_pixels > 0 else 0

            status = "pass" if diff_pct <= threshold else "fail"

            # Save diff image
            if diff_pct > 0:
                diff_filename = f"diff_{filename}"
                diff_path = os.path.join(args.output, diff_filename)
                # Amplify diff for visibility
                amplified = diff.point(lambda x: min(x * 10, 255))
                amplified.save(diff_path)

            results.append({
                "filename": filename,
                "page": baseline_entry["page"],
                "viewport": baseline_entry["viewport"],
                "status": status,
                "diff_percentage": round(diff_pct, 3),
                "detail": f"{diff_pct:.3f}% pixels changed ({changed_pixels}/{total_pixels})"
            })

            icon = "PASS" if status == "pass" else "FAIL"
            print(f"  {icon}: {filename} — {diff_pct:.3f}% diff")

        except Exception as e:
            results.append({
                "filename": filename,
                "page": baseline_entry["page"],
                "viewport": baseline_entry["viewport"],
                "status": "error",
                "diff_percentage": None,
                "detail": str(e)
            })
            print(f"  ERROR: {filename} — {e}")

    # Check for new screenshots not in baseline
    baseline_files = {s["filename"] for s in baseline_manifest["screenshots"]}
    for filename, entry in current_files.items():
        if filename not in baseline_files:
            results.append({
                "filename": filename,
                "page": entry["page"],
                "viewport": entry["viewport"],
                "status": "new",
                "diff_percentage": None,
                "detail": "New screenshot (no baseline)"
            })
            print(f"  NEW: {filename}")

    # Save report
    report = {
        "timestamp": datetime.now().isoformat(),
        "baseline_dir": args.baseline,
        "current_dir": args.current,
        "threshold": threshold,
        "total": len(results),
        "passed": sum(1 for r in results if r["status"] == "pass"),
        "failed": sum(1 for r in results if r["status"] == "fail"),
        "missing": sum(1 for r in results if r["status"] == "missing"),
        "new": sum(1 for r in results if r["status"] == "new"),
        "results": results
    }

    report_path = os.path.join(args.output, "visual_diff_report.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print(f"\nComparison complete:")
    print(f"  Passed: {report['passed']}")
    print(f"  Failed: {report['failed']}")
    print(f"  Missing: {report['missing']}")
    print(f"  New: {report['new']}")
    print(f"  Report: {report_path}")

    if report["failed"] > 0:
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description='Capture or compare screenshot baselines for visual regression testing'
    )
    subparsers = parser.add_subparsers(dest='command', required=True)

    # Capture subcommand
    capture_parser = subparsers.add_parser('capture', help='Capture screenshot baselines')
    capture_parser.add_argument('--url', required=True, help='Base URL of the running app')
    capture_parser.add_argument('--pages', required=True,
                                help='Comma-separated URL paths to capture (e.g., /,/dashboard,/settings)')
    capture_parser.add_argument('--viewports', default=None,
                                help='Comma-separated viewports: mobile,tablet,desktop (default: all)')
    capture_parser.add_argument('--output', required=True, help='Output directory for baselines')
    capture_parser.add_argument('--wait', type=float, default=0.5,
                                help='Wait time in seconds after page load (default: 0.5)')

    # Compare subcommand
    compare_parser = subparsers.add_parser('compare', help='Compare current screenshots against baselines')
    compare_parser.add_argument('--baseline', required=True, help='Directory with baseline screenshots')
    compare_parser.add_argument('--current', required=True, help='Directory with current screenshots')
    compare_parser.add_argument('--output', required=True, help='Output directory for diff results')
    compare_parser.add_argument('--threshold', type=float, default=0.1,
                                help='Max acceptable pixel diff percentage (default: 0.1)')

    args = parser.parse_args()

    if args.command == 'capture':
        capture_baselines(args)
    elif args.command == 'compare':
        compare_baselines(args)


if __name__ == '__main__':
    main()
