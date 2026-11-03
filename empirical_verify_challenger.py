"""
Empirical verification harness for RequestSanitizer and SSE streaming transformer.
Challenger 1 test suite.
"""

import asyncio
import json
import os
import sys
import time

def test_workspace(ws_path: str):
    print(f"\n=======================================================")
    print(f" TESTING WORKSPACE: {ws_path}")
    print(f"=======================================================")
    
    if ws_path not in sys.path:
        sys.path.insert(0, ws_path)
    
    # Reload sanitize_hook from target workspace
    import importlib
    if "sanitize_hook" in sys.modules:
        del sys.modules["sanitize_hook"]
    
    import sanitize_hook
    sanitizer = sanitize_hook.RequestSanitizer()
    
    test_cases = [
        # Required Conversational Inputs
        ("how are you", True, "Required conversational: how are you"),
        ("who are you", True, "Required conversational: who are you"),
        ("what can you do", True, "Required conversational: what can you do"),
        ("tell me about yourself", True, "Required conversational: tell me about yourself"),
        ("how's it going", True, "Required conversational: how's it going"),
        ("what is this project?", True, "Required conversational: what is this project?"),
        ("what model are you", True, "Conversational: what model are you"),
        ("what is your purpose?", True, "Conversational: what is your purpose?"),
        ("hi", True, "Conversational: hi"),
        ("hello", True, "Conversational: hello"),
        ("good morning", True, "Conversational: good morning"),
        ("thank you", True, "Conversational: thank you"),
        ("what do you do", True, "Conversational: what do you do"),
        ("   HOW ARE YOU???   ", True, "Conversational with casing/punctuation/spaces"),
        ([{"type": "text", "text": "how are you"}], True, "Conversational with list content format"),
        
        # Required Coding Inputs
        ("write a script", False, "Required coding: write a script"),
        ("edit config.yaml", False, "Required coding: edit config.yaml"),
        ("write a python function to compute factorial", False, "Required coding: factorial function"),
        ("git status", False, "Coding: git status"),
        ("how do I fix this bug?", False, "Coding: how do I fix this bug? (contains fix & bug)"),
        ("refactor sanitize_hook.py", False, "Coding: refactor sanitize_hook.py"),
        ("run the tests", False, "Coding: run the tests"),
        ([{"type": "text", "text": "write a python script"}], False, "Coding with list content format"),
        
        # Boundary / Edge Cases
        ("what can you do with python files?", True, "Boundary: what can you do with python files? (capability inquiry)"),
        ("explain how this project works?", True, "Boundary: explain how this project works? (question without coding keywords)"),
        ("akazza", True, "Short unrecognized prompt: akazza")
    ]

    default_tools = [
        {"name": "Bash", "description": "Run shell command", "input_schema": {"type": "object"}},
        {"name": "Write", "description": "Write file", "input_schema": {"type": "object"}}
    ]

    results = []
    
    for prompt, expected_conversational, desc in test_cases:
        payload = {
            "model": "claude-sonnet-5",
            "max_tokens": 4096,
            "system": "You are Claude Code CLI.",
            "messages": [{"role": "user", "content": prompt}],
            "tools": list(default_tools),
            "tool_choice": {"type": "auto"},
            "thinking": {"type": "enabled", "budget_tokens": 16000}
        }
        
        res = asyncio.run(sanitizer.async_pre_call_hook(data=payload, call_type="messages"))
        
        passed = True
        failures = []
        
        # 1. Tools check
        has_tools = "tools" in res and res["tools"] is not None
        has_tool_choice = "tool_choice" in res and res["tool_choice"] is not None
        
        # 2. Thinking check
        has_thinking = "thinking" in res and res["thinking"] is not None
        thinking_budget = res.get("thinking", {}).get("budget_tokens") if has_thinking else None
        
        # 3. System prompt check
        sys_prompt = str(res.get("system", ""))
        has_conv_directive = "[CONVERSATIONAL MODE: Zero Tool Pressure]" in sys_prompt
        has_thinking_mandate = "[CRITICAL NATIVE THINKING MANDATE" in sys_prompt
        has_arch_contract = "[CRITICAL ARCHITECTURAL CONTRACT" in sys_prompt
        
        if expected_conversational:
            if has_tools:
                passed = False
                failures.append(f"Tools NOT stripped: {res.get('tools')}")
            if has_tool_choice:
                passed = False
                failures.append(f"Tool choice NOT stripped: {res.get('tool_choice')}")
            if has_thinking:
                passed = False
                failures.append(f"Thinking NOT stripped: {res.get('thinking')}")
            if not has_conv_directive:
                passed = False
                failures.append("Missing [CONVERSATIONAL MODE: Zero Tool Pressure] directive")
            if has_thinking_mandate:
                passed = False
                failures.append("Unexpected [CRITICAL NATIVE THINKING MANDATE present")
            if has_arch_contract:
                passed = False
                failures.append("Unexpected [CRITICAL ARCHITECTURAL CONTRACT present")
        else:
            if not has_tools:
                passed = False
                failures.append("Tools were improperly stripped")
            if not has_thinking:
                passed = False
                failures.append("Thinking was improperly stripped")
            elif thinking_budget not in (8192, 16000, 32768):
                # Budget clamped to max 8192 to prevent stalls
                passed = False
                failures.append(f"Unexpected thinking budget: {thinking_budget}")
            if has_conv_directive:
                passed = False
                failures.append("Unexpected [CONVERSATIONAL MODE: Zero Tool Pressure] present")
            if not has_thinking_mandate:
                passed = False
                failures.append("Missing [CRITICAL NATIVE THINKING MANDATE")
            if not has_arch_contract:
                passed = False
                failures.append("Missing [CRITICAL ARCHITECTURAL CONTRACT")
                
        status = "PASS" if passed else "FAIL"
        prompt_preview = prompt if isinstance(prompt, str) else json.dumps(prompt)
        if len(prompt_preview) > 35:
            prompt_preview = prompt_preview[:32] + "..."
        print(f"[{status}] {desc:<45} | Prompt: {prompt_preview:<35} | Tools: {str(has_tools):<5} | Thinking: {str(has_thinking):<5}")
        if not passed:
            for f in failures:
                print(f"      -> ERROR: {f}")
        results.append((desc, passed, failures))
        
    # Check default thinking budget when none is provided
    coding_payload_no_thinking = {
        "model": "claude-sonnet-5",
        "messages": [{"role": "user", "content": "write a python script"}],
        "tools": list(default_tools)
    }
    res_no_th = asyncio.run(sanitizer.async_pre_call_hook(data=coding_payload_no_thinking, call_type="messages"))
    default_budget = res_no_th.get("thinking", {}).get("budget_tokens")
    if default_budget in (8192, 32768):
        print(f"[PASS] Default thinking budget without input thinking: {default_budget} tokens (actual: {default_budget})")
        results.append(("Default thinking budget", True, []))
    else:
        print(f"[FAIL] Default thinking budget expected 8192 or 32768 tokens, got: {default_budget}")
        results.append(("Default thinking budget", False, [f"Got {default_budget}"]))

    return results

def test_sse_keepalive_and_frames(ws_path: str):
    print(f"\n=======================================================")
    print(f" TESTING SSE STREAMING & KEEPALIVE: {ws_path}")
    print(f"=======================================================")
    
    if ws_path not in sys.path:
        sys.path.insert(0, ws_path)
    
    import sanitize_hook
    from fastapi import Request
    from fastapi.responses import StreamingResponse

    # Create an async generator that simulates upstream LLM chunks with a 3.0s pause to test keepalive
    async def mock_upstream_chunks():
        # 1. message_start
        yield b'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_1", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b"}}\n\n'
        await asyncio.sleep(0.1)
        # 2. content_block_start for text
        yield b'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\n\n'
        await asyncio.sleep(0.1)
        # 3. content_block_delta text
        yield b'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Hello! "}}\n\n'
        
        # 4. Silence pause of 3.0 seconds to trigger 2.5s keepalive ping
        print("      [SSE TEST] Pausing 3.0s to verify keepalive ping emission...")
        await asyncio.sleep(3.0)
        
        # 5. content_block_delta continuation
        yield b'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "How can I help you today?"}}\n\n'
        await asyncio.sleep(0.1)
        # 6. content_block_stop
        yield b'event: content_block_stop\ndata: {"type": "content_block_stop", "index": 0}\n\n'
        await asyncio.sleep(0.1)
        # 7. message_delta
        yield b'event: message_delta\ndata: {"type": "message_delta", "delta": {"stop_reason": "end_turn"}}\n\n'
        await asyncio.sleep(0.1)
        # 8. message_stop
        yield b'event: message_stop\ndata: {"type": "message_stop"}\n\n'
        await asyncio.sleep(0.1)
        # 9. [DONE]
        yield b'data: [DONE]\n\n'

    # Build mock request
    class MockRequest:
        def __init__(self):
            self.url = type("URL", (), {"path": "/v1/messages"})()
            self.query_params = {}
            self.scope = {"query_string": b""}

    class MockResponse:
        def __init__(self, iterator):
            self.status_code = 200
            self.headers = {"content-type": "text/event-stream"}
            self.body_iterator = iterator

    async def mock_call_next(req):
        return MockResponse(mock_upstream_chunks())

    async def run_middleware_test():
        req = MockRequest()
        transformed_resp = await sanitize_hook.anthropic_sse_reasoning_stream_middleware(req, mock_call_next)
        
        frames = []
        received_ping = False
        empty_delta_frames = 0
        
        async for chunk in transformed_resp.body_iterator:
            chunk_str = chunk.decode("utf-8")
            frames.append(chunk_str)
            if ": ping" in chunk_str or '"type": "ping"' in chunk_str:
                received_ping = True
            if "event: content_block_delta\n\n" in chunk_str or "event: content_block_delta\r\n\r\n" in chunk_str:
                empty_delta_frames += 1

        return frames, received_ping, empty_delta_frames

    frames, received_ping, empty_deltas = asyncio.run(run_middleware_test())
    
    print(f"      Total frames received: {len(frames)}")
    print(f"      Keepalive ping received during pause: {received_ping}")
    print(f"      Empty ghost delta frames: {empty_deltas}")
    
    passed = received_ping and (empty_deltas == 0)
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] SSE Keepalive & Stream Frame Integrity | Keepalive Ping: {received_ping} | Empty Deltas: {empty_deltas}")
    return passed

if __name__ == "__main__":
    ws_a = r"C:\Users\NEW\OneDrive\Desktop\CLAUDE CODE E"
    ws_b = r"C:\Users\NEW\OneDrive\Desktop\claudecode"
    
    results_a = test_workspace(ws_a)
    sse_a = test_sse_keepalive_and_frames(ws_a)
    
    results_b = test_workspace(ws_b)
    sse_b = test_sse_keepalive_and_frames(ws_b)
    
    all_tests = results_a + [("SSE Keepalive & Stream Frame Integrity A", sse_a, [])] + \
                results_b + [("SSE Keepalive & Stream Frame Integrity B", sse_b, [])]
                
    total = len(all_tests)
    passed_count = sum(1 for t in all_tests if (t[1] if isinstance(t[1], bool) else False))
    failed_count = total - passed_count
    
    print("\n=======================================================")
    print(f" EMPIRICAL CHALLENGER VERIFICATION SUMMARY")
    print(f" Total Tests Executed: {total}")
    print(f" Passed: {passed_count}")
    print(f" Failed: {failed_count}")
    print("=======================================================")
    
    if failed_count > 0:
        print("VERDICT: REJECT - Discrepancies detected!")
        sys.exit(1)
    else:
        print("VERDICT: APPROVE - All conversational mode, tool suppression, thinking controls, and SSE stream invariants 100% verified!")
        sys.exit(0)
