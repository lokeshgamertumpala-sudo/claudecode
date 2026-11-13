#!/usr/bin/env python3
"""
Targeted module test example: test a specific page with all check categories.

Usage:
    # Test just the dashboard
    python examples/targeted_module_test.py --url http://localhost:5173/dashboard --output /tmp/dashboard_test/

    # Test with specific checks
    python examples/targeted_module_test.py --url http://localhost:5173/settings --checks functional,a11y --output /tmp/settings_test/

    # With server management
    python scripts/with_server.py --server "npm run dev" --port 5173 \
      -- python examples/targeted_module_test.py --url http://localhost:5173/dashboard --output /tmp/dashboard_test/
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime


def get_scripts_dir():
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts")


def main():
    parser = argparse.ArgumentParser(description='Targeted test of a specific page/module')
    parser.add_argument('--url', required=True, help='URL of the page to test')
    parser.add_argument('--checks', default='all', help='Check categories (default: all)')
    parser.add_argument('--output', required=True, help='Output directory')

    args = parser.parse_args()
    scripts = get_scripts_dir()
    os.makedirs(args.output, exist_ok=True)

    print(f"Targeted Module Test: {args.url}")
    print(f"Checks: {args.checks}")
    print(f"Output: {args.output}\n")

    # Run test_module.py
    print("--- Running module tests ---")
    result = subprocess.run([
        sys.executable, os.path.join(scripts, "test_module.py"),
        "--url", args.url,
        "--checks", args.checks,
        "--output", args.output
    ])

    # Run dedicated a11y check if a11y is in the checks
    if args.checks == "all" or "a11y" in args.checks:
        print("\n--- Running detailed accessibility audit ---")
        a11y_output = os.path.join(args.output, "a11y_detailed.json")
        subprocess.run([
            sys.executable, os.path.join(scripts, "a11y_check.py"),
            "--url", args.url,
            "--output", a11y_output
        ])

    print(f"\nAll results saved to: {args.output}")

    if result.returncode != 0:
        print("Some checks FAILED — review results for details.")
        sys.exit(1)
    else:
        print("All checks PASSED.")


if __name__ == '__main__':
    main()
