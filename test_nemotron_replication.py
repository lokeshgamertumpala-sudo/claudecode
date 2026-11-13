import unittest
import asyncio
import os
import sys
import json

import sanitize_hook

class TestNemotronReplication(unittest.TestCase):
    def setUp(self):
        self.hook = sanitize_hook.RequestSanitizer()

    def test_nemotron_ultra_directive_untouched(self):
        """Verify Nemotron Ultra receives its EXACT untouched directive when active."""
        self.hook.get_selected_model = lambda: "nvidia/nemotron-3-ultra-550b-a55b"
        data = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": "Build a simulation engine in JS"}],
            "tools": [{"name": "Write", "description": "Write file"}]
        }
        res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
        sys_prompt = str(res.get("system", ""))
        self.assertIn("[TOOL CALL EXECUTION MANDATE]", sys_prompt)
        self.assertNotIn("[MANDATORY TOOL EXECUTION PROTOCOL]", sys_prompt)
        self.assertIn("Never output conversational acknowledgments alone or synthetic phrases like 'Proceeding with implementation.'", sys_prompt)

    def test_mistral_large_receives_replicated_protocol(self):
        """Verify Mistral Large 4 receives the enhanced tool execution protocol."""
        self.hook.get_selected_model = lambda: "mistralai/mistral-large-4-1t-a52b"
        data = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": "Build a simulation engine in JS"}],
            "tools": [{"name": "Write", "description": "Write file"}]
        }
        res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
        sys_prompt = str(res.get("system", ""))
        self.assertIn("[MANDATORY TOOL EXECUTION PROTOCOL]", sys_prompt)
        self.assertIn("You MUST directly invoke the appropriate tool call", sys_prompt)
        self.assertIn("NEVER dump code in plain markdown blocks when tools are provided.", sys_prompt)

    def test_step5_preview_receives_replicated_protocol(self):
        """Verify Step 5 Preview receives the enhanced tool execution protocol."""
        self.hook.get_selected_model = lambda: "stepfun-ai/step-5-preview"
        data = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": "Build an HTML landing page"}],
            "tools": [{"name": "Write", "description": "Write file"}]
        }
        res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
        sys_prompt = str(res.get("system", ""))
        self.assertIn("[MANDATORY TOOL EXECUTION PROTOCOL]", sys_prompt)

    def test_minimax_receives_replicated_protocol(self):
        """Verify MiniMax M3.1 Flash receives the enhanced tool execution protocol."""
        self.hook.get_selected_model = lambda: "minimaxai/minimax-m3.1-flash"
        data = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": "Write unit tests for authentication"}],
            "tools": [{"name": "Write", "description": "Write file"}]
        }
        res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
        sys_prompt = str(res.get("system", ""))
        self.assertIn("[MANDATORY TOOL EXECUTION PROTOCOL]", sys_prompt)

    def test_deepseek_receives_replicated_protocol(self):
        """Verify DeepSeek V4.1 Flash receives the enhanced tool execution protocol."""
        self.hook.get_selected_model = lambda: "deepseek-ai/deepseek-v4.1-flash"
        data = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": "Refactor database query performance"}],
            "tools": [{"name": "Edit", "description": "Edit file"}]
        }
        res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
        sys_prompt = str(res.get("system", ""))
        self.assertIn("[MANDATORY TOOL EXECUTION PROTOCOL]", sys_prompt)

    def test_kimi_receives_nemotron_core_protocol(self):
        """Verify Kimi 3.1 Pro receives the Nemotron core tool execution protocol."""
        self.hook.get_selected_model = lambda: "moonshotai/kimi-k3.1-pro"
        data = {
            "model": "claude-sonnet-5",
            "messages": [{"role": "user", "content": "Build an agentic workflow in Python"}],
            "tools": [{"name": "Write", "description": "Write file"}]
        }
        res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
        sys_prompt = str(res.get("system", ""))
        self.assertIn("[TOOL CALL EXECUTION MANDATE]", sys_prompt)

    def test_thinking_budget_clamped_on_all_reasoning_models(self):
        """Verify thinking budget is clamped to 1024 tokens to match Nemotron's 22s response."""
        for model_id in ["mistralai/mistral-large-4-1t-a52b", "stepfun-ai/step-5-preview", "minimaxai/minimax-m3.1-flash"]:
            self.hook.get_selected_model = lambda m=model_id: m
            data = {
                "model": "claude-sonnet-5",
                "messages": [{"role": "user", "content": "Write complex 3D shader"}],
                "tools": [{"name": "Write", "description": "Write file"}],
                "thinking": {"type": "adaptive", "budget_tokens": 16000},
                "effort": "max"
            }
            res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
            thinking = res.get("thinking")
            self.assertEqual(thinking.get("type"), "enabled")
            self.assertEqual(thinking.get("budget_tokens"), 1024)
            self.assertEqual(res.get("effort"), "medium")

    def test_casual_greetings_sub_second_across_all_models(self):
        """Verify casual greetings bypass tool overhead and retain sub-second speed."""
        for model_id in [
            "nvidia/nemotron-3-ultra-550b-a55b",
            "mistralai/mistral-large-4-1t-a52b",
            "stepfun-ai/step-5-preview",
            "minimaxai/minimax-m3.1-flash",
            "deepseek-ai/deepseek-v4.1-flash",
            "moonshotai/kimi-k3.1-pro"
        ]:
            self.hook.get_selected_model = lambda m=model_id: m
            data = {
                "model": "claude-sonnet-5",
                "messages": [{"role": "user", "content": "hiii"}],
                "tools": [{"name": "Write", "description": "Write file"}],
                "thinking": {"type": "enabled", "budget_tokens": 1024}
            }
            res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
            self.assertNotIn("tools", res)
            self.assertNotIn("thinking", res)
            self.assertIn("[CONVERSATIONAL INTERACTION GUIDELINE]", str(res.get("system", "")))

    def test_multi_turn_casual_greeting_sub_second(self):
        """Verify casual greeting on Turn 2, 3+ strips thinking overhead immediately."""
        self.hook.get_selected_model = lambda: "moonshotai/kimi-k3.1-pro"
        data = {
            "model": "claude-sonnet-5",
            "messages": [
                {"role": "user", "content": "kimi"},
                {"role": "assistant", "content": "Hi! I am Kimi 3.1 Pro."},
                {"role": "user", "content": "hi"}
            ],
            "tools": [{"name": "Write", "description": "Write file"}],
            "thinking": {"type": "enabled", "budget_tokens": 1024}
        }
        res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
        self.assertNotIn("tools", res)
        self.assertNotIn("thinking", res)
        self.assertIn("[CONVERSATIONAL INTERACTION GUIDELINE]", str(res.get("system", "")))

    def test_multi_turn_tool_result_receives_action_mandate(self):
        """Verify after tool_results, the action mandate is injected into user turn."""
        self.hook.get_selected_model = lambda: "moonshotai/kimi-k3.1-pro"
        data = {
            "model": "claude-sonnet-5",
            "messages": [
                {"role": "user", "content": "build gta vice city"},
                {"role": "assistant", "content": [{"type": "tool_use", "id": "1", "name": "Glob", "input": {"pattern": "*"}}]},
                {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "1", "content": "empty directory"}]}
            ],
            "tools": [{"name": "Write", "description": "Write file"}]
        }
        res = asyncio.run(self.hook.async_pre_call_hook(None, None, data, "completion"))
        last_msg = res["messages"][-1]
        self.assertTrue(any("[CRITICAL ACTION: File and directory inspection complete" in str(p.get("text", "")) for p in last_msg["content"]))
        sys_prompt = str(res.get("system", ""))
        self.assertIn("[TOOL CALL EXECUTION MANDATE]", sys_prompt)

if __name__ == "__main__":
    unittest.main()
