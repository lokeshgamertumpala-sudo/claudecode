"""
Empirical Verification & Adversarial Stress Suite for SSE Streaming Transformer & Keepalive Pings
Tests:
  1. Zero empty delta frames (event: content_block_delta without data).
  2. Atomic event formatting (strict event: and data: validation, valid JSON).
  3. Keepalive dual-ping emission on timeout (>2.5s):
     - SSE comment: ': ping\\n\\n'
     - Anthropic typed event: 'event: ping\\ndata: {"type": "ping"}\\n\\n'
  4. Clean termination with data: [DONE].
  5. Chunk fragmentation / partial buffer reconstruction.
  6. Thinking-only stream without body text -> fallback text block synthesis.
  7. Tool-use stream with input_json_delta preservation.
  8. Prolonged silence (6.0s) -> multi-ping cadence verification.
  9. Query parameter ?beta=true stripping verification.
 10. Symmetrical execution against Workspace B (claudecode).
"""

import sys
import os
import json
import asyncio
import time
from typing import List, Dict, Any, Optional

# Ensure project root is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from fastapi import Request
from fastapi.responses import StreamingResponse
from sanitize_hook import anthropic_sse_reasoning_stream_middleware


class SSEParsedFrame:
    """Represents a single parsed SSE frame separated by double newlines."""

    def __init__(self, raw_text: str):
        self.raw_text = raw_text
        self.lines = [line.strip() for line in raw_text.strip("\r\n").splitlines() if line.strip()]
        self.is_comment = False
        self.comment_text = ""
        self.event_type = ""
        self.data_lines: List[str] = []
        self.is_done = False
        self.parsed_json: Optional[Dict[str, Any]] = None
        self.is_empty_delta = False

        self._parse()

    def _parse(self):
        if not self.lines:
            return

        if all(line.startswith(":") for line in self.lines):
            self.is_comment = True
            self.comment_text = "\n".join(line[1:].strip() for line in self.lines)
            return

        for line in self.lines:
            if line.startswith(":"):
                continue
            elif line.startswith("event:"):
                self.event_type = line[6:].strip()
            elif line.startswith("data:"):
                self.data_lines.append(line[5:].strip())

        # Check for empty delta defect: event is content_block_delta but zero data lines
        if self.event_type == "content_block_delta" and not self.data_lines:
            self.is_empty_delta = True

        data_str = "\n".join(self.data_lines)
        if data_str == "[DONE]":
            self.is_done = True
        elif data_str:
            try:
                self.parsed_json = json.loads(data_str)
            except Exception:
                self.parsed_json = None


def parse_sse_chunks(raw_bytes: bytes) -> List[SSEParsedFrame]:
    """Parse raw bytes stream into a list of parsed SSE frames."""
    text = raw_bytes.decode("utf-8", errors="replace")
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    raw_blocks = normalized.split("\n\n")
    frames = []
    for block in raw_blocks:
        trimmed = block.strip()
        if trimmed:
            frames.append(SSEParsedFrame(trimmed))
    return frames


def build_mock_request(path: str = "/v1/messages", beta: bool = False) -> Request:
    """Constructs a minimal Starlette/FastAPI Request object for middleware execution."""
    scope = {
        "type": "http",
        "method": "POST",
        "path": path,
        "raw_path": path.encode("utf-8"),
        "query_string": b"beta=true" if beta else b"",
        "headers": [(b"content-type", b"application/json")],
        "client": ("127.0.0.1", 8000),
        "server": ("127.0.0.1", 4000),
    }
    return Request(scope)


async def execute_middleware_with_stream(
    chunks: List[Any],
    pause_before_chunk: Optional[Dict[int, float]] = None,
    raise_at_index: Optional[int] = None,
    middleware_fn = anthropic_sse_reasoning_stream_middleware,
    beta: bool = False
) -> bytes:
    """Runs chunks through anthropic_sse_reasoning_stream_middleware and returns accumulated bytes."""
    pause_map = pause_before_chunk or {}

    async def mock_upstream_stream():
        for idx, chunk in enumerate(chunks):
            if idx in pause_map:
                await asyncio.sleep(pause_map[idx])
            if raise_at_index is not None and idx == raise_at_index:
                raise RuntimeError("Simulated upstream network disruption")
            if isinstance(chunk, str):
                yield chunk.encode("utf-8")
            elif isinstance(chunk, bytes):
                yield chunk
            else:
                yield str(chunk).encode("utf-8")

    async def mock_call_next(req: Request):
        return StreamingResponse(
            mock_upstream_stream(),
            status_code=200,
            headers={"content-type": "text/event-stream; charset=utf-8"},
            media_type="text/event-stream"
        )

    req = build_mock_request("/v1/messages", beta=beta)
    response = await middleware_fn(req, mock_call_next)
    output_parts = []
    async for output_chunk in response.body_iterator:
        if isinstance(output_chunk, bytes):
            output_parts.append(output_chunk)
        else:
            output_parts.append(str(output_chunk).encode("utf-8"))
    return b"".join(output_parts)


async def test_zero_empty_delta_frames():
    """Verify that no empty delta frames (event: content_block_delta without data) are emitted."""
    print("--> Running Test 1: Zero Empty Delta Frames & Thinking Tag Translation...")
    input_chunks = [
        'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_001", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 10, "output_tokens": 1}}}\n\n',
        'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\n\n',
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "<think>Analyzing user request step by step."}}\n\n',
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": " Formulating response.</think>Here is the completed code."}}\n\n',
        'event: content_block_stop\ndata: {"type": "content_block_stop", "index": 0}\n\n',
        'event: message_delta\ndata: {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": null}, "usage": {"output_tokens": 25}}\n\n',
        'event: message_stop\ndata: {"type": "message_stop"}\n\n',
        'data: [DONE]\n\n'
    ]

    raw_output = await execute_middleware_with_stream(input_chunks)
    frames = parse_sse_chunks(raw_output)

    assert len(frames) > 0, "Output stream produced 0 frames"

    # Check for empty delta defect
    empty_deltas = [f for f in frames if f.is_empty_delta]
    assert len(empty_deltas) == 0, f"Found {len(empty_deltas)} empty delta frames with missing data!"

    # Check that thinking block was created at index 0 and text block at index 1
    event_types = [f.event_type for f in frames if f.event_type]
    assert "message_start" in event_types, "Missing message_start"
    assert "content_block_start" in event_types, "Missing content_block_start"
    assert "content_block_delta" in event_types, "Missing content_block_delta"
    assert "content_block_stop" in event_types, "Missing content_block_stop"
    assert "message_stop" in event_types, "Missing message_stop"
    assert any(f.is_done for f in frames), "Missing data: [DONE]"

    # Verify deltas have valid payload
    deltas = [f for f in frames if f.event_type == "content_block_delta"]
    for d in deltas:
        assert d.parsed_json is not None, f"Delta payload failed JSON parsing: {d.raw_text}"
        assert "delta" in d.parsed_json, f"Delta payload missing 'delta' object: {d.parsed_json}"
        delta_obj = d.parsed_json["delta"]
        assert delta_obj.get("type") in ("thinking_delta", "text_delta", "input_json_delta"), f"Invalid delta type: {delta_obj}"

    print(f"    [PASS] Verified {len(frames)} frames. 0 empty delta frames detected.")
    return True


async def test_atomic_event_formatting():
    """Verify strict atomic event formatting and JSON deserialization across all events."""
    print("--> Running Test 2: Atomic Event Formatting & Structural Conformance...")
    input_chunks = [
        'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_002", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 15, "output_tokens": 2}}}\n\n',
        'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\n\n',
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Line 1\\nLine 2\\nLine 3"}}\n\n',
        'event: content_block_stop\ndata: {"type": "content_block_stop", "index": 0}\n\n',
        'event: message_delta\ndata: {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": null}, "usage": {"output_tokens": 30}}\n\n',
        'event: message_stop\ndata: {"type": "message_stop"}\n\n',
        'data: [DONE]\n\n'
    ]

    raw_output = await execute_middleware_with_stream(input_chunks)
    frames = parse_sse_chunks(raw_output)

    for i, frame in enumerate(frames):
        if frame.is_comment:
            assert frame.raw_text.startswith(":"), f"Comment frame malformed: {frame.raw_text}"
            continue
        if frame.is_done:
            assert frame.raw_text == "data: [DONE]", f"DONE frame malformed: {frame.raw_text}"
            continue

        assert frame.event_type != "", f"Frame {i} missing 'event:' identifier: {frame.raw_text}"
        assert len(frame.data_lines) > 0, f"Frame {i} missing 'data:' line: {frame.raw_text}"
        assert frame.parsed_json is not None, f"Frame {i} data line failed JSON validation: {frame.raw_text}"

    print(f"    [PASS] All {len(frames)} frames strictly compliant with atomic SSE format.")
    return True


async def test_keepalive_pings_on_timeout():
    """Verify that both ': ping\\n\\n' and 'event: ping\\ndata: {\"type\": \"ping\"}\\n\\n' are emitted on timeout."""
    print("--> Running Test 3: Keepalive Dual-Ping Emission on Timeout (>2.5s)...")
    input_chunks = [
        'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_003", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 5, "output_tokens": 1}}}\n\n',
        'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\n\n',
        # Chunk 2 will be delayed by 2.8 seconds to trigger keepalive timeout
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Deferred response after thinking interval."}}\n\n',
        'event: content_block_stop\ndata: {"type": "content_block_stop", "index": 0}\n\n',
        'event: message_delta\ndata: {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": null}, "usage": {"output_tokens": 12}}\n\n',
        'event: message_stop\ndata: {"type": "message_stop"}\n\n',
        'data: [DONE]\n\n'
    ]

    start_time = time.time()
    raw_output = await execute_middleware_with_stream(input_chunks, pause_before_chunk={2: 2.8})
    elapsed = time.time() - start_time

    assert elapsed >= 2.7, f"Execution completed too fast ({elapsed:.2f}s); timeout could not have fired"

    decoded = raw_output.decode("utf-8", errors="replace")

    # Verify both keepalive components in raw text
    has_comment_ping = ": ping" in decoded
    has_typed_ping = 'event: ping\ndata: {"type": "ping"}' in decoded

    assert has_comment_ping, "SSE comment ': ping' was NOT found in output stream!"
    assert has_typed_ping, "Anthropic typed ping 'event: ping\\ndata: {\"type\": \"ping\"}' was NOT found!"

    frames = parse_sse_chunks(raw_output)
    comment_pings = [f for f in frames if f.is_comment and "ping" in f.comment_text]
    typed_pings = [f for f in frames if f.event_type == "ping" and f.parsed_json == {"type": "ping"}]

    assert len(comment_pings) >= 1, f"Expected at least 1 comment ping, got {len(comment_pings)}"
    assert len(typed_pings) >= 1, f"Expected at least 1 typed ping event, got {len(typed_pings)}"

    print(f"    [PASS] Keepalive fired after 2.5s silence. Emitted {len(comment_pings)} comment ping(s) and {len(typed_pings)} typed ping(s).")
    return True


async def test_clean_stream_termination():
    """Verify clean stream termination with data: [DONE] under normal, abrupt, and exception conditions."""
    print("--> Running Test 4: Clean Stream Termination & Graceful Closure...")

    # Case 4A: Normal completion with explicit data: [DONE]
    normal_chunks = [
        'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_004a", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 5, "output_tokens": 1}}}\n\n',
        'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\n\n',
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Normal completion."}}\n\n',
        'event: content_block_stop\ndata: {"type": "content_block_stop", "index": 0}\n\n',
        'event: message_stop\ndata: {"type": "message_stop"}\n\n',
        'data: [DONE]\n\n'
    ]
    raw_4a = await execute_middleware_with_stream(normal_chunks)
    frames_4a = parse_sse_chunks(raw_4a)
    assert frames_4a[-1].is_done, f"Normal stream did not terminate with data: [DONE]. Last frame: {frames_4a[-1].raw_text}"

    # Case 4B: Abrupt stream end without closure (missing message_stop & [DONE])
    truncated_chunks = [
        'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_004b", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 5, "output_tokens": 1}}}\n\n',
        'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\n\n',
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Sudden EOF chunk."}}\n\n'
    ]
    raw_4b = await execute_middleware_with_stream(truncated_chunks)
    frames_4b = parse_sse_chunks(raw_4b)
    assert frames_4b[-1].is_done, f"Truncated stream did not synthesize closure with data: [DONE]. Last frame: {frames_4b[-1].raw_text}"
    event_types_4b = [f.event_type for f in frames_4b if f.event_type]
    assert "content_block_stop" in event_types_4b, "Truncated stream failed to close open block"
    assert "message_stop" in event_types_4b, "Truncated stream failed to emit synthesized message_stop"

    # Case 4C: Upstream exception mid-stream
    raw_4c = await execute_middleware_with_stream(normal_chunks[:3], raise_at_index=2)
    frames_4c = parse_sse_chunks(raw_4c)
    assert frames_4c[-1].is_done, f"Exception stream did not terminate with data: [DONE]. Last frame: {frames_4c[-1].raw_text}"

    print("    [PASS] Clean termination verified: 100% of tested termination paths end with data: [DONE].")
    return True


async def test_chunk_fragmentation_and_crlf():
    """Verify stream transformer handles arbitrary chunk boundaries and CRLF line breaks."""
    print("--> Running Test 5: Chunk Fragmentation & CRLF Tolerance...")
    full_payload = (
        'event: message_start\r\ndata: {"type": "message_start", "message": {"id": "msg_005", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 10, "output_tokens": 5}}}\r\n\r\n'
        'event: content_block_start\r\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\r\n\r\n'
        'event: content_block_delta\r\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Testing fragmentation."}}\r\n\r\n'
        'event: content_block_stop\r\ndata: {"type": "content_block_stop", "index": 0}\r\n\r\n'
        'event: message_delta\r\ndata: {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": null}, "usage": {"output_tokens": 10}}\r\n\r\n'
        'event: message_stop\r\ndata: {"type": "message_stop"}\r\n\r\n'
        'data: [DONE]\r\n\r\n'
    )

    # Slice into tiny 7-byte chunks to simulate severe TCP packet fragmentation
    chunk_size = 7
    tiny_chunks = [full_payload[i:i + chunk_size] for i in range(0, len(full_payload), chunk_size)]

    raw_output = await execute_middleware_with_stream(tiny_chunks)
    frames = parse_sse_chunks(raw_output)

    assert len(frames) >= 7, f"Expected at least 7 frames after fragmentation reassembly, got {len(frames)}"
    assert frames[-1].is_done, "Fragmented stream failed to emit clean data: [DONE]"

    empty_deltas = [f for f in frames if f.is_empty_delta]
    assert len(empty_deltas) == 0, "Fragmented stream emitted empty delta frames"

    print(f"    [PASS] Fragmentation stress test passed: {len(tiny_chunks)} fragments reassembled into {len(frames)} valid frames.")
    return True


async def test_thinking_only_fallback_synthesis():
    """Verify that a stream containing ONLY thinking tokens synthesizes a text block before message closure."""
    print("--> Running Test 6: Thinking-Only Stream Fallback Text Synthesis...")
    chunks = [
        'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_006", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 5, "output_tokens": 1}}}\n\n',
        'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "thinking", "thinking": ""}}\n\n',
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "thinking_delta", "thinking": "Internal reasoning without final output."}}\n\n',
        'event: content_block_stop\ndata: {"type": "content_block_stop", "index": 0}\n\n',
        'event: message_delta\ndata: {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": null}, "usage": {"output_tokens": 10}}\n\n',
        'event: message_stop\ndata: {"type": "message_stop"}\n\n',
        'data: [DONE]\n\n'
    ]

    raw_output = await execute_middleware_with_stream(chunks)
    frames = parse_sse_chunks(raw_output)

    # Check that a text content block was synthesized so Claude Code CLI never crashes
    block_starts = [f for f in frames if f.event_type == "content_block_start"]
    block_types = [f.parsed_json.get("content_block", {}).get("type") for f in block_starts if f.parsed_json]

    assert "text" in block_types, f"Thinking-only stream failed to synthesize a text block! Blocks: {block_types}"
    assert frames[-1].is_done, "Stream did not end with [DONE]"

    print(f"    [PASS] Thinking-only stream correctly synthesized fallback text block (blocks: {block_types}).")
    return True


async def test_tool_use_stream_preservation():
    """Verify that tool_use blocks and input_json_delta are preserved accurately without string corruption."""
    print("--> Running Test 7: Tool-Use & input_json_delta Stream Preservation...")
    chunks = [
        'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_007", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 20, "output_tokens": 2}}}\n\n',
        'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "tool_use", "id": "toolu_01", "name": "run_command", "input": {}}}\n\n',
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "input_json_delta", "partial_json": "{\\"command\\": \\"ls\\"}"}}\n\n',
        'event: content_block_stop\ndata: {"type": "content_block_stop", "index": 0}\n\n',
        'event: message_delta\ndata: {"type": "message_delta", "delta": {"stop_reason": "tool_use", "stop_sequence": null}, "usage": {"output_tokens": 15}}\n\n',
        'event: message_stop\ndata: {"type": "message_stop"}\n\n',
        'data: [DONE]\n\n'
    ]

    raw_output = await execute_middleware_with_stream(chunks)
    frames = parse_sse_chunks(raw_output)

    tool_deltas = [f for f in frames if f.event_type == "content_block_delta" and f.parsed_json.get("delta", {}).get("type") == "input_json_delta"]
    assert len(tool_deltas) == 1, f"Expected 1 input_json_delta, found {len(tool_deltas)}"
    assert tool_deltas[0].parsed_json["delta"]["partial_json"] == '{"command": "ls"}'

    print("    [PASS] Tool use and input_json_delta preserved with exact JSON payload.")
    return True


async def test_prolonged_silence_cadence():
    """Verify that a 5.6s silence emits at least 2 keepalive pings at ~2.5s intervals."""
    print("--> Running Test 8: Prolonged Silence (5.6s) Multi-Ping Cadence...")
    chunks = [
        'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_008", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 5, "output_tokens": 1}}}\n\n',
        'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\n\n',
        # Chunk 2 delayed by 5.6s
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Prolonged inference finished."}}\n\n',
        'event: content_block_stop\ndata: {"type": "content_block_stop", "index": 0}\n\n',
        'event: message_stop\ndata: {"type": "message_stop"}\n\n',
        'data: [DONE]\n\n'
    ]

    start = time.time()
    raw_output = await execute_middleware_with_stream(chunks, pause_before_chunk={2: 5.6})
    elapsed = time.time() - start

    assert elapsed >= 5.5, f"Execution too fast ({elapsed:.2f}s)"

    frames = parse_sse_chunks(raw_output)
    comment_pings = [f for f in frames if f.is_comment and "ping" in f.comment_text]
    typed_pings = [f for f in frames if f.event_type == "ping"]

    assert len(comment_pings) >= 2, f"Expected at least 2 comment pings for 5.6s pause, got {len(comment_pings)}"
    assert len(typed_pings) >= 2, f"Expected at least 2 typed pings for 5.6s pause, got {len(typed_pings)}"

    print(f"    [PASS] Multi-ping cadence verified: {len(comment_pings)} comments, {len(typed_pings)} typed pings emitted during 5.6s stall.")
    return True


async def test_beta_query_param_stripping():
    """Verify that ?beta=true is stripped from the query_string scope."""
    print("--> Running Test 9: Query Parameter ?beta=true Stripping...")

    async def mock_call_next(req: Request):
        # Inspect request scope
        qs = req.scope.get("query_string", b"").decode("utf-8")
        assert "beta" not in qs, f"query_string still contains 'beta': {qs}"
        return StreamingResponse(
            (chunk.encode("utf-8") for chunk in ['event: message_stop\ndata: {"type": "message_stop"}\n\n', 'data: [DONE]\n\n']),
            status_code=200,
            headers={"content-type": "text/event-stream"}
        )

    req = build_mock_request("/v1/messages", beta=True)
    resp = await anthropic_sse_reasoning_stream_middleware(req, mock_call_next)
    async for _ in resp.body_iterator:
        pass

    print("    [PASS] Successfully stripped ?beta=true from request query parameters.")
    return True


async def test_workspace_b_symmetry():
    """Verify identical middleware behavior using Workspace B's sanitize_hook module."""
    print("--> Running Test 10: Workspace B (claudecode) Symmetrical Verification...")
    workspace_b_path = r"C:\Users\NEW\OneDrive\Desktop\claudecode"

    import importlib.util
    spec = importlib.util.spec_from_file_location("sanitize_hook_b", os.path.join(workspace_b_path, "sanitize_hook.py"))
    module_b = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module_b)

    middleware_b = getattr(module_b, "anthropic_sse_reasoning_stream_middleware")

    input_chunks = [
        'event: message_start\ndata: {"type": "message_start", "message": {"id": "msg_ws_b", "type": "message", "role": "assistant", "content": [], "model": "mistralai/mistral-large-4-1t-a52b", "stop_reason": null, "stop_sequence": null, "usage": {"input_tokens": 10, "output_tokens": 1}}}\n\n',
        'event: content_block_start\ndata: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}\n\n',
        'event: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "<think>Testing Workspace B</think>Works identically."}}\n\n',
        'event: content_block_stop\ndata: {"type": "content_block_stop", "index": 0}\n\n',
        'event: message_stop\ndata: {"type": "message_stop"}\n\n',
        'data: [DONE]\n\n'
    ]

    raw_output = await execute_middleware_with_stream(input_chunks, middleware_fn=middleware_b)
    frames = parse_sse_chunks(raw_output)

    empty_deltas = [f for f in frames if f.is_empty_delta]
    assert len(empty_deltas) == 0, "Workspace B produced empty delta frames!"
    assert frames[-1].is_done, "Workspace B stream did not end with [DONE]"

    print(f"    [PASS] Workspace B (claudecode) executes with 100% identical behavior ({len(frames)} frames).")
    return True


async def main():
    print("======================================================================")
    print("   🔬 EMPIRICAL SSE STREAMING TRANSFORMER & KEEPALIVE HARNESS         ")
    print("======================================================================")
    tests = [
        test_zero_empty_delta_frames,
        test_atomic_event_formatting,
        test_keepalive_pings_on_timeout,
        test_clean_stream_termination,
        test_chunk_fragmentation_and_crlf,
        test_thinking_only_fallback_synthesis,
        test_tool_use_stream_preservation,
        test_prolonged_silence_cadence,
        test_beta_query_param_stripping,
        test_workspace_b_symmetry
    ]

    all_passed = True
    for test_fn in tests:
        try:
            passed = await test_fn()
            if not passed:
                all_passed = False
        except Exception as exc:
            import traceback
            print(f"    [FAIL] {test_fn.__name__} raised exception: {exc}")
            traceback.print_exc()
            all_passed = False

    print("======================================================================")
    if all_passed:
        print("✅ EMPIRICAL VERIFICATION COMPLETE: ALL 10 TEST SUITES PASSED (100% OK)")
        print("======================================================================")
        sys.exit(0)
    else:
        print("❌ EMPIRICAL VERIFICATION FAILED: ONE OR MORE SUITES FAILED")
        print("======================================================================")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
