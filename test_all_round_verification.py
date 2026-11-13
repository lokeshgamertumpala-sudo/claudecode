#!/usr/bin/env python3
"""
🛡️ Master Verification Test Suite: All-Round Claude Code Multi-Agent System
Verifies:
  1. Proxy Health Readiness (http://127.0.0.1:4000/health/readiness)
  2. Prompt Sanitization (Zero [1-SHOT MOTION MANDATE] injection into user messages)
  3. Casual Greeting Integrity (Warm natural greeting, zero reasoning leaks)
  4. Explicit Motion Isolation (Remotion directives trigger only on explicit /motion)
  5. Multi-Agent Suite & Tool Calling Preservation (.claude/agents/ 5-agent fleet)
  6. Universal Zero-Error Verifier (100% integrity across workspace)
"""

import sys
import os
import json
import time
import urllib.request
import urllib.error
import subprocess
import unittest
import asyncio

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

PROXY_URL = "http://127.0.0.1:4000"
PROXY_KEY = "sk-litellm-proxy-key"

GREEN = "\033[92m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


class TestProxyHealth(unittest.TestCase):
    def test_health_readiness_endpoint(self):
        """Verify LiteLLM proxy responds 200 OK and reports healthy."""
        url = f"{PROXY_URL}/health/readiness"
        t0 = time.perf_counter()
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            elapsed = (time.perf_counter() - t0) * 1000.0
            self.assertEqual(resp.status, 200, "Health endpoint must return 200 OK")
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data.get("status"), "healthy", "Proxy status must be 'healthy'")
            self.assertLess(elapsed, 250.0, f"Readiness latency too high: {elapsed:.1f}ms")


class TestPromptSanitization(unittest.TestCase):
    def test_user_message_not_injected_with_mandate(self):
        """Verify user messages are passed authentically without [1-SHOT MOTION MANDATE]."""
        from sanitize_hook import RequestSanitizer
        sanitizer = RequestSanitizer()

        test_messages = [
            "Write a Python script to compute prime numbers",
            "Fix the bug in src/auth.ts where token verification fails",
            "Design a modular microservice architecture for billing"
        ]

        claude_md_path = os.path.join(PROJECT_ROOT, "CLAUDE.md")
        system_prompt = ""
        if os.path.exists(claude_md_path):
            with open(claude_md_path, "r", encoding="utf-8") as f:
                system_prompt = f.read()

        for user_text in test_messages:
            payload = {
                "model": "claude-sonnet-5",
                "system": system_prompt,
                "messages": [{"role": "user", "content": user_text}]
            }

            asyncio.run(sanitizer.async_pre_call_hook(data=payload))

            last_msg = payload["messages"][-1]["content"]
            self.assertNotIn("[1-SHOT MOTION MANDATE:", last_msg,
                             f"Mandate injected into user prompt: {user_text}")
            self.assertNotIn("[ACTION MANDATE:", last_msg,
                             f"Action mandate injected into user prompt: {user_text}")
            self.assertEqual(last_msg, user_text, "User message content must remain un-mutated")


class TestCasualGreeting(unittest.TestCase):
    def test_greeting_natural_response_and_zero_leaks(self):
        """Verify casual greeting receives a warm response without reasoning leaks."""
        url = f"{PROXY_URL}/v1/messages"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": PROXY_KEY,
            "anthropic-version": "2023-06-01"
        }
        data = {
            "model": "claude-sonnet-5",
            "max_tokens": 150,
            "messages": [{"role": "user", "content": "hiii"}]
        }

        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=35) as resp:
                self.assertEqual(resp.status, 200)
                body = json.loads(resp.read().decode("utf-8"))

                content_blocks = body.get("content", [])
                full_text = " ".join(b.get("text", "") for b in content_blocks if isinstance(b, dict) and b.get("type") == "text")

                # Check warm greeting response
                self.assertTrue(any(w in full_text.lower() for w in ("hi", "hello", "help", "how", "welcome")),
                                f"Expected greeting in response: {full_text}")

                # Verify zero mandate or motion leak
                self.assertNotIn("[1-shot motion mandate", full_text.lower())
                self.assertNotIn("motion-studio", full_text.lower())
                self.assertNotIn("remotion", full_text.lower())

                # Verify zero reasoning leaks in text blocks
                forbidden_leaks = [
                    "the user said \"hiii\"",
                    "system prompt has injected",
                    "i don't need to mention my model identity",
                    "<think>", "</think>"
                ]
                for leak in forbidden_leaks:
                    self.assertNotIn(leak, full_text.lower(), f"Reasoning leaked into user response: {leak}")
        except urllib.error.URLError as e:
            self.fail(f"Failed to communicate with proxy: {e}")


class TestExplicitMotionIsolation(unittest.TestCase):
    def test_motion_directives_activate_only_when_requested(self):
        """Verify motion directives activate only for explicit /motion requests."""
        from sanitize_hook import RequestSanitizer
        sanitizer = RequestSanitizer()

        # 1. Non-motion request
        data_normal = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": "Build a REST API endpoint in Express"}]
        }
        asyncio.run(sanitizer.async_pre_call_hook(data=data_normal))
        sys_normal = str(data_normal.get("system", ""))
        self.assertNotIn("[CRITICAL 1-SHOT DIRECT ACTION MANDATE", sys_normal)

        # 2. Explicit motion request
        data_motion = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": "/motion create a 60FPS futuristic cyber HUD"}]
        }
        asyncio.run(sanitizer.async_pre_call_hook(data=data_motion))
        sys_motion = str(data_motion.get("system", ""))
        self.assertIn("[CRITICAL 1-SHOT DIRECT ACTION MANDATE", sys_motion)


class TestMultiAgentSuite(unittest.TestCase):
    REQUIRED_AGENTS = [
        "fullstack-developer.md",
        "code-reviewer.md",
        "bug-hunter.md",
        "system-architect.md",
        "motion-director.md"
    ]

    def test_agents_presence_and_syntax(self):
        """Verify all 5 required agents exist in .claude/agents/ with valid YAML frontmatter."""
        agents_dir = os.path.join(PROJECT_ROOT, ".claude", "agents")
        self.assertTrue(os.path.isdir(agents_dir), f"Missing agents directory: {agents_dir}")

        for agent_file in self.REQUIRED_AGENTS:
            fpath = os.path.join(agents_dir, agent_file)
            self.assertTrue(os.path.isfile(fpath), f"Missing required agent: {agent_file}")

            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()

            self.assertTrue(content.startswith("---"), f"{agent_file} must begin with frontmatter ---")
            parts = content.split("---", 2)
            self.assertGreaterEqual(len(parts), 3, f"{agent_file} must have closed frontmatter ---")

            frontmatter = parts[1]
            self.assertIn("name:", frontmatter, f"{agent_file} frontmatter missing 'name'")
            self.assertIn("description:", frontmatter, f"{agent_file} frontmatter missing 'description'")
            self.assertIn("tools:", frontmatter, f"{agent_file} frontmatter missing 'tools'")

            body = parts[2].strip()
            self.assertGreater(len(body), 100, f"{agent_file} instructions too short")

    def test_tools_preserved_for_agent_and_coding_tasks(self):
        """Verify tools and thinking are preserved for coding/agent workflows."""
        from sanitize_hook import RequestSanitizer
        sanitizer = RequestSanitizer()

        dummy_tools = [{"type": "function", "function": {"name": "Write", "description": "Write file"}}]
        payload = {
            "model": "claude-sonnet-5",
            "tools": dummy_tools,
            "messages": [{"role": "user", "content": "Use fullstack-developer to create an API endpoint"}]
        }
        asyncio.run(sanitizer.async_pre_call_hook(data=payload))
        self.assertIn("tools", payload, "Tools must NOT be stripped for agent workflows")
        self.assertEqual(payload["tools"], dummy_tools)


class TestUniversalVerifier(unittest.TestCase):
    def test_run_universal_verifier(self):
        """Verify all workspace files pass the Zero-Error Universal Verifier."""
        script = os.path.join(PROJECT_ROOT, ".agents", "skills", "zero-error-architect", "scripts", "universal_verifier.py")
        self.assertTrue(os.path.exists(script), f"Missing verifier script: {script}")

        res = subprocess.run([sys.executable, script], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"Universal Verifier failed:\n{res.stdout}\n{res.stderr}")
        self.assertIn("ZERO-ERROR AUDIT PASSED", res.stdout)


def run_suite():
    print(f"\n{CYAN}{BOLD}======================================================================{RESET}")
    print(f"{CYAN}{BOLD}   🛡️  MASTER VERIFICATION SUITE: ALL-ROUND CLAUDE CODE MULTI-AGENT    {RESET}")
    print(f"{CYAN}{BOLD}======================================================================{RESET}")

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(TestProxyHealth))
    suite.addTests(loader.loadTestsFromTestCase(TestPromptSanitization))
    suite.addTests(loader.loadTestsFromTestCase(TestCasualGreeting))
    suite.addTests(loader.loadTestsFromTestCase(TestExplicitMotionIsolation))
    suite.addTests(loader.loadTestsFromTestCase(TestMultiAgentSuite))
    suite.addTests(loader.loadTestsFromTestCase(TestUniversalVerifier))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print(f"{CYAN}{BOLD}======================================================================{RESET}")
    if result.wasSuccessful():
        print(f"{GREEN}{BOLD}✅ ALL VERIFICATION TESTS PASSED (100% OK) - EXIT CODE 0{RESET}")
        print(f"{CYAN}{BOLD}======================================================================{RESET}\n")
        return 0
    else:
        print(f"{RED}{BOLD}❌ VERIFICATION FAILED: {len(result.failures)} failures, {len(result.errors)} errors{RESET}")
        print(f"{CYAN}{BOLD}======================================================================{RESET}\n")
        return 1

if __name__ == "__main__":
    sys.exit(run_suite())
