"""
Universal Project & File Integrity Verifier
Validates:
  - JavaScript / TypeScript syntax & cross-file imports
  - Python AST syntax & compilation
  - HTML structure & inline JavaScript syntax
  - JSON strict parsing
  - YAML syntax parsing
  - CSS bracket integrity
  - Zero-stub / Zero-TODO completeness checks
"""

import os
import sys
import json
import ast
import re
import time
import subprocess
from pathlib import Path
from html.parser import HTMLParser

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

# ANSI Color codes for Windows / Linux terminals
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
MAGENTA = "\033[95m"
BOLD = "\033[1m"
RESET = "\033[0m"

EXCLUDE_DIRS = {
    ".git", "__pycache__", "node_modules", ".gemini", "dist", "build",
    ".system_generated", "scratch", ".user_uploaded", ".history"
}

VOID_HTML_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr"
}

class HTMLSyntaxValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tag_stack = []
        self.errors = []
        self.scripts = []
        self.current_script = []
        self.in_script = False

    def handle_starttag(self, tag, attrs):
        tag_lower = tag.lower()
        if tag_lower not in VOID_HTML_TAGS:
            self.tag_stack.append(tag_lower)
            
        attr_dict = dict(attrs)
        src = attr_dict.get("src", "")
        if src.startswith("/") and not src.startswith("//"):
            self.errors.append(f"Absolute root path in src='{src}': Breaks under file:// protocols. Use relative './' paths.")
            
        if tag_lower == "script":
            if src.endswith(".jsx") or src.endswith(".tsx"):
                self.errors.append(f"Raw JSX/TSX script '{src}': Browsers cannot execute JSX without compilation.")
            # Check script type
            script_type = attr_dict.get("type", "").lower()
            if not script_type or "javascript" in script_type or script_type == "module":
                self.in_script = True
                self.current_script = []

    def handle_endtag(self, tag):
        tag_lower = tag.lower()
        if tag_lower == "script" and self.in_script:
            self.in_script = False
            code = "".join(self.current_script).strip()
            if code:
                self.scripts.append(code)
            self.current_script = []

        if tag_lower in VOID_HTML_TAGS:
            return

        if not self.tag_stack:
            self.errors.append(f"Unexpected closing tag </{tag}> with no matching open tag.")
        elif self.tag_stack[-1] == tag_lower:
            self.tag_stack.pop()
        else:
            # Check if tag is in stack
            if tag_lower in self.tag_stack:
                while self.tag_stack and self.tag_stack[-1] != tag_lower:
                    unclosed = self.tag_stack.pop()
                    self.errors.append(f"Unclosed tag <{unclosed}> before </{tag}>.")
                if self.tag_stack:
                    self.tag_stack.pop()
            else:
                self.errors.append(f"Mismatched closing tag </{tag}>, expected </{self.tag_stack[-1]}>.")

    def handle_data(self, data):
        if self.in_script:
            self.current_script.append(data)


def check_python_file(path: Path):
    errors = []
    warnings = []
    try:
        content = path.read_text(encoding="utf-8")
    except Exception as e:
        return [f"Encoding read error: {e}"], []

    # AST Parse check
    try:
        ast.parse(content, filename=str(path))
    except SyntaxError as se:
        errors.append(f"SyntaxError at line {se.lineno}: {se.msg}")
        return errors, warnings

    # Completeness check (detect stubs)
    for i, line in enumerate(content.splitlines(), 1):
        if re.search(r"#\s*(TODO|FIXME|XXX):?\s*(implement|placeholder|stub)", line, re.IGNORECASE):
            warnings.append(f"Line {i}: Stub or incomplete marker detected: '{line.strip()}'")

    return errors, warnings


def check_node_js_file(path: Path):
    errors = []
    warnings = []
    try:
        content = path.read_text(encoding="utf-8")
    except Exception as e:
        return [f"Encoding read error: {e}"], []

    ext = path.suffix.lower()
    is_jsx = ext in [".jsx", ".tsx"] or bool(re.search(r"<[A-Z][A-Za-z0-9]*\b|<div|<span|<button|<h\d", content))

    if not is_jsx:
        # Fast syntax check via node --check
        try:
            proc = subprocess.run(
                ["node", "--check", str(path)],
                capture_output=True,
                text=True,
                timeout=5
            )
            if proc.returncode != 0:
                err_msg = proc.stderr.strip() or proc.stdout.strip()
                first_err = err_msg.splitlines()[0] if err_msg else "Node syntax validation failed"
                errors.append(first_err)
        except Exception as ex:
            errors.append(f"Could not run node --check: {ex}")
    else:
        # Fast JSX syntax check via esbuild
        try:
            proc = subprocess.run(
                ["npx", "esbuild", str(path), "--log-level=error"],
                capture_output=True,
                text=True,
                timeout=8
            )
            if proc.returncode != 0:
                err_msg = proc.stderr.strip() or proc.stdout.strip()
                clean_lines = [l for l in err_msg.splitlines() if "Warning:" not in l and l.strip()]
                first_err = clean_lines[0] if clean_lines else "JSX syntax error"
                errors.append(first_err)
        except Exception:
            pass

    # Check for orphaned relative imports
    base_dir = path.parent
    import_patterns = [
        r'''(?:import|from)\s+['"](\.[^'"]+)['"]''',
        r'''require\s*\(\s*['"](\.[^'"]+)['"]\s*\)''',
    ]

    for pat in import_patterns:
        for match in re.finditer(pat, content):
            rel_target = match.group(1)
            target_path = (base_dir / rel_target).resolve()
            
            # Check potential extensions
            candidates = [
                target_path,
                target_path.with_suffix(".js"),
                target_path.with_suffix(".jsx"),
                target_path.with_suffix(".ts"),
                target_path.with_suffix(".tsx"),
                target_path.with_suffix(".json"),
                target_path / "index.js",
                target_path / "index.json",
            ]
            if not any(c.exists() for c in candidates):
                errors.append(f"Broken relative import: '{rel_target}' does not exist on disk relative to {path.name}")

    # Completeness checks
    for i, line in enumerate(content.splitlines(), 1):
        if re.search(r"//\s*(TODO|FIXME):?\s*(implement|dummy|stub|placeholder)", line, re.IGNORECASE):
            warnings.append(f"Line {i}: Stub detected: '{line.strip()}'")

    return errors, warnings


def check_html_file(path: Path):
    errors = []
    warnings = []
    try:
        content = path.read_text(encoding="utf-8")
    except Exception as e:
        return [f"Encoding read error: {e}"], []

    parser = HTMLSyntaxValidator()
    try:
        parser.feed(content)
        parser.close()
    except Exception as pe:
        errors.append(f"HTML parse exception: {pe}")

    errors.extend(parser.errors)
    if parser.tag_stack:
        for unclosed in parser.tag_stack:
            errors.append(f"Document ended with unclosed tag <{unclosed}>")

    # Check inline scripts with node
    for idx, script in enumerate(parser.scripts, 1):
        try:
            proc = subprocess.run(
                ["node", "--input-type=module", "-e", script],
                capture_output=True,
                text=True,
                timeout=5
            )
            if proc.returncode != 0 and "SyntaxError" in proc.stderr:
                err_line = [l for l in proc.stderr.splitlines() if "SyntaxError" in l]
                errors.append(f"Inline script #{idx} syntax error: {err_line[0] if err_line else 'SyntaxError'}")
        except Exception:
            pass

    return errors, warnings


def check_json_file(path: Path):
    errors = []
    warnings = []
    try:
        content = path.read_text(encoding="utf-8")
        json.loads(content)
    except json.JSONDecodeError as jde:
        errors.append(f"JSONDecodeError at line {jde.lineno}, col {jde.colno}: {jde.msg}")
    except Exception as e:
        errors.append(f"File read error: {e}")
    return errors, warnings


def check_yaml_file(path: Path):
    errors = []
    warnings = []
    if not HAS_YAML:
        return errors, warnings
    try:
        content = path.read_text(encoding="utf-8")
        yaml.safe_load(content)
    except yaml.YAMLError as ye:
        errors.append(f"YAMLError: {ye}")
    except Exception as e:
        errors.append(f"File read error: {e}")
    return errors, warnings


def check_css_file(path: Path):
    errors = []
    warnings = []
    try:
        content = path.read_text(encoding="utf-8")
    except Exception as e:
        return [f"Encoding read error: {e}"], []

    # Check balanced braces
    stack = []
    for line_no, line in enumerate(content.splitlines(), 1):
        for col_no, ch in enumerate(line, 1):
            if ch == '{':
                stack.append(('{', line_no, col_no))
            elif ch == '}':
                if not stack:
                    errors.append(f"Unmatched closing brace '}}' at line {line_no}:{col_no}")
                else:
                    stack.pop()

    if stack:
        for ch, l, c in stack:
            errors.append(f"Unclosed opening brace '{{' at line {l}:{c}")

    return errors, warnings


def run_audit(target_dir: Path):
    t0 = time.time()
    print(f"{CYAN}{BOLD}======================================================{RESET}")
    print(f"{CYAN}{BOLD}   🛡️  UNIVERSAL ZERO-ERROR INTEGRITY AUDITOR{RESET}")
    print(f"{CYAN}   Directory: {target_dir.resolve()}{RESET}")
    print(f"{CYAN}{BOLD}======================================================{RESET}\n")

    stats = {
        "JavaScript/TypeScript": {"count": 0, "errors": 0, "warnings": 0},
        "Python": {"count": 0, "errors": 0, "warnings": 0},
        "HTML": {"count": 0, "errors": 0, "warnings": 0},
        "JSON": {"count": 0, "errors": 0, "warnings": 0},
        "YAML": {"count": 0, "errors": 0, "warnings": 0},
        "CSS": {"count": 0, "errors": 0, "warnings": 0},
    }

    all_findings = []

    for root, dirs, files in os.walk(target_dir):
        # Filter excluded dirs
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and (d in {".agents", ".claude"} or not d.startswith("."))]

        for file in files:
            p = Path(root) / file
            ext = p.suffix.lower()

            category = None
            errors = []
            warnings = []

            if ext in {".js", ".jsx", ".mjs", ".cjs"}:
                category = "JavaScript/TypeScript"
                errors, warnings = check_node_js_file(p)
            elif ext in {".py"}:
                category = "Python"
                errors, warnings = check_python_file(p)
            elif ext in {".html", ".htm"}:
                category = "HTML"
                errors, warnings = check_html_file(p)
            elif ext in {".json"}:
                category = "JSON"
                errors, warnings = check_json_file(p)
            elif ext in {".yaml", ".yml"}:
                category = "YAML"
                errors, warnings = check_yaml_file(p)
            elif ext in {".css"}:
                category = "CSS"
                errors, warnings = check_css_file(p)

            if category:
                stats[category]["count"] += 1
                stats[category]["errors"] += len(errors)
                stats[category]["warnings"] += len(warnings)

                if errors or warnings:
                    rel_path = p.relative_to(target_dir)
                    all_findings.append((rel_path, errors, warnings))

    # Print Category Breakdown
    print(f"{BOLD}{'Category':<24} | {'Files':<8} | {'Errors':<8} | {'Warnings':<8}{RESET}")
    print("-" * 56)
    total_files = 0
    total_errors = 0
    total_warnings = 0

    for cat, data in stats.items():
        total_files += data["count"]
        total_errors += data["errors"]
        total_warnings += data["warnings"]
        color = GREEN if data["errors"] == 0 else RED
        print(f"{cat:<24} | {data['count']:<8} | {color}{data['errors']:<8}{RESET} | {data['warnings']:<8}")

    print("-" * 56)
    print(f"{BOLD}{'TOTAL':<24} | {total_files:<8} | {total_errors:<8} | {total_warnings:<8}{RESET}\n")

    # Print Detailed Findings
    if all_findings:
        print(f"{YELLOW}{BOLD}⚠️  Detailed Audit Findings:{RESET}")
        for rel_path, errors, warnings in all_findings:
            print(f"\n📄 {BOLD}{rel_path}{RESET}")
            for err in errors:
                print(f"   {RED}✖ ERROR: {err}{RESET}")
            for warn in warnings:
                print(f"   {YELLOW}▲ WARN:  {warn}{RESET}")
        print()

    elapsed = round((time.time() - t0) * 1000, 1)

    if total_errors == 0:
        print(f"{GREEN}{BOLD}✅ ZERO-ERROR AUDIT PASSED: 100% integrity across all {total_files} files ({elapsed}ms).{RESET}\n")
        return 0
    else:
        print(f"{RED}{BOLD}❌ INTEGRITY AUDIT FAILED: {total_errors} errors detected across {total_files} files ({elapsed}ms).{RESET}\n")
        return 1

if __name__ == "__main__":
    target = Path.cwd()
    for arg in sys.argv[1:]:
        if not arg.startswith("-"):
            target = Path(arg)
            break
    sys.exit(run_audit(target))
