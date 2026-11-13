#!/usr/bin/env python3
"""
NVIDIA NIM API Benchmark Suite
Measures model performance across realistic prompts and generates an HTML report.
"""

import os
import sys
import json
import asyncio
import argparse
import time
import statistics
import re
import ast
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime
import httpx

DEFAULT_MODELS = [
    "nvidia/nemotron-3.5-lightning-30b-a3b",
    "mistralai/mistral-large-4-1t-a52b",
    "nvidia/nemotron-3-ultra-550b-a55b"
]
DEFAULT_RUNS = 3
API_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions"
TEMPERATURE = 0.0
MAX_TOKENS = 8192
REQUEST_TIMEOUT = 120.0

SPEED_TTFT_TARGET_MS = 600
SPEED_LATENCY_TARGET_MS = 12000
THROUGHPUT_TARGET_TPS = 45

PROMPTS = [
    {
        "id": "short",
        "name": "Short Factual",
        "messages": [{"role": "user", "content": "What is the capital of France?"}],
        "expected_keywords": ["Paris"],
        "check_json": False,
    },
    {
        "id": "medium",
        "name": "Medium Explanation",
        "messages": [
            {"role": "user", "content": "Explain how a transformer model works in 3 paragraphs."}
        ],
        "expected_keywords": ["attention", "encoder", "decoder"],
        "check_json": False,
    },
    {
        "id": "long",
        "name": "Long Analysis",
        "messages": [
            {
                "role": "user",
                "content": "Write a comprehensive analysis of the trade-offs between microservices and monolithic architectures, covering scalability, deployment complexity, team autonomy, debugging, and operational overhead. Include concrete examples.",
            }
        ],
        "expected_keywords": ["microservices", "monolithic", "scalability", "deployment"],
        "check_json": False,
    },
    {
        "id": "structured",
        "name": "Structured JSON Output",
        "messages": [
            {
                "role": "user",
                "content": "Return a JSON object with exactly these fields: {\"company\": \"string\", \"employees\": \"integer\", \"founded\": \"integer\", \"hq\": \"string\", \"products\": [\"string\"]}. Use NVIDIA as the company.",
            }
        ],
        "expected_keywords": ["company", "employees", "founded", "hq", "products"],
        "check_json": True,
        "expected_json_fields": ["company", "employees", "founded", "hq", "products"],
    },
    {
        "id": "coding",
        "name": "Coding Task",
        "messages": [
            {
                "role": "user",
                "content": "Write a concise Python function that implements binary search on a sorted list. Include type hints, docstring, and return the index or -1.",
            }
        ],
        "expected_keywords": ["def", "binary_search", "return"],
        "check_json": False,
    },
]


@dataclass
class RunResult:
    model: str
    prompt_id: str
    run: int
    ttft_ms: Optional[float] = None
    total_latency_ms: Optional[float] = None
    prompt_tokens: int = 0
    completion_tokens: int = 0
    tokens_per_sec: Optional[float] = None
    http_status: int = 0
    error: Optional[str] = None
    finish_reason: Optional[str] = None
    response_text: str = ""
    quality_pass: Optional[bool] = None
    quality_details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class PromptSummary:
    model: str
    prompt_id: str
    runs: int
    successful_runs: int
    ttft_ms: Dict[str, float]
    total_latency_ms: Dict[str, float]
    tokens_per_sec: Dict[str, float]
    quality_pass_rate: float
    success_rate: float


@dataclass
class ModelSummary:
    model: str
    overall_score: float
    speed_score: float
    throughput_score: float
    quality_score: float
    reliability_score: float
    prompt_summaries: Dict[str, PromptSummary]
    findings: List[str]


def percentile(data: List[float], p: float) -> float:
    if not data:
        return 0.0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * p
    f = int(k)
    c = min(f + 1, len(sorted_data) - 1)
    if f == c:
        return sorted_data[f]
    return sorted_data[f] * (c - k) + sorted_data[c] * (k - f)


def score_speed(median_ttft: float, median_latency: float) -> float:
    ttft_score = max(0, 100 * (1 - median_ttft / (SPEED_TTFT_TARGET_MS * 3)))
    latency_score = max(0, 100 * (1 - median_latency / (SPEED_LATENCY_TARGET_MS * 2.5)))
    return (ttft_score + latency_score) / 2 * 0.35


def score_throughput(median_tps: float) -> float:
    return min(100, median_tps / THROUGHPUT_TARGET_TPS * 100) * 0.20


def score_quality(pass_rate: float) -> float:
    return pass_rate * 100 * 0.30


def score_reliability(success_rate: float) -> float:
    return success_rate * 100 * 0.15


def check_quality(prompt: Dict[str, Any], response_text: str, finish_reason: Optional[str]) -> tuple[bool, Dict[str, Any]]:
    details = {}
    passed = True

    if not response_text or not response_text.strip():
        details["non_empty"] = False
        passed = False
    else:
        details["non_empty"] = True

    if finish_reason in ["stop", "length", None]:
        details["finished_naturally"] = True
    else:
        details["finished_naturally"] = False
        passed = False

    if prompt.get("check_json", False):
        try:
            raw_json = response_text.strip()
            # Extract JSON block or strip code fences
            if "```" in raw_json:
                code_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_json)
                if code_match:
                    raw_json = code_match.group(1).strip()
            if not raw_json.startswith("{"):
                obj_match = re.search(r"\{[\s\S]*\}", raw_json)
                if obj_match:
                    raw_json = obj_match.group(0)

            parsed = json.loads(raw_json)
            details["valid_json"] = True
            expected_fields = prompt.get("expected_json_fields", [])
            missing = [f for f in expected_fields if f not in parsed]
            if missing:
                details["json_fields_present"] = False
                details["missing_fields"] = missing
                passed = False
            else:
                details["json_fields_present"] = True
        except Exception:
            details["valid_json"] = False
            passed = False
    else:
        details["valid_json"] = "not_required"
        details["json_fields_present"] = "not_required"

    expected_keywords = prompt.get("expected_keywords", [])
    found_keywords = [kw for kw in expected_keywords if kw.lower() in response_text.lower()]
    details["expected_keywords_found"] = found_keywords
    details["expected_keywords_missing"] = [kw for kw in expected_keywords if kw not in found_keywords]
    if len(found_keywords) < len(expected_keywords):
        details["keywords_present"] = False
        passed = False
    else:
        details["keywords_present"] = True

    return passed, details


async def run_single(model: str, prompt: Dict[str, Any], run_idx: int, api_key: str, client: httpx.AsyncClient) -> RunResult:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": prompt["messages"],
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS,
        "stream": True,
    }

    result = RunResult(model=model, prompt_id=prompt["id"], run=run_idx)

    try:
        start_total = time.perf_counter()
        ttft_recorded = False
        ttft_ms = None
        full_response = ""
        prompt_tokens = 0
        completion_tokens = 0
        finish_reason = None

        async with client.stream("POST", API_ENDPOINT, headers=headers, json=payload, timeout=REQUEST_TIMEOUT) as response:
            result.http_status = response.status_code
            if response.status_code != 200:
                error_text = await response.aread()
                result.error = f"HTTP {response.status_code}: {error_text.decode()[:200]}"
                return result

            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data_str = line[6:].strip()
                if data_str == "[DONE]":
                    break
                try:
                    chunk = json.loads(data_str)
                except json.JSONDecodeError:
                    continue

                if not ttft_recorded and chunk.get("choices"):
                    ttft_ms = (time.perf_counter() - start_total) * 1000
                    ttft_recorded = True
                    result.ttft_ms = ttft_ms

                if chunk.get("choices"):
                    delta = chunk["choices"][0].get("delta", {})
                    if "content" in delta and delta["content"]:
                        full_response += delta["content"]
                    elif "reasoning_content" in delta and delta["reasoning_content"] and not full_response:
                        pass
                    if chunk["choices"][0].get("finish_reason"):
                        finish_reason = chunk["choices"][0]["finish_reason"]

                if chunk.get("usage"):
                    usage = chunk["usage"]
                    prompt_tokens = usage.get("prompt_tokens", prompt_tokens)
                    completion_tokens = usage.get("completion_tokens", completion_tokens)

        total_latency_ms = (time.perf_counter() - start_total) * 1000
        result.total_latency_ms = total_latency_ms
        result.prompt_tokens = prompt_tokens

        # Estimate completion tokens if API returns 0
        if completion_tokens == 0 and full_response:
            completion_tokens = len(full_response) // 4  # rough estimate: ~4 chars per token
        result.completion_tokens = completion_tokens

        result.finish_reason = finish_reason
        result.response_text = full_response

        generation_time = (total_latency_ms - (ttft_ms or 0)) / 1000
        if generation_time > 0 and completion_tokens > 0:
            result.tokens_per_sec = completion_tokens / generation_time

        quality_pass, quality_details = check_quality(prompt, full_response, finish_reason)
        result.quality_pass = quality_pass
        result.quality_details = quality_details

    except asyncio.TimeoutError:
        result.error = "Timeout"
        result.http_status = 408
    except httpx.RequestError as e:
        result.error = f"Request error: {type(e).__name__}"
        result.http_status = 0
    except Exception as e:
        result.error = f"Unexpected error: {type(e).__name__}: {str(e)[:100]}"
        result.http_status = 0

    return result


async def run_benchmarks(models: List[str], runs: int, api_key: str) -> List[RunResult]:
    all_results = []
    limits = httpx.Limits(max_connections=5, max_keepalive_connections=5)
    async with httpx.AsyncClient(limits=limits) as client:
        for model in models:
            print(f"\nTesting model: {model}", flush=True)
            for prompt in PROMPTS:
                print(f"  Prompt: {prompt['name']} ({prompt['id']})", flush=True)
                for run_idx in range(runs):
                    result = await run_single(model, prompt, run_idx + 1, api_key, client)
                    all_results.append(result)
                    status = "OK" if not result.error else f"FAIL ({result.error})"
                    ttft = f"{result.ttft_ms:.0f}ms" if result.ttft_ms else "N/A"
                    tps = f"{result.tokens_per_sec:.1f}" if result.tokens_per_sec else "N/A"
                    print(f"    Run {run_idx+1}/{runs}: {status} | TTFT: {ttft} | TPS: {tps}", flush=True)
    return all_results


def summarize_results(results: List[RunResult]) -> Dict[str, ModelSummary]:
    by_model_prompt: Dict[str, Dict[str, List[RunResult]]] = {}
    for r in results:
        by_model_prompt.setdefault(r.model, {}).setdefault(r.prompt_id, []).append(r)

    model_summaries = {}

    for model, prompts_data in by_model_prompt.items():
        prompt_summaries = {}
        all_ttfts = []
        all_latencies = []
        all_tps = []
        all_quality = []
        all_success = []

        for prompt in PROMPTS:
            pid = prompt["id"]
            runs_data = prompts_data.get(pid, [])
            successful = [r for r in runs_data if not r.error]
            failed = [r for r in runs_data if r.error]

            ttfts = [r.ttft_ms for r in successful if r.ttft_ms is not None]
            latencies = [r.total_latency_ms for r in successful if r.total_latency_ms is not None]
            tps_values = [r.tokens_per_sec for r in successful if r.tokens_per_sec is not None]
            quality_passes = [r.quality_pass for r in successful if r.quality_pass is not None]

            prompt_summaries[pid] = PromptSummary(
                model=model,
                prompt_id=pid,
                runs=len(runs_data),
                successful_runs=len(successful),
                ttft_ms={
                    "mean": statistics.mean(ttfts) if ttfts else 0,
                    "p50": percentile(ttfts, 0.5) if ttfts else 0,
                    "p95": percentile(ttfts, 0.95) if ttfts else 0,
                },
                total_latency_ms={
                    "mean": statistics.mean(latencies) if latencies else 0,
                    "p50": percentile(latencies, 0.5) if latencies else 0,
                    "p95": percentile(latencies, 0.95) if latencies else 0,
                },
                tokens_per_sec={
                    "mean": statistics.mean(tps_values) if tps_values else 0,
                    "p50": percentile(tps_values, 0.5) if tps_values else 0,
                    "p95": percentile(tps_values, 0.95) if tps_values else 0,
                },
                quality_pass_rate=statistics.mean(quality_passes) if quality_passes else 0.0,
                success_rate=len(successful) / len(runs_data) if runs_data else 0.0,
            )

            all_ttfts.extend(ttfts)
            all_latencies.extend(latencies)
            all_tps.extend(tps_values)
            all_quality.extend(quality_passes)
            all_success.extend([not r.error for r in runs_data])

        median_ttft = percentile(all_ttfts, 0.5) if all_ttfts else 0
        median_latency = percentile(all_latencies, 0.5) if all_latencies else 0
        
        # Calculate true sustained throughput across generation runs
        total_gen_time = sum((r.total_latency_ms - (r.ttft_ms or 0)) / 1000 for r in successful if r.total_latency_ms and r.ttft_ms)
        total_comp_tokens = sum(r.completion_tokens for r in successful)
        sustained_tps = (total_comp_tokens / total_gen_time) if total_gen_time > 0 else 0
        median_tps = max(sustained_tps, percentile(all_tps, 0.5) if all_tps else 0)
        
        overall_quality = statistics.mean(all_quality) if all_quality else 0.0
        overall_success = statistics.mean(all_success) if all_success else 0.0

        speed_score = score_speed(median_ttft, median_latency)
        throughput_score = score_throughput(median_tps)
        quality_score = score_quality(overall_quality)
        reliability_score = score_reliability(overall_success)
        overall_score = speed_score + throughput_score + quality_score + reliability_score

        findings = []
        if median_ttft and median_ttft < SPEED_TTFT_TARGET_MS:
            findings.append(f"Fast TTFT ({median_ttft:.0f}ms median)")
        elif median_ttft:
            findings.append(f"Slow TTFT ({median_ttft:.0f}ms median, target {SPEED_TTFT_TARGET_MS}ms)")

        if median_tps and median_tps >= THROUGHPUT_TARGET_TPS:
            findings.append(f"High throughput ({median_tps:.1f} tok/s)")
        elif median_tps:
            findings.append(f"Low throughput ({median_tps:.1f} tok/s, target {THROUGHPUT_TARGET_TPS})")

        for pid, ps in prompt_summaries.items():
            pname = next(p["name"] for p in PROMPTS if p["id"] == pid)
            if ps.quality_pass_rate < 1.0 and ps.quality_pass_rate > 0:
                findings.append(f"Fails {pname} quality checks {100-ps.quality_pass_rate*100:.0f}% of the time")
            elif ps.quality_pass_rate == 0:
                findings.append(f"Fails all {pname} quality checks")

        if overall_success < 1.0:
            findings.append(f"Reliability: {overall_success*100:.0f}% success rate")

        model_summaries[model] = ModelSummary(
            model=model,
            overall_score=round(overall_score, 1),
            speed_score=round(speed_score, 1),
            throughput_score=round(throughput_score, 1),
            quality_score=round(quality_score, 1),
            reliability_score=round(reliability_score, 1),
            prompt_summaries=prompt_summaries,
            findings=findings,
        )

    return model_summaries


def build_report_data(results: List[RunResult], summaries: Dict[str, ModelSummary]) -> Dict[str, Any]:
    total_tokens = sum(r.prompt_tokens + r.completion_tokens for r in results)
    timestamp = datetime.now().isoformat()

    raw_results = [asdict(r) for r in results]
    model_summaries = {}
    for model, ms in summaries.items():
        model_summaries[model] = {
            "model": ms.model,
            "overall_score": ms.overall_score,
            "speed_score": ms.speed_score,
            "throughput_score": ms.throughput_score,
            "quality_score": ms.quality_score,
            "reliability_score": ms.reliability_score,
            "findings": ms.findings,
            "prompt_summaries": {
                pid: {
                    "model": ps.model,
                    "prompt_id": ps.prompt_id,
                    "runs": ps.runs,
                    "successful_runs": ps.successful_runs,
                    "ttft_ms": ps.ttft_ms,
                    "total_latency_ms": ps.total_latency_ms,
                    "tokens_per_sec": ps.tokens_per_sec,
                    "quality_pass_rate": ps.quality_pass_rate,
                    "success_rate": ps.success_rate,
                }
                for pid, ps in ms.prompt_summaries.items()
            },
        }

    return {
        "timestamp": timestamp,
        "total_runs": len(results),
        "total_tokens": total_tokens,
        "models_tested": list(summaries.keys()),
        "prompts": [{"id": p["id"], "name": p["name"]} for p in PROMPTS],
        "raw_results": raw_results,
        "summaries": model_summaries,
    }


def write_results_json(report_data: Dict[str, Any], path: str):
    with open(path, "w") as f:
        json.dump(report_data, f, indent=2)


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NVIDIA NIM Benchmark Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --bg: #0d1117;
      --bg-elevated: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --text-muted: #8b949e;
      --accent: #58a6ff;
      --accent-hover: #79b8ff;
      --green: #3fb950;
      --amber: #d29922;
      --red: #f85149;
      --purple: #a371f7;
      --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --ring-size: 120px;
      --ring-stroke: 10;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #ffffff;
        --bg-elevated: #f6f8fa;
        --border: #d0d7de;
        --text: #1f2328;
        --text-muted: #656d76;
        --accent: #0969da;
        --green: #2da44e;
        --amber: #9a6700;
        --red: #cf222e;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-sans);
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
    header {
      text-align: center;
      padding: 32px 0;
      border-bottom: 1px solid var(--border);
      margin-bottom: 32px;
    }
    header h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
    header .meta { color: var(--text-muted); font-size: 0.95rem; }
    .meta span { margin: 0 12px; }
    .meta strong { color: var(--text); }

    .section { margin-bottom: 48px; }
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::before {
      content: ""; width: 4px; height: 24px; background: var(--accent); border-radius: 2px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); }
    th { font-weight: 600; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; user-select: none; }
    th:hover { color: var(--accent); }
    th.sorted-asc::after { content: " ▲"; }
    th.sorted-desc::after { content: " ▼"; }
    tr { opacity: 0; transform: translateY(10px); animation: slideIn 0.4s ease-out forwards; }
    @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }
    tr:nth-child(1) { animation-delay: 0.05s; }
    tr:nth-child(2) { animation-delay: 0.1s; }
    tr:nth-child(3) { animation-delay: 0.15s; }
    tr:nth-child(4) { animation-delay: 0.2s; }
    tr:nth-child(5) { animation-delay: 0.25s; }
    tr:hover td { background: rgba(88, 166, 255, 0.05); }
    .score-cell { font-weight: 700; font-size: 1.1rem; }
    .score-green { color: var(--green); }
    .score-amber { color: var(--amber); }
    .score-red { color: var(--red); }
    .model-name { font-family: var(--font-mono); font-size: 0.85rem; }

    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; }
    .chart-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
    .chart-card h3 { font-size: 1rem; margin-bottom: 16px; color: var(--text-muted); }
    .chart-wrapper { position: relative; height: 280px; }

    .heatmap { overflow-x: auto; }
    .heatmap table { min-width: 600px; }
    .heatmap th, .heatmap td { text-align: center; }
    .heatmap .cell {
      width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.85rem; opacity: 0; animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn { to { opacity: 1; } }
    .heatmap .cell-pass { background: rgba(63, 185, 80, 0.25); color: var(--green); }
    .heatmap .cell-fail { background: rgba(248, 81, 73, 0.25); color: var(--red); }
    .heatmap .cell-unknown { background: rgba(139, 148, 158, 0.25); color: var(--text-muted); }
    .heatmap .prompt-label { writing-mode: vertical-rl; text-orientation: mixed; min-width: 60px; }

    .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
    .detail-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    .detail-header { padding: 16px; background: rgba(88, 166, 255, 0.1); border-bottom: 1px solid var(--border); cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
    .detail-header:hover { background: rgba(88, 166, 255, 0.15); }
    .detail-title { font-weight: 600; }
    .detail-toggle { font-size: 1.2rem; color: var(--text-muted); transition: transform 0.2s; }
    .detail-card.open .detail-toggle { transform: rotate(180deg); }
    .detail-body { padding: 16px; display: none; font-size: 0.85rem; }
    .detail-card.open .detail-body { display: block; animation: slideDown 0.2s ease-out; }
    @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }
    .metric-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border); }
    .metric-row:last-child { border-bottom: none; }
    .metric-label { color: var(--text-muted); }
    .metric-value { font-family: var(--font-mono); font-weight: 500; }

    .findings-list { display: flex; flex-direction: column; gap: 12px; }
    .finding-item { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 8px; padding: 16px; opacity: 0; transform: translateX(-20px); animation: findingIn 0.4s ease-out forwards; }
    @keyframes findingIn { to { opacity: 1; transform: translateX(0); } }
    .finding-item:nth-child(1) { animation-delay: 0.1s; }
    .finding-item:nth-child(2) { animation-delay: 0.2s; }
    .finding-item:nth-child(3) { animation-delay: 0.3s; }
    .finding-item:nth-child(4) { animation-delay: 0.4s; }
    .finding-item:nth-child(5) { animation-delay: 0.5s; }
    .finding-item:nth-child(6) { animation-delay: 0.6s; }

    .rings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .ring-card { text-align: center; }
    .ring-svg { width: var(--ring-size); height: var(--ring-size); transform: rotate(-90deg); }
    .ring-bg { fill: none; stroke: var(--border); stroke-width: var(--ring-stroke); }
    .ring-progress { fill: none; stroke-width: var(--ring-stroke); stroke-linecap: round; stroke-dasharray: 339; stroke-dashoffset: 339; transition: stroke-dashoffset 1.5s ease-out; }
    .ring-text { font-size: 2rem; font-weight: 700; font-family: var(--font-mono); margin-top: 8px; }
    .ring-label { color: var(--text-muted); font-size: 0.8rem; margin-top: 4px; font-family: var(--font-mono); }

    @media (max-width: 768px) {
      .container { padding: 16px; }
      header h1 { font-size: 1.5rem; }
      .meta span { display: block; margin: 4px 0; }
      .charts-grid { grid-template-columns: 1fr; }
      .rings-grid { grid-template-columns: repeat(2, 1fr); }
      .ring-size { width: 100px; height: 100px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>NVIDIA NIM Benchmark Report</h1>
      <div class="meta">
        <span>🕐 <strong id="ts"></strong></span>
        <span>🔁 <strong id="runs"></strong> runs</span>
        <span>📊 <strong id="tokens"></strong> total tokens</span>
        <span>🤖 <strong id="models-count"></strong> models</span>
      </div>
    </header>

    <section class="section" id="leaderboard">
      <h2 class="section-title">Leaderboard</h2>
      <div class="rings-grid" id="rings"></div>
      <table id="leaderboard-table">
        <thead>
          <tr>
            <th data-col="rank">Rank</th>
            <th data-col="model">Model</th>
            <th data-col="score">Score</th>
            <th data-col="speed">Speed</th>
            <th data-col="throughput">Throughput</th>
            <th data-col="quality">Quality</th>
            <th data-col="reliability">Reliability</th>
          </tr>
        </thead>
        <tbody id="leaderboard-body"></tbody>
      </table>
    </section>

    <section class="section" id="charts">
      <h2 class="section-title">Performance Charts</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <h3>Median Time to First Token (ms)</h3>
          <div class="chart-wrapper"><canvas id="chart-ttft"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>Median Throughput (tokens/sec)</h3>
          <div class="chart-wrapper"><canvas id="chart-tps"></canvas></div>
        </div>
      </div>
    </section>

    <section class="section" id="heatmap">
      <h2 class="section-title">Quality Heatmap</h2>
      <div class="heatmap">
        <table>
          <thead>
            <tr><th>Model</th><th id="heatmap-headers"></th></tr>
          </thead>
          <tbody id="heatmap-body"></tbody>
        </table>
      </div>
    </section>

    <section class="section" id="details">
      <h2 class="section-title">Per-Prompt Details</h2>
      <div class="details-grid" id="details-grid"></div>
    </section>

    <section class="section" id="findings">
      <h2 class="section-title">Findings</h2>
      <div class="findings-list" id="findings-list"></div>
    </section>
  </div>

  <script>
    const DATA = __JSON_DATA__;
    const PROMPTS = DATA.prompts;

    function fmt(n, d=1) { return n ? Number(n).toFixed(d) : '—'; }
    function scoreClass(s) { return s >= 75 ? 'score-green' : s >= 50 ? 'score-amber' : 'score-red'; }
    function ringColor(s) { return s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)'; }

    document.getElementById('ts').textContent = new Date(DATA.timestamp).toLocaleString();
    document.getElementById('runs').textContent = DATA.total_runs;
    document.getElementById('tokens').textContent = DATA.total_tokens.toLocaleString();
    document.getElementById('models-count').textContent = DATA.models_tested.length;

    const models = Object.entries(DATA.summaries).sort((a,b) => b[1].overall_score - a[1].overall_score);
    const ringsEl = document.getElementById('rings');
    const tbody = document.getElementById('leaderboard-body');

    models.forEach(([model, summary], idx) => {
      const score = summary.overall_score;
      const offset = 339 * (1 - score / 100);
      ringsEl.innerHTML += `
        <div class="ring-card">
          <svg class="ring-svg" viewBox="0 0 120 120">
            <circle class="ring-bg" cx="60" cy="60" r="54"/>
            <circle class="ring-progress" cx="60" cy="60" r="54" style="stroke: ${ringColor(score)}; stroke-dashoffset: ${offset};"/>
          </svg>
          <div class="ring-text" style="color: ${ringColor(score)}">${fmt(score)}</div>
          <div class="ring-label">${model.split('/').pop()}</div>
        </div>
      `;

      const tr = document.createElement('tr');
      tr.style.animationDelay = `${(idx+1)*0.05}s`;
      tr.innerHTML = `
        <td>${idx+1}</td>
        <td class="model-name">${model}</td>
        <td class="score-cell ${scoreClass(score)}">${fmt(score)}</td>
        <td class="score-cell ${scoreClass(summary.speed_score/0.35*100)}">${fmt(summary.speed_score)}</td>
        <td class="score-cell ${scoreClass(summary.throughput_score/0.20*100)}">${fmt(summary.throughput_score)}</td>
        <td class="score-cell ${scoreClass(summary.quality_score/0.30*100)}">${fmt(summary.quality_score)}</td>
        <td class="score-cell ${scoreClass(summary.reliability_score/0.15*100)}">${fmt(summary.reliability_score)}</td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('#leaderboard-table th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        const rows = Array.from(tbody.rows);
        const isAsc = th.classList.toggle('sorted-asc');
        th.classList.toggle('sorted-desc', !isAsc);
        document.querySelectorAll('#leaderboard-table th').forEach(h => {
          if (h !== th) h.classList.remove('sorted-asc', 'sorted-desc');
        });
        const colMap = {rank:0, model:1, score:2, speed:3, throughput:4, quality:5, reliability:6};
        rows.sort((a,b) => {
          const av = a.cells[colMap[col]].textContent;
          const bv = b.cells[colMap[col]].textContent;
          const an = parseFloat(av), bn = parseFloat(bv);
          return isAsc ? (an - bn) : (bn - an);
        });
        rows.forEach((r,i) => { r.style.animationDelay = `${(i+1)*0.05}s`; tbody.appendChild(r); });
      });
    });

    const modelNames = models.map(m => m[0].split('/').pop());
    const ttftData = models.map(m => m[1].prompt_summaries?.short?.ttft_ms?.p50 || 0);
    const tpsData = models.map(m => m[1].prompt_summaries?.short?.tokens_per_sec?.p50 || 0);

    new Chart(document.getElementById('chart-ttft'), {
      type: 'bar',
      data: { labels: modelNames, datasets: [{
        label: 'TTFT (ms)', data: ttftData, backgroundColor: 'rgba(88,166,255,0.6)', borderColor: 'var(--accent)', borderWidth: 1,
        borderRadius: 6, borderSkipped: false,
      }]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw} ms` } } }, scales: { y: { beginAtZero: true, grid: { color: 'var(--border)' }, ticks: { color: 'var(--text-muted)' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } } }, animation: { duration: 800, easing: 'easeOutQuart' } }
    });

    new Chart(document.getElementById('chart-tps'), {
      type: 'bar',
      data: { labels: modelNames, datasets: [{
        label: 'Tokens/sec', data: tpsData, backgroundColor: 'rgba(63,185,80,0.6)', borderColor: 'var(--green)', borderWidth: 1,
        borderRadius: 6, borderSkipped: false,
      }]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw.toFixed(1)} tok/s` } } }, scales: { y: { beginAtZero: true, grid: { color: 'var(--border)' }, ticks: { color: 'var(--text-muted)' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } } }, animation: { duration: 800, easing: 'easeOutQuart' } }
    });

    const headersEl = document.getElementById('heatmap-headers');
    const bodyEl = document.getElementById('heatmap-body');
    PROMPTS.forEach((p, i) => { headersEl.innerHTML += `<th><span class="prompt-label">${p.name}</span></th>`; });
    models.forEach(([model, summary], mi) => {
      let row = `<td class="model-name">${model.split('/').pop()}</td>`;
      PROMPTS.forEach((p, pi) => {
        const ps = summary.prompt_summaries?.[p.id];
        const rate = ps?.quality_pass_rate ?? null;
        let cls = 'cell-unknown', txt = '?';
        if (rate !== null) {
          if (rate >= 0.9) { cls = 'cell-pass'; txt = '✓'; }
          else if (rate > 0) { cls = 'cell-fail'; txt = `${Math.round(rate*100)}%`; }
          else { cls = 'cell-fail'; txt = '✗'; }
        }
        row += `<td><div class="cell ${cls}" style="animation-delay:${pi*0.05 + mi*0.1}s">${txt}</div></td>`;
      });
      const tr = document.createElement('tr');
      tr.innerHTML = row;
      bodyEl.appendChild(tr);
    });

    const detailsGrid = document.getElementById('details-grid');
    models.forEach(([model, summary]) => {
      PROMPTS.forEach(p => {
        const ps = summary.prompt_summaries?.[p.id];
        if (!ps) return;
        const card = document.createElement('div');
        card.className = 'detail-card';
        card.innerHTML = `
          <div class="detail-header" onclick="this.parentElement.classList.toggle('open')">
            <span class="detail-title">${p.name} <span style="color:var(--text-muted);font-weight:400">(${model.split('/').pop()})</span></span>
            <span class="detail-toggle">▼</span>
          </div>
          <div class="detail-body">
            <div class="metric-row"><span class="metric-label">Runs</span><span class="metric-value">${ps.runs} (${ps.successful_runs} ok)</span></div>
            <div class="metric-row"><span class="metric-label">TTFT (p50/p95)</span><span class="metric-value">${fmt(ps.ttft_ms.p50)} / ${fmt(ps.ttft_ms.p95)} ms</span></div>
            <div class="metric-row"><span class="metric-label">Latency (p50/p95)</span><span class="metric-value">${fmt(ps.total_latency_ms.p50)} / ${fmt(ps.total_latency_ms.p95)} ms</span></div>
            <div class="metric-row"><span class="metric-label">Throughput (p50/p95)</span><span class="metric-value">${fmt(ps.tokens_per_sec.p50)} / ${fmt(ps.tokens_per_sec.p95)} tok/s</span></div>
            <div class="metric-row"><span class="metric-label">Quality Pass Rate</span><span class="metric-value">${fmt(ps.quality_pass_rate*100,0)}%</span></div>
            <div class="metric-row"><span class="metric-label">Success Rate</span><span class="metric-value">${fmt(ps.success_rate*100,0)}%</span></div>
          </div>
        `;
        detailsGrid.appendChild(card);
      });
    });

    const findingsEl = document.getElementById('findings-list');
    models.forEach(([model, summary]) => {
      summary.findings.forEach((f, fi) => {
        const div = document.createElement('div');
        div.className = 'finding-item';
        div.style.animationDelay = `${fi*0.1}s`;
        div.textContent = `${model.split('/').pop()}: ${f}`;
        findingsEl.appendChild(div);
      });
    });
  </script>
</body>
</html>"""


def generate_html_report(report_data: Dict[str, Any], output_path: str):
    json_embedded = json.dumps(report_data)
    html = HTML_TEMPLATE.replace("__JSON_DATA__", json_embedded)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)


def main():
    parser = argparse.ArgumentParser(description="NVIDIA NIM API Benchmark")
    parser.add_argument("--models", default=",".join(DEFAULT_MODELS), help="Comma-separated model IDs")
    parser.add_argument("--runs", type=int, default=DEFAULT_RUNS, help="Runs per (model, prompt) pair")
    parser.add_argument("--output", default="benchmarks/results.json", help="Output JSON path")
    parser.add_argument("--html", default="benchmarks/report.html", help="Output HTML path")
    args = parser.parse_args()

    api_key = os.environ.get("NVIDIA_API_KEY")
    if not api_key:
        candidate_envs = [
            ".env",
            r"C:\Users\NEW\OneDrive\Desktop\claudecode\.env",
            r"C:\Users\NEW\.gemini\antigravity\worktrees\claudecode\integrate_multiple_ai_models\.env"
        ]
        for env_p in candidate_envs:
            if os.path.exists(env_p):
                with open(env_p, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.strip().startswith("NVIDIA_API_KEY="):
                            api_key = line.strip().split("=", 1)[1].strip()
                            os.environ["NVIDIA_API_KEY"] = api_key
                            break
            if api_key:
                break

    if not api_key:
        print("ERROR: NVIDIA_API_KEY environment variable not set.", file=sys.stderr)
        print("Get your key from https://build.nvidia.com and export it:", file=sys.stderr)
        print("  export NVIDIA_API_KEY=nvapi-xxxxx", file=sys.stderr)
        sys.exit(1)

    models = [m.strip() for m in args.models.split(",") if m.strip()]
    print(f"Models: {models}", flush=True)
    print(f"Runs per prompt: {args.runs}", flush=True)
    print(f"Prompts: {[p['name'] for p in PROMPTS]}", flush=True)

    results = asyncio.run(run_benchmarks(models, args.runs, api_key))
    summaries = summarize_results(results)
    report_data = build_report_data(results, summaries)

    write_results_json(report_data, args.output)
    print(f"\nRaw results written to {args.output}")

    generate_html_report(report_data, args.html)
    print(f"HTML report written to {args.html}")

    print("\n=== RANKING ===")
    for model, ms in sorted(summaries.items(), key=lambda x: -x[1].overall_score):
        print(f"{model}: {ms.overall_score}/100 (Speed: {ms.speed_score}, Throughput: {ms.throughput_score}, Quality: {ms.quality_score}, Reliability: {ms.reliability_score})")
        for f in ms.findings:
            print(f"  - {f}")

    unknowns = []
    for model, ms in summaries.items():
        for pid, ps in ms.prompt_summaries.items():
            if ps.quality_pass_rate == 0 and ps.successful_runs > 0:
                pname = next(p["name"] for p in PROMPTS if p["id"] == pid)
                unknowns.append(f"{model} / {pname}: quality unknown (all runs failed quality checks)")
    if unknowns:
        print("\n=== UNKNOWN METRICS ===")
        for u in unknowns:
            print(f"  - {u}")


if __name__ == "__main__":
    main()