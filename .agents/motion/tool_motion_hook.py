#!/usr/bin/env python3
"""
Ultra-Fast Non-Blocking Claude Code Tool Motion Hook
Execution SLA: <15ms total execution time.
Reads stdin event from Claude Code PreToolUse / PostToolUse hook, appends to JSONL event log,
atomically syncs motion-studio/src/data/current_tool_call.json, and exits 0 immediately.
"""

import sys
import os
import json
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EVENT_LOG = os.path.join(SCRIPT_DIR, "tool_events.jsonl")
TARGET_JSON = os.path.abspath(
    os.path.join(SCRIPT_DIR, "..", "..", "motion-studio", "src", "data", "current_tool_call.json")
)

def main():
    try:
        raw_input = ""
        if not sys.stdin.isatty():
            raw_input = sys.stdin.read()

        event_data = {}
        if raw_input.strip():
            try:
                event_data = json.loads(raw_input)
            except Exception:
                event_data = {"raw": raw_input}

        phase = sys.argv[1] if len(sys.argv) > 1 else "pre"
        event_data["phase"] = phase
        event_data["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # 1. Append event to atomic log file
        os.makedirs(os.path.dirname(EVENT_LOG), exist_ok=True)
        with open(EVENT_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(event_data) + "\n")

        # 2. Atomic state update for Remotion live preview & HUD
        tool_name = event_data.get("tool_name", "Write")
        tool_input = event_data.get("tool_input", {})
        status = "completed" if phase == "post" else "executing"

        payload = {
            "tool": tool_name,
            "toolName": tool_name,
            "status": status,
            "toolInput": tool_input,
            "args": tool_input,
            "durationMs": event_data.get("duration_ms", 0),
            "timestamp": event_data["timestamp"],
            "composition": "ToolCallHUD",
            "theme": "cyberpunk"
        }

        os.makedirs(os.path.dirname(TARGET_JSON), exist_ok=True)
        temp_file = TARGET_JSON + ".tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        os.replace(temp_file, TARGET_JSON)

    except Exception:
        pass  # Never break Claude Code tool execution

    # 3. Mandatory Claude Code hook protocol output
    output = {
        "continue": True,
        "suppressOutput": True
    }
    sys.stdout.write(json.dumps(output))
    sys.stdout.flush()
    sys.exit(0)

if __name__ == "__main__":
    main()
