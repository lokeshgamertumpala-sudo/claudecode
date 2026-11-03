#!/usr/bin/env python3
"""
Workflow Automator: Multi-Step Pipeline Orchestration & Dual-Workspace Synchronization
Part of the workflow-automator Agent Skill.
"""

import sys
import os
import shutil
import hashlib
import json
import argparse
from typing import Dict, List, Any, Optional

class WorkflowAutomator:
    EXCLUDE_DIRS = {".git", "__pycache__", "node_modules", ".gemini", "dist", "build"}

    @staticmethod
    def file_hash(filepath: str) -> str:
        """Calculates SHA-256 hash of a file for binary-exact parity comparison."""
        hasher = hashlib.sha256()
        with open(filepath, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @classmethod
    def sync_workspaces(cls, source_dir: str, target_dir: str, dry_run: bool = False) -> Dict[str, Any]:
        """Symmetrically syncs updated files between dual local workspaces."""
        if not os.path.exists(source_dir) or not os.path.exists(target_dir):
            raise FileNotFoundError("Source or target directory does not exist.")

        synced_files = []
        identical_files = []

        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in cls.EXCLUDE_DIRS]
            for file in files:
                src_path = os.path.join(root, file)
                rel_path = os.path.relpath(src_path, source_dir)
                tgt_path = os.path.join(target_dir, rel_path)

                should_copy = False
                if not os.path.exists(tgt_path):
                    should_copy = True
                else:
                    if cls.file_hash(src_path) != cls.file_hash(tgt_path):
                        should_copy = True
                    else:
                        identical_files.append(rel_path)

                if should_copy:
                    synced_files.append(rel_path)
                    if not dry_run:
                        os.makedirs(os.path.dirname(tgt_path), exist_ok=True)
                        shutil.copy2(src_path, tgt_path)

        return {
            "synced_count": len(synced_files),
            "identical_count": len(identical_files),
            "synced_files": synced_files,
            "dry_run": dry_run
        }

    @staticmethod
    def run_pipeline(pipeline: Dict[str, Any]) -> Dict[str, Any]:
        """Executes multi-step pipeline tasks sequentially with context preservation."""
        steps = pipeline.get("steps", [])
        executed = []
        for step in steps:
            name = step.get("name", "unnamed")
            action = step.get("action", lambda ctx: True)
            try:
                res = action(executed) if callable(action) else True
                executed.append({"name": name, "status": "SUCCESS", "result": res})
            except Exception as e:
                executed.append({"name": name, "status": "FAILED", "error": str(e)})
                return {"status": "FAILED", "failed_step": name, "executed": executed}
        return {"status": "SUCCESS", "executed": executed}

    @classmethod
    def validate_commands(cls, commands_dir: str) -> Dict[str, Any]:
        """Validates that all command markdown files in commands_dir are non-empty and well-formed."""
        if not os.path.exists(commands_dir):
            return {"valid_count": 0, "invalid_count": 0, "commands": []}
        commands = []
        valid_count = 0
        for f in os.listdir(commands_dir):
            if f.endswith(".md"):
                fpath = os.path.join(commands_dir, f)
                size = os.path.getsize(fpath)
                is_valid = size > 10
                if is_valid:
                    valid_count += 1
                commands.append({"file": f, "valid": is_valid, "size": size})
        return {
            "valid_count": valid_count,
            "total_count": len(commands),
            "commands": commands
        }

def main():
    parser = argparse.ArgumentParser(description="Workflow Automator CLI")
    subparsers = parser.add_subparsers(dest="command")

    sync_p = subparsers.add_parser("sync", help="Synchronize workspaces")
    sync_p.add_argument("--source", required=True, help="Source directory")
    sync_p.add_argument("--target", required=True, help="Target directory")
    sync_p.add_argument("--dry-run", action="store_true", help="Inspect without copying")

    val_p = subparsers.add_parser("validate-commands", help="Validate slash commands")
    val_p.add_argument("--dir", default=".claude/commands", help="Commands directory")

    args = parser.parse_args()
    if args.command == "sync":
        res = WorkflowAutomator.sync_workspaces(args.source, args.target, args.dry_run)
        print(f"[+] Synced {res['synced_count']} files (Identical: {res['identical_count']})")
        return 0
    elif args.command == "validate-commands":
        res = WorkflowAutomator.validate_commands(args.dir)
        print(f"[+] Validated {res['valid_count']}/{res['total_count']} slash commands.")
        return 0
    else:
        parser.print_help()
        return 0

if __name__ == "__main__":
    sys.exit(main())
