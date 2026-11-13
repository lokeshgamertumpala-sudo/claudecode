#!/usr/bin/env python3
"""
Visual regression example: capture baselines, then compare after changes.

Usage:
    # Step 1: Capture baselines (before changes)
    python examples/visual_regression.py baseline --url http://localhost:5173 --pages /,/dashboard,/settings

    # Step 2: Capture current (after changes)
    python examples/visual_regression.py current --url http://localhost:5173 --pages /,/dashboard,/settings

    # Step 3: Compare
    python examples/visual_regression.py compare

    # Or do all steps with custom directories
    python examples/visual_regression.py baseline --url http://localhost:5173 --pages / --dir ./my_baselines
    python examples/visual_regression.py current --url http://localhost:5173 --pages / --dir ./my_current
    python examples/visual_regression.py compare --baseline ./my_baselines --current ./my_current --diff ./my_diff
"""

import argparse
import os
import subprocess
import sys


def get_scripts_dir():
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts")


DEFAULT_BASELINE = "./test-results/visual/baselines"
DEFAULT_CURRENT = "./test-results/visual/current"
DEFAULT_DIFF = "./test-results/visual/diff"


def main():
    parser = argparse.ArgumentParser(description='Visual regression testing workflow')
    subparsers = parser.add_subparsers(dest='command', required=True)

    # Baseline capture
    bp = subparsers.add_parser('baseline', help='Capture baseline screenshots')
    bp.add_argument('--url', required=True, help='Base URL')
    bp.add_argument('--pages', required=True, help='Comma-separated paths')
    bp.add_argument('--dir', default=DEFAULT_BASELINE, help=f'Output dir (default: {DEFAULT_BASELINE})')
    bp.add_argument('--viewports', default=None, help='Viewports (default: all)')

    # Current capture
    cp = subparsers.add_parser('current', help='Capture current screenshots')
    cp.add_argument('--url', required=True, help='Base URL')
    cp.add_argument('--pages', required=True, help='Comma-separated paths')
    cp.add_argument('--dir', default=DEFAULT_CURRENT, help=f'Output dir (default: {DEFAULT_CURRENT})')
    cp.add_argument('--viewports', default=None, help='Viewports (default: all)')

    # Compare
    cmp = subparsers.add_parser('compare', help='Compare baseline vs current')
    cmp.add_argument('--baseline', default=DEFAULT_BASELINE, help=f'Baseline dir (default: {DEFAULT_BASELINE})')
    cmp.add_argument('--current', default=DEFAULT_CURRENT, help=f'Current dir (default: {DEFAULT_CURRENT})')
    cmp.add_argument('--diff', default=DEFAULT_DIFF, help=f'Diff output dir (default: {DEFAULT_DIFF})')
    cmp.add_argument('--threshold', type=float, default=0.1, help='Pixel diff threshold %% (default: 0.1)')

    args = parser.parse_args()
    scripts = get_scripts_dir()
    visual_script = os.path.join(scripts, "visual_baseline.py")

    if args.command in ('baseline', 'current'):
        cmd = [
            sys.executable, visual_script, "capture",
            "--url", args.url,
            "--pages", args.pages,
            "--output", args.dir,
        ]
        if args.viewports:
            cmd.extend(["--viewports", args.viewports])

        print(f"Capturing {'baselines' if args.command == 'baseline' else 'current'} screenshots...")
        result = subprocess.run(cmd)
        sys.exit(result.returncode)

    elif args.command == 'compare':
        cmd = [
            sys.executable, visual_script, "compare",
            "--baseline", args.baseline,
            "--current", args.current,
            "--output", args.diff,
            "--threshold", str(args.threshold),
        ]

        print("Comparing screenshots...")
        result = subprocess.run(cmd)
        sys.exit(result.returncode)


if __name__ == '__main__':
    main()
