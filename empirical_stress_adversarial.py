"""
Adversarial Stress Test Suite for sanitize_hook.py
Challenger 1 Empirical Attack Matrix
"""

import asyncio
import json
import os
import sys

def run_adversarial_suite(ws_path: str):
    print(f"\n=======================================================")
    print(f" ADVERSARIAL STRESS TESTING: {ws_path}")
    print(f"=======================================================")
    
    if ws_path not in sys.path:
        sys.path.insert(0, ws_path)
    
    import importlib
    if "sanitize_hook" in sys.modules:
        del sys.modules["sanitize_hook"]
    
    import sanitize_hook
    sanitizer = sanitize_hook.RequestSanitizer()
    
    stress_cases = [
        # 1. Multi-turn conversation where previous turns were coding and current turn is conversational
        {
            "desc": "Multi-turn: Coding history -> Conversational current turn",
            "messages": [
                {"role": "user", "content": "write a python function to compute fibonacci"},
                {"role": "assistant", "content": "Here is the fibonacci function: def fib(n): ..."},
                {"role": "user", "content": "thank you, how are you today?"}
            ],
            "expected_conv": True
        },
        # 2. Multi-turn conversation where previous turns were conversational and current turn is coding
        {
            "desc": "Multi-turn: Conversational history -> Coding current turn",
            "messages": [
                {"role": "user", "content": "hello, who are you?"},
                {"role": "assistant", "content": "I am an AI assistant..."},
                {"role": "user", "content": "create a file named test.txt"}
            ],
            "expected_conv": False
        },
        # 3. Trick prompt: Coding action with embedded greeting ("Write a poem about hello")
        {
            "desc": "Trick prompt: 'Write a poem about hello' (has write -> coding)",
            "messages": [{"role": "user", "content": "Write a poem about hello"}],
            "expected_conv": False
        },
        # 4. Trick prompt: Conversational question with coding word in compound sentence
        # "Can you create a script to say hello?" -> has create, script -> coding
        {
            "desc": "Trick prompt: 'Can you create a script to say hello?' (has create, script -> coding)",
            "messages": [{"role": "user", "content": "Can you create a script to say hello?"}],
            "expected_conv": False
        },
        # 5. Compound conversational phrases
        {
            "desc": "Compound conversational: 'who are you and what can you do?'",
            "messages": [{"role": "user", "content": "who are you and what can you do?"}],
            "expected_conv": True
        },
        # 6. Emojis and Unicode
        {
            "desc": "Unicode & Emojis: '👋 Hello! How are you doing today? 😊'",
            "messages": [{"role": "user", "content": "👋 Hello! How are you doing today? 😊"}],
            "expected_conv": True
        },
        # 7. Null/Empty inputs resilience
        {
            "desc": "Empty content string: ''",
            "messages": [{"role": "user", "content": ""}],
            "expected_conv": False  # Not recognized as greeting or conv phrase -> preserves tools
        },
        {
            "desc": "Empty content list: []",
            "messages": [{"role": "user", "content": []}],
            "expected_conv": False
        },
        {
            "desc": "Empty messages list: []",
            "messages": [],
            "expected_conv": False
        },
        # 8. Mixed list content with multiple text blocks
        {
            "desc": "Multi-part list content: ['hello', 'how are you']",
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": "Hello! "},
                    {"type": "text", "text": "How are you doing today?"}
                ]
            }],
            "expected_conv": True
        },
        # 9. Classifier bypass check
        {
            "desc": "Auto-mode classifier request (must be routed to backup-ultra with 64 max tokens)",
            "messages": [{"role": "user", "content": "<transcript><block>no</block></transcript>"}],
            "is_classifier": True
        }
    ]
    
    results = []
    
    for case in stress_cases:
        desc = case["desc"]
        messages = case["messages"]
        payload = {
            "model": "claude-sonnet-5",
            "max_tokens": 4096,
            "system": "You are Claude Code.",
            "messages": list(messages),
            "tools": [{"name": "Bash", "description": "Run bash", "input_schema": {"type": "object"}}]
        }
        if case.get("is_classifier"):
            payload["querySource"] = "auto_mode"
            
        res = asyncio.run(sanitizer.async_pre_call_hook(data=payload, call_type="messages"))
        
        passed = True
        err = []
        
        if case.get("is_classifier"):
            if res.get("model") != "backup-ultra":
                passed = False
                err.append(f"Classifier model was {res.get('model')}, expected backup-ultra")
            if res.get("max_tokens") != 64:
                passed = False
                err.append(f"Classifier max_tokens was {res.get('max_tokens')}, expected 64")
        else:
            expected_conv = case["expected_conv"]
            has_tools = "tools" in res and res["tools"] is not None
            has_thinking = "thinking" in res and res["thinking"] is not None
            sys_str = str(res.get("system", ""))
            
            if expected_conv:
                if has_tools:
                    passed = False
                    err.append(f"Tools present: {res.get('tools')}")
                if has_thinking:
                    passed = False
                    err.append(f"Thinking present: {res.get('thinking')}")
                if "[CONVERSATIONAL MODE: Zero Tool Pressure]" not in sys_str:
                    passed = False
                    err.append("Missing conversational directive")
            else:
                if not has_tools:
                    passed = False
                    err.append("Tools unexpectedly stripped")
                if not has_thinking:
                    passed = False
                    err.append("Thinking unexpectedly stripped")
                if "[CONVERSATIONAL MODE: Zero Tool Pressure]" in sys_str:
                    passed = False
                    err.append("Unexpected conversational directive present")
                    
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] {desc}")
        if not passed:
            for e in err:
                print(f"      -> {e}")
        results.append((desc, passed, err))
        
    return results

def test_sse_abrupt_end_closure(ws_path: str):
    print(f"\n=======================================================")
    print(f" TESTING SSE ABRUPT TERMINATION CLOSURE: {ws_path}")
    print(f"=======================================================")
    
    if ws_path not in sys.path:
        sys.path.insert(0, ws_path)
        
    import sanitize_hook

    # Stream terminates abruptly after 1 chunk without message_stop or [DONE]
    async def abrupt_upstream_chunks():
        yield b'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_abrupt", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b"}}\n\n'
        yield b'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\n\n'
        yield b'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Processing request..."}}\n\n'
        # Abruptly stop here without closing block or message!

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
        return MockResponse(abrupt_upstream_chunks())

    async def run_abrupt_test():
        req = MockRequest()
        resp = await sanitize_hook.anthropic_sse_reasoning_stream_middleware(req, mock_call_next)
        chunks = []
        async for c in resp.body_iterator:
            chunks.append(c.decode("utf-8"))
        return "".join(chunks)

    full_output = asyncio.run(run_abrupt_test())
    
    has_stop_block = "event: content_block_stop" in full_output
    has_msg_delta = "event: message_delta" in full_output
    has_msg_stop = "event: message_stop" in full_output
    has_done = "data: [DONE]" in full_output
    
    print(f"      Synthesized block stop on abrupt end: {has_stop_block}")
    print(f"      Synthesized message delta: {has_msg_delta}")
    print(f"      Synthesized message stop: {has_msg_stop}")
    print(f"      Synthesized [DONE]: {has_done}")
    
    passed = has_stop_block and has_msg_delta and has_msg_stop and has_done
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] SSE Abrupt End Graceful Recovery")
    return passed

if __name__ == "__main__":
    ws_a = r"C:\Users\NEW\OneDrive\Desktop\CLAUDE CODE E"
    res_a = run_adversarial_suite(ws_a)
    sse_rec_a = test_sse_abrupt_end_closure(ws_a)
    
    total = len(res_a) + 1
    passed = sum(1 for r in res_a if r[1]) + (1 if sse_rec_a else 0)
    print(f"\nAdversarial Stress Test: {passed}/{total} Passed.")
    if passed == total:
        print("ALL ADVERSARIAL STRESS TESTS PASSED.")
        sys.exit(0)
    else:
        print("ADVERSARIAL STRESS TEST FAILED!")
        sys.exit(1)
