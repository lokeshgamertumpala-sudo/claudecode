#!/usr/bin/env python3
"""
Codebase Analyzer: Deep Codebase Analytics, Dependency Graph, Security & Performance Profiler
Part of the codebase-analyzer Agent Skill.
"""

import sys
import os
import ast
import re
import json
import argparse
from typing import Dict, List, Any, Set

class CodebaseAnalyzer:
    EXCLUDE_DIRS = {".git", "__pycache__", "node_modules", ".gemini", "dist", "build", ".agents", ".claude"}

    @classmethod
    def get_metrics(cls, root_dir: str) -> Dict[str, Any]:
        """Calculates total files, lines of code, and language breakdown."""
        metrics = {
            "total_files": 0,
            "total_lines": 0,
            "languages": {},
            "complexity": {"low": 0, "medium": 0, "high": 0}
        }
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in cls.EXCLUDE_DIRS]
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in (".py", ".ts", ".tsx", ".js", ".jsx", ".html", ".css", ".json", ".yaml", ".yml"):
                    file_path = os.path.join(root, file)
                    metrics["total_files"] += 1
                    lang = ext[1:]
                    metrics["languages"].setdefault(lang, {"files": 0, "lines": 0})
                    metrics["languages"][lang]["files"] += 1
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            lines = len(f.readlines())
                            metrics["total_lines"] += lines
                            metrics["languages"][lang]["lines"] += lines
                    except Exception:
                        pass
        return metrics

    @classmethod
    def get_dependency_graph(cls, root_dir: str) -> Dict[str, Any]:
        """Builds module import dependency graph, identifies cycles and orphaned files."""
        graph: Dict[str, Set[str]] = {}
        all_modules: Set[str] = set()

        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in cls.EXCLUDE_DIRS]
            for file in files:
                if file.endswith(".py"):
                    mod_name = os.path.splitext(file)[0]
                    all_modules.add(mod_name)
                    graph[mod_name] = set()
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            tree = ast.parse(f.read())
                        for node in ast.walk(tree):
                            if isinstance(node, ast.Import):
                                for alias in node.names:
                                    graph[mod_name].add(alias.name.split('.')[0])
                            elif isinstance(node, ast.ImportFrom) and node.module:
                                graph[mod_name].add(node.module.split('.')[0])
                    except Exception:
                        pass

        # Detect cycles via DFS
        cycles = []
        def dfs(node: str, visited: Set[str], path: List[str]):
            visited.add(node)
            path.append(node)
            for neighbor in graph.get(node, set()):
                if neighbor in all_modules:
                    if neighbor in path:
                        cycle_idx = path.index(neighbor)
                        cycle = path[cycle_idx:] + [neighbor]
                        cycles.append(" -> ".join(cycle))
                    elif neighbor not in visited:
                        dfs(neighbor, visited, path)
            path.pop()

        visited_nodes: Set[str] = set()
        for node in all_modules:
            if node not in visited_nodes:
                dfs(node, visited_nodes, [])

        # Find orphans (modules never imported by another local module)
        imported = {target for deps in graph.values() for target in deps}
        orphans = [m for m in all_modules if m not in imported and m not in ("main", "test_all", "setup")]

        return {
            "modules_count": len(all_modules),
            "cycles": list(set(cycles)),
            "orphans": orphans
        }

    @classmethod
    def security_scan(cls, root_dir: str) -> Dict[str, Any]:
        """Scans for hardcoded secrets, API keys, and dangerous runtime calls."""
        violations = []
        patterns = [
            (r'(?i)(api[_-]?key|secret|password|token)\s*=\s*["\'][A-Za-z0-9_\-]{16,}["\']', "Hardcoded Secret / API Key"),
            (r'\beval\s*\(', "Dangerous eval() call"),
            (r'\bexec\s*\(', "Dangerous exec() call"),
            (r'subprocess\.(run|Popen|call)\s*\(.*shell\s*=\s*True', "Dangerous shell=True execution")
        ]

        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in cls.EXCLUDE_DIRS]
            for file in files:
                if file.endswith((".py", ".js", ".ts")):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            for i, line in enumerate(f, 1):
                                for pat, desc in patterns:
                                    if re.search(pat, line):
                                        violations.append({
                                            "file": os.path.relpath(file_path, root_dir),
                                            "line": i,
                                            "issue": desc,
                                            "snippet": line.strip()[:80]
                                        })
                    except Exception:
                        pass
        return {"violations_count": len(violations), "violations": violations}

def main():
    parser = argparse.ArgumentParser(description="Codebase Analyzer CLI")
    parser.add_argument("command", choices=["metrics", "deps", "security", "full"], default="full", nargs="?")
    parser.add_argument("--path", default=".")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    results = {}
    if args.command in ("metrics", "full"):
        results["metrics"] = CodebaseAnalyzer.get_metrics(args.path)
    if args.command in ("deps", "full"):
        results["dependencies"] = CodebaseAnalyzer.get_dependency_graph(args.path)
    if args.command in ("security", "full"):
        results["security"] = CodebaseAnalyzer.security_scan(args.path)

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("=" * 60)
        print("   🔍 CODEBASE ANALYTICS REPORT")
        print("=" * 60)
        if "metrics" in results:
            m = results["metrics"]
            print(f" • Files: {m['total_files']} | Total Lines: {m['total_lines']}")
        if "dependencies" in results:
            d = results["dependencies"]
            print(f" • Modules: {d['modules_count']} | Cycles: {len(d['cycles'])} | Orphans: {len(d['orphans'])}")
        if "security" in results:
            s = results["security"]
            print(f" • Security Violations: {s['violations_count']}")
        print("=" * 60)
    return 0

if __name__ == "__main__":
    sys.exit(main())
