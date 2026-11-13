#!/usr/bin/env python3
"""
⚔️ Adversarial Challenger Test Suite: Multi-Model Prompt Sanitization, Greetings & Streaming Stress Test
Author: teamwork_challenger_1 (Empirical Challenger)
Target: LiteLLM Proxy (:4000) & RequestSanitizer Middleware

Challenges:
1. Challenge Prompt Sanitization:
   - Call RequestSanitizer.async_pre_call_hook with varied edge cases:
     multiple message roles, system prompts containing 'motion'/'boost',
     continuation messages, empty prompts, multiline code requests,
     structured content lists, and unparsed tool input.
   - Assert [1-SHOT MOTION MANDATE: and [ACTION MANDATE: are NEVER injected into user messages.
2. Challenge Casual Greetings & Reasoning Leaks:
   - Probe http://127.0.0.1:4000/v1/messages with casual greetings ('hiii', 'hello', 'hey', 'good morning', 'sup', 'yo')
     both streaming (stream: true) and non-streaming (stream: false).
   - Check all emitted tokens/blocks: verify zero reasoning leaks ('the user said', 'system prompt', '<think>')
     and zero motion mandate text.
3. Challenge Explicit Motion Isolation:
   - Verify motion directives activate ONLY when explicitly requested (e.g. /motion or explicit animation keywords).
   - Verify general coding, physics questions, and non-motion continuations never activate motion directives.
"""

import sys
import os
import json
import time
import copy
import urllib.request
import urllib.error
import unittest
import asyncio

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sanitize_hook import RequestSanitizer, is_conversational_turn, is_conversational_prompt

PROXY_URL = "http://127.0.0.1:4000"
PROXY_KEY = "sk-litellm-proxy-key"

FORBIDDEN_LEAK_PHRASES = (
    "the user said",
    "the user is saying",
    "system prompt has injected",
    "injected instructions",
    "i don't need to mention my model identity",
    "<think>",
    "</think>",
    "[1-shot motion mandate",
    "[action mandate",
    "motion-studio/src/compositions",
)


class TestAdversarialPromptSanitization(unittest.TestCase):
    """Stress tests RequestSanitizer.async_pre_call_hook across adversarial edge cases."""

    def setUp(self):
        self.sanitizer = RequestSanitizer()

    def _assert_no_mandate_in_messages(self, messages, test_desc=""):
        """Verify [1-SHOT MOTION MANDATE: and [ACTION MANDATE: are not in any user message."""
        for i, msg in enumerate(messages):
            if not isinstance(msg, dict):
                continue
            role = msg.get("role")
            content = msg.get("content")
            if role == "user":
                if isinstance(content, str):
                    self.assertNotIn(
                        "[1-SHOT MOTION MANDATE:", content,
                        f"[{test_desc}] Mandate injected into user message[{i}]: {content}"
                    )
                    self.assertNotIn(
                        "[ACTION MANDATE:", content,
                        f"[{test_desc}] Action mandate injected into user message[{i}]: {content}"
                    )
                elif isinstance(content, list):
                    for part in content:
                        if isinstance(part, dict):
                            txt = str(part.get("text", "") or part.get("content", ""))
                            self.assertNotIn(
                                "[1-SHOT MOTION MANDATE:", txt,
                                f"[{test_desc}] Mandate injected in block of user message[{i}]: {txt}"
                            )
                            self.assertNotIn(
                                "[ACTION MANDATE:", txt,
                                f"[{test_desc}] Action mandate injected in block of user message[{i}]: {txt}"
                            )

    def test_edge_case_multiple_roles_conversation(self):
        """Edge case 1: Multi-turn dialogue with system, assistant, user, and tool roles."""
        payload = {
            "model": "claude-sonnet-5",
            "messages": [
                {"role": "system", "content": "You are a professional assistant."},
                {"role": "user", "content": "Can you help me build a database schema?"},
                {"role": "assistant", "content": "Certainly! What tables do you need?"},
                {"role": "user", "content": "Users, Orders, and Products."},
                {"role": "assistant", "content": [{"type": "tool_use", "id": "t1", "name": "Write", "input": {"file": "schema.sql"}}]},
                {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "t1", "content": "File written successfully."}]},
                {"role": "user", "content": "Now generate SQL indexes for optimizing query performance."}
            ]
        }
        asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
        self._assert_no_mandate_in_messages(payload["messages"], "Multi-turn dialogue with tool usage")
        last_msg = payload["messages"][-1]["content"]
        if isinstance(last_msg, list):
            user_texts = [p.get("text") for p in last_msg if isinstance(p, dict) and p.get("type") == "text"]
            self.assertIn("Now generate SQL indexes for optimizing query performance.", user_texts)
        else:
            self.assertEqual(last_msg, "Now generate SQL indexes for optimizing query performance.")

    def test_edge_case_system_prompt_with_motion_and_boost_keywords(self):
        """Edge case 2: System prompt contains explicit 'motion' and '/boost' references."""
        adversarial_system = (
            "We have a legacy /boost command and 60FPS motion graphics subsystem in our monorepo. "
            "However, you must act as a general backend engineer unless requested otherwise."
        )
        payload = {
            "model": "claude-sonnet-5",
            "system": adversarial_system,
            "messages": [
                {"role": "user", "content": "Write a unit test for password hashing using bcrypt."}
            ]
        }
        asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
        self._assert_no_mandate_in_messages(payload["messages"], "System prompt with motion/boost keywords")
        # Ensure system prompt does NOT have 1-shot motion directive injected just because of words in system
        sys_content = str(payload.get("system", ""))
        self.assertNotIn("[CRITICAL 1-SHOT DIRECT ACTION MANDATE", sys_content)
        self.assertEqual(payload["messages"][-1]["content"], "Write a unit test for password hashing using bcrypt.")

    def test_edge_case_continuation_phrases_without_motion_history(self):
        """Edge case 3: Continuation prompts ('continue', 'proceed', 'go ahead', 'do it', 'next', 'ok', 'yes')."""
        continuation_prompts = ["continue", "proceed", "go ahead", "do it", "next", "ok", "yes", "proceed with implementation"]
        for p in continuation_prompts:
            payload = {
                "model": "claude-sonnet-5",
                "messages": [
                    {"role": "user", "content": "Refactor the authentication middleware to use JWT."},
                    {"role": "assistant", "content": "I have created the plan."},
                    {"role": "user", "content": p}
                ]
            }
            asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
            self._assert_no_mandate_in_messages(payload["messages"], f"Continuation phrase: '{p}'")
            sys_content = str(payload.get("system", ""))
            self.assertNotIn("[CRITICAL 1-SHOT DIRECT ACTION MANDATE", sys_content,
                             f"Motion mandate falsely triggered for continuation '{p}' without motion history")
            self.assertEqual(payload["messages"][-1]["content"], p)

    def test_edge_case_continuation_with_motion_history(self):
        """Edge case 4: Continuation when previous history legitimately contained motion request."""
        payload = {
            "model": "claude-sonnet-5",
            "messages": [
                {"role": "user", "content": "/motion create a 60FPS cybernetic dashboard animation"},
                {"role": "assistant", "content": "I have set up the composition scaffolding."},
                {"role": "user", "content": "continue"}
            ]
        }
        asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
        # User message content itself must NEVER have mandate injected
        self._assert_no_mandate_in_messages(payload["messages"], "Continuation with motion history")
        self.assertEqual(payload["messages"][-1]["content"], "continue")
        # System prompt SHOULD contain motion directives because user requested motion previously
        sys_content = str(payload.get("system", ""))
        self.assertIn("[CRITICAL 1-SHOT DIRECT ACTION MANDATE", sys_content)

    def test_edge_case_empty_and_whitespace_prompts(self):
        """Edge case 5: Empty, whitespace-only, and newline prompts."""
        empty_inputs = ["", "   ", "\n\t\r", "   \n   "]
        for emp in empty_inputs:
            payload = {
                "model": "claude-sonnet-5",
                "messages": [{"role": "user", "content": emp}]
            }
            asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
            self._assert_no_mandate_in_messages(payload["messages"], f"Empty prompt: repr({repr(emp)})")
            # Should not crash, and should not inject motion mandate
            sys_content = str(payload.get("system", ""))
            self.assertNotIn("[CRITICAL 1-SHOT DIRECT ACTION MANDATE", sys_content)

    def test_edge_case_multiline_code_request(self):
        """Edge case 6: Large multiline code request with code blocks, markdown tables, and backticks."""
        multiline_code = """
Please review and optimize this Python implementation:
```python
def fibonacci(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]
```
Requirements:
1. Prevent mutable default argument issues.
2. Provide iterative O(1) space solution.
3. Add pytest test cases with parametrization.
"""
        payload = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": multiline_code}]
        }
        asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
        self._assert_no_mandate_in_messages(payload["messages"], "Multiline code request")
        last_msg = payload["messages"][-1]["content"]
        self.assertIn("def fibonacci", last_msg)
        self.assertNotIn("[1-SHOT MOTION MANDATE:", last_msg)
        self.assertNotIn("[ACTION MANDATE:", last_msg)

    def test_edge_case_structured_content_list(self):
        """Edge case 7: User message supplied as a structured list of content blocks."""
        structured_content = [
            {"type": "text", "text": "Analyze this data model and produce TypeScript types:"},
            {"type": "text", "text": "interface User { id: string; name: string; email: string; }"}
        ]
        payload = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": copy.deepcopy(structured_content)}]
        }
        asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
        self._assert_no_mandate_in_messages(payload["messages"], "Structured content list")

    def test_edge_case_words_resembling_triggers_in_regular_queries(self):
        """Edge case 8: Words like 'motion' or 'boost' used in natural scientific/engineering context."""
        benign_queries = [
            "Explain Newton's second and third laws of motion.",
            "How can we boost query performance on PostgreSQL with composite indexes?",
            "What causes Brownian motion in microscopic particles suspended in liquid?",
            "How to implement harmonic motion physics in a 2D canvas game?"
        ]
        for query in benign_queries:
            payload = {
                "model": "claude-sonnet-5",
                "messages": [{"role": "user", "content": query}]
            }
            asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
            self._assert_no_mandate_in_messages(payload["messages"], f"Benign query: '{query}'")
            # In all these cases, user message content must remain un-mutated
            self.assertEqual(payload["messages"][-1]["content"], query)


class TestAdversarialCasualGreetingsLive(unittest.TestCase):
    """Probes the live LiteLLM proxy at http://127.0.0.1:4000/v1/messages for greetings."""

    GREETING_PROBES = ["hiii", "hello", "hey", "good morning", "sup", "yo", "greetings"]

    def _probe_non_streaming(self, greeting: str):
        """Probes non-streaming endpoint for clean greeting and zero leaks."""
        url = f"{PROXY_URL}/v1/messages"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": PROXY_KEY,
            "anthropic-version": "2023-06-01"
        }
        payload = {
            "model": "claude-sonnet-5",
            "max_tokens": 120,
            "stream": False,
            "messages": [{"role": "user", "content": greeting}]
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=45) as resp:
            self.assertEqual(resp.status, 200, f"Expected 200 OK for greeting '{greeting}'")
            body = json.loads(resp.read().decode("utf-8"))
            content_blocks = body.get("content", [])

            # Check that thinking blocks are NOT present
            thinking_blocks = [b for b in content_blocks if isinstance(b, dict) and b.get("type") == "thinking"]
            self.assertEqual(len(thinking_blocks), 0,
                             f"Thinking block found in non-streaming greeting '{greeting}'': {thinking_blocks}")

            # Collect text
            text_blocks = [b for b in content_blocks if isinstance(b, dict) and b.get("type") == "text"]
            self.assertGreaterEqual(len(text_blocks), 1, f"No text block in greeting response for '{greeting}'")
            full_text = " ".join(b.get("text", "") for b in text_blocks)

            # Check for forbidden reasoning or mandate leaks
            for leak in FORBIDDEN_LEAK_PHRASES:
                self.assertNotIn(
                    leak, full_text.lower(),
                    f"Forbidden leak '{leak}' found in non-streaming response to '{greeting}': {full_text}"
                )

            # Check for warm professional greeting
            self.assertTrue(
                any(w in full_text.lower() for w in ("hi", "hello", "hey", "help", "welcome", "greetings", "how can i help", "assist", "ready", "how's it going", "morning")),
                f"Response to '{greeting}' lacked friendly greeting: {full_text}"
            )
            return full_text

    def _probe_streaming(self, greeting: str):
        """Probes streaming endpoint (SSE) for clean greeting and zero leaks."""
        url = f"{PROXY_URL}/v1/messages"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": PROXY_KEY,
            "anthropic-version": "2023-06-01"
        }
        payload = {
            "model": "claude-sonnet-5",
            "max_tokens": 120,
            "stream": True,
            "messages": [{"role": "user", "content": greeting}]
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=45) as resp:
            self.assertEqual(resp.status, 200, f"Expected 200 OK for streaming greeting '{greeting}'")

            text_deltas = []
            events_seen = []
            block_starts = []

            for line in resp:
                line_str = line.decode("utf-8", errors="replace").strip()
                if not line_str.startswith("data:"):
                    continue
                data_val = line_str[5:].strip()
                if data_val == "[DONE]":
                    events_seen.append("[DONE]")
                    continue
                try:
                    event_data = json.loads(data_val)
                except json.JSONDecodeError:
                    continue

                etype = event_data.get("type")
                events_seen.append(etype)

                if etype == "content_block_start":
                    block_starts.append(event_data)
                    # Verify content block type is 'text', NOT 'thinking'
                    cblock = event_data.get("content_block", {})
                    btype = cblock.get("type")
                    self.assertNotEqual(btype, "thinking",
                                        f"Thinking block started on streaming greeting '{greeting}'")

                elif etype == "content_block_delta":
                    delta = event_data.get("delta", {})
                    dtype = delta.get("type")
                    # Verify no thinking deltas are emitted
                    self.assertNotEqual(dtype, "thinking_delta",
                                        f"thinking_delta emitted on streaming greeting '{greeting}'")
                    if dtype == "text_delta":
                        text_deltas.append(delta.get("text", ""))

            full_text = "".join(text_deltas)

            # Check that at least one content block started
            self.assertGreaterEqual(len(block_starts), 1,
                                    f"No content_block_start event in stream for '{greeting}'")
            # First block must start at index 0 (clean index mapping)
            self.assertEqual(block_starts[0].get("index"), 0,
                             f"First content block start index is not 0 for '{greeting}'")

            # Check for forbidden leaks in streamed text
            for leak in FORBIDDEN_LEAK_PHRASES:
                self.assertNotIn(
                    leak, full_text.lower(),
                    f"Forbidden leak '{leak}' found in streaming response to '{greeting}': {full_text}"
                )

            # Check for warm professional greeting
            self.assertTrue(
                any(w in full_text.lower() for w in ("hi", "hello", "hey", "help", "welcome", "greetings", "how can i help", "assist", "ready", "how's it going", "morning")),
                f"Streamed response to '{greeting}' lacked friendly greeting: {full_text}"
            )
            return full_text

    def test_non_streaming_casual_greetings(self):
        """Probe all casual greetings non-streaming (stream: false)."""
        for g in self.GREETING_PROBES:
            t0 = time.perf_counter()
            response_text = self._probe_non_streaming(g)
            elapsed = (time.perf_counter() - t0) * 1000.0
            print(f"  [Non-Streaming] '{g}' -> ({elapsed:.1f}ms): {response_text[:80]}...")

    def test_streaming_casual_greetings(self):
        """Probe all casual greetings streaming (stream: true)."""
        for g in self.GREETING_PROBES:
            t0 = time.perf_counter()
            response_text = self._probe_streaming(g)
            elapsed = (time.perf_counter() - t0) * 1000.0
            print(f"  [Streaming] '{g}' -> ({elapsed:.1f}ms): {response_text[:80]}...")


class TestAdversarialExplicitMotionIsolation(unittest.TestCase):
    """Stress tests explicit motion isolation logic."""

    def setUp(self):
        self.sanitizer = RequestSanitizer()

    def test_explicit_motion_triggers_directives(self):
        """Explicit motion commands (/motion or explicit animation requests) MUST trigger directives."""
        motion_inputs = [
            "/motion create a 60FPS cybernetic heads-up display",
            "Create a 60FPS motion graphic for our SaaS product launch",
            "Generate a 10s cinematic explainer video using Remotion and ParticleField",
            "/motion render an audio-reactive particle visualizer"
        ]
        for prompt in motion_inputs:
            payload = {
                "model": "claude-sonnet-5",
                "messages": [{"role": "user", "content": prompt}]
            }
            asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
            sys_text = str(payload.get("system", ""))
            self.assertIn("[CRITICAL 1-SHOT DIRECT ACTION MANDATE", sys_text,
                          f"Expected motion mandate in system prompt for explicit motion prompt: '{prompt}'")
            # But the user message MUST NOT be injected
            self.assertEqual(payload["messages"][-1]["content"], prompt,
                             "User message content must remain authentic and un-mutated")

    def test_software_engineering_tasks_do_not_trigger_motion(self):
        """General software development tasks MUST NEVER trigger motion directives."""
        coding_tasks = [
            "Build a full-stack React and Node.js authentication service with PostgreSQL.",
            "Write a Python script to compute prime numbers up to N with unit tests.",
            "Design a modular microservice architecture for order management.",
            "Review the security of this JWT token verification middleware.",
            "Diagnose why the Docker container exits with status 137.",
            "Refactor the database queries to avoid N+1 query problems in SQLAlchemy."
        ]
        for task in coding_tasks:
            payload = {
                "model": "claude-sonnet-5",
                "messages": [{"role": "user", "content": task}]
            }
            asyncio.run(self.sanitizer.async_pre_call_hook(data=payload))
            sys_text = str(payload.get("system", ""))
            self.assertNotIn("[CRITICAL 1-SHOT DIRECT ACTION MANDATE", sys_text,
                             f"Motion mandate falsely triggered for software engineering task: '{task}'")
            self.assertNotIn("motion-studio", sys_text,
                             f"Motion-studio directive leaked into system prompt for: '{task}'")
            self.assertEqual(payload["messages"][-1]["content"], task)


class TestAdversarialStreamingCodingTask(unittest.TestCase):
    """Verifies that normal coding tasks stream cleanly without being affected by conversational filters."""

    def test_streaming_coding_task(self):
        """Verify streaming a coding prompt produces valid tokens and complete response."""
        url = f"{PROXY_URL}/v1/messages"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": PROXY_KEY,
            "anthropic-version": "2023-06-01"
        }
        payload = {
            "model": "claude-sonnet-5",
            "max_tokens": 500,
            "stream": True,
            "messages": [{"role": "user", "content": "Write a one-line Python function to reverse a string."}]
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            self.assertEqual(resp.status, 200)
            collected_text = []
            for line in resp:
                line_str = line.decode("utf-8", errors="replace").strip()
                if line_str.startswith("data:"):
                    data_val = line_str[5:].strip()
                    if data_val == "[DONE]":
                        continue
                    try:
                        p = json.loads(data_val)
                    except json.JSONDecodeError:
                        continue
                    if p.get("type") == "content_block_delta":
                        delta = p.get("delta", {})
                        if delta.get("type") == "text_delta":
                            collected_text.append(delta.get("text", ""))

            full_code = "".join(collected_text)
            self.assertGreater(len(full_code), 10, f"Coding stream returned too few characters: {full_code}")
            self.assertTrue("def " in full_code or "lambda" in full_code or "[::-1]" in full_code,
                            f"Expected python reverse function, got: {full_code}")
            # Ensure no motion mandate leaks
            for leak in FORBIDDEN_LEAK_PHRASES:
                self.assertNotIn(leak, full_code.lower())


def run_adversarial_suite():
    print("=" * 70)
    print("   ⚔️  ADVERSARIAL CHALLENGER STRESS SUITE (teamwork_challenger_1)")
    print("=" * 70)

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(TestAdversarialPromptSanitization))
    suite.addTests(loader.loadTestsFromTestCase(TestAdversarialCasualGreetingsLive))
    suite.addTests(loader.loadTestsFromTestCase(TestAdversarialExplicitMotionIsolation))
    suite.addTests(loader.loadTestsFromTestCase(TestAdversarialStreamingCodingTask))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("=" * 70)
    if result.wasSuccessful():
        print(f"✅ ALL ADVERSARIAL STRESS TESTS PASSED (Ran {result.testsRun} tests cleanly)")
        print("=" * 70)
        return 0
    else:
        print(f"❌ ADVERSARIAL CHALLENGE FAILED: {len(result.failures)} failures, {len(result.errors)} errors")
        print("=" * 70)
        return 1


if __name__ == "__main__":
    sys.exit(run_adversarial_suite())
