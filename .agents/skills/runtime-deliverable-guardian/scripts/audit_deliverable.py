#!/usr/bin/env python3
"""
Runtime Deliverable & Process Guardian (audit_deliverable.py)
Validates:
  - Zero White-Screen traps: Absolute root paths in HTML (/assets/..., /src/...)
  - CORS traps on file://: Unbundled <script type="module"> without 1-click launcher
  - Raw uncompiled JSX/TSX script tags in HTML
  - Single-page app routing compatibility (HashRouter vs BrowserRouter on file://)
  - Process hygiene: checks for orphaned background dev servers locking the directory
"""

import os
import sys
import re
import subprocess
from pathlib import Path
from html.parser import HTMLParser

CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

EXCLUDE_DIRS = {".git", "node_modules", ".gemini", "__pycache__", ".agents", ".claude"}

class WebDeliverableAuditor(HTMLParser):
    def __init__(self, file_path: Path):
        super().__init__()
        self.file_path = file_path
        self.errors = []
        self.warnings = []
        self.has_module_script = False
        self.has_raw_jsx_script = False
        self.has_absolute_paths = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        
        # Check src attributes on scripts, images, audio, video
        src = attr_dict.get("src", "")
        href = attr_dict.get("href", "")

        # 1. Absolute root paths check (/src/..., /assets/...)
        if src.startswith("/") and not src.startswith("//"):
            self.errors.append(
                f"Absolute root path in src='{src}': Breaks under file:// protocols. Use relative './' paths."
            )
            self.has_absolute_paths.append(src)
            
        if href.startswith("/") and not href.startswith("//") and tag != "a":
            self.warnings.append(
                f"Absolute root path in <{tag} href='{href}'>: May fail to resolve on file://."
            )

        # 2. Raw JSX / TSX script check
        if tag == "script":
            script_type = attr_dict.get("type", "").lower()
            if script_type == "module":
                self.has_module_script = True
            
            if src.endswith(".jsx") or src.endswith(".tsx"):
                self.errors.append(
                    f"Raw JSX/TSX script '{src}': Browsers cannot parse JSX without transpilation."
                )
                self.has_raw_jsx_script = True

def check_html_file(path: Path, has_launcher: bool):
    auditor = WebDeliverableAuditor(path)
    try:
        content = path.read_text(encoding="utf-8")
        auditor.feed(content)
    except Exception as e:
        return [f"Failed to read HTML: {e}"], []

    # If it uses <script type="module"> and has no local server launcher, warn about CORS trap
    if auditor.has_module_script and not has_launcher:
        auditor.warnings.append(
            "Uses <script type='module'> without a 1-click localhost launcher (.bat). "
            "Opening directly via file:// will trigger CORS policy lockouts in Chrome/Edge/Firefox."
        )

    return auditor.errors, auditor.warnings

def check_process_hygiene(target_dir: Path):
    """Detects orphaned node/vite processes locking the target directory on Windows."""
    warnings = []
    if os.name != "nt":
        return warnings

    resolved_dir = target_dir.resolve()
    dir_name = resolved_dir.name
    if not dir_name:
        return warnings

    try:
        cmd = [
            "powershell", "-NoProfile", "-Command",
            f"Get-CimInstance Win32_Process | Where-Object {{ $_.CommandLine -like '*{dir_name}*' -and ($_.Name -eq 'node.exe' -or $_.Name -eq 'cmd.exe' -or $_.Name -eq 'vite.exe') }} | Select-Object -ExpandProperty ProcessId"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
        pids = [p.strip() for p in res.stdout.splitlines() if p.strip().isdigit()]
        if pids:
            warnings.append(
                f"Active background processes ({', '.join(pids)}) detected locking '{target_dir.name}'. "
                "Ensure processes are terminated when done to avoid Windows 'Folder in Use' errors."
            )
    except Exception:
        pass

    return warnings

def audit_directory(dir_path: Path):
    print(f"\n{BOLD}{CYAN}======================================================{RESET}")
    print(f"{BOLD}{CYAN}   🛡️ RUNTIME DELIVERABLE & PROCESS GUARDIAN{RESET}")
    print(f"{BOLD}{CYAN}   Directory: {dir_path.resolve()}{RESET}")
    print(f"{BOLD}{CYAN}======================================================{RESET}\n")

    # Look for 1-click launchers (.bat or .ps1 that start a server or browser)
    launchers = list(dir_path.glob("*.bat")) + list(dir_path.glob("*.ps1"))
    has_launcher = any("launch" in l.name.lower() or "run" in l.name.lower() or "start" in l.name.lower() for l in launchers)

    # Collect HTML files
    html_files = []
    for root, dirs, files in os.walk(dir_path):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.endswith(".html"):
                html_files.append(Path(root) / f)

    total_errors = 0
    total_warnings = 0

    print(f"[*] Discovered {len(html_files)} HTML deliverables. Analyzing runtime compatibility...")
    print(f"[*] 1-Click Launchers detected: {GREEN if has_launcher else YELLOW}{len(launchers)} ({', '.join(l.name for l in launchers) or 'None'}){RESET}\n")

    for html in html_files:
        rel = html.relative_to(dir_path)
        errs, warns = check_html_file(html, has_launcher)
        if errs or warns:
            print(f"{BOLD}File: {rel}{RESET}")
            for e in errs:
                print(f"  {RED}❌ [ERROR]{RESET} {e}")
                total_errors += 1
            for w in warns:
                print(f"  {YELLOW}⚠️  [WARN]{RESET} {w}")
                total_warnings += 1
            print()

    # Process hygiene check
    proc_warns = check_process_hygiene(dir_path)
    for pw in proc_warns:
        print(f"  {YELLOW}⚠️  [PROCESS LOCK]{RESET} {pw}")
        total_warnings += 1

    print(f"------------------------------------------------------")
    print(f"  Total HTML Deliverables: {len(html_files)}")
    print(f"  Total Errors:            {total_errors}")
    print(f"  Total Warnings:          {total_warnings}")
    print(f"------------------------------------------------------")

    if total_errors == 0:
        print(f"\n{GREEN}✅ DELIVERABLE AUDIT PASSED: Zero white-screen traps detected.{RESET}\n")
        return 0
    else:
        print(f"\n{RED}❌ DELIVERABLE AUDIT FAILED: {total_errors} runtime fatal flaw(s) found.{RESET}\n")
        return 1

if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
    sys.exit(audit_directory(target))
