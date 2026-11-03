#!/usr/bin/env python3
"""
Tool Call Motion Graphics Trigger: Intercepts Tool Invocations, Emits State & Triggers Remotion 60FPS
Non-blocking execution guarantee (<15ms).
"""

import sys
import os
import json
import time
import threading
import subprocess
from typing import Dict, Any

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MOTION_STUDIO = os.path.join(SCRIPT_DIR, "motion-studio")
DATA_FILE = os.path.join(MOTION_STUDIO, "src", "data", "current_tool_call.json")
OUT_DIR = os.path.join(MOTION_STUDIO, "out")

class ToolMotionTrigger:
    TOOL_COMPOSITION_MAP = {
        "Bash": "ToolCallHUD",
        "Write": "ToolCallHUD",
        "Edit": "ToolCallHUD",
        "Read": "ToolCallHUD",
        "Grep": "ToolCallHUD",
        "Glob": "ToolCallHUD"
    }

    @classmethod
    def emit_tool_event(cls, tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """Emits event state atomically in <15ms without blocking."""
        t0 = time.time()
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        os.makedirs(OUT_DIR, exist_ok=True)

        comp_id = cls.TOOL_COMPOSITION_MAP.get(tool_name, "ToolCallHUD")
        event_payload = {
            "tool": tool_name,
            "toolName": tool_name,
            "args": args,
            "toolInput": args,
            "status": "executing",
            "durationMs": 0,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "composition": comp_id,
            "theme": "cyberpunk"
        }

        # Atomic file replace
        temp_file = DATA_FILE + ".tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(event_payload, f, indent=2)
        os.replace(temp_file, DATA_FILE)

        # Fire background rendering thread (completely non-blocking)
        thread = threading.Thread(
            target=cls._render_background_still,
            args=(comp_id, tool_name),
            daemon=True
        )
        thread.start()

        elapsed_ms = (time.time() - t0) * 1000.0
        return {
            "status": "dispatched",
            "latency_ms": round(elapsed_ms, 2),
            "event": event_payload
        }

    @classmethod
    def _render_background_still(cls, comp_id: str, tool_name: str):
        """Asynchronously triggers fast still frame render in background."""
        out_png = os.path.join(OUT_DIR, f"_tool_{tool_name}.png")
        cmd = [
            "npx.cmd" if os.name == "nt" else "npx",
            "remotion", "still",
            "src/index.ts",
            comp_id,
            out_png,
            "--frame=15"
        ]
        try:
            subprocess.run(cmd, cwd=MOTION_STUDIO, capture_output=True, timeout=20)
        except Exception:
            pass

def main():
    tool = sys.argv[1] if len(sys.argv) > 1 else "Bash"
    try:
        args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {"command": "git status"}
    except Exception:
        args = {"raw": sys.argv[2]} if len(sys.argv) > 2 else {}
    res = ToolMotionTrigger.emit_tool_event(tool, args)
    print(json.dumps(res))
    return 0

if __name__ == "__main__":
    sys.exit(main())
