# ⚡ Zero-Error Efficiency Standards

## 1. Sub-Second Pipeline Architecture
- **In-Memory Routing**: Model decisions, health cooldowns, and request sanitization must happen in-memory without synchronous HTTP network probes or disk I/O bottlenecks.
- **Fast Readiness Checks**: Always probe /health/readiness (returns in <5ms without touching upstream LLM models) instead of querying heavy /v1/models or completion endpoints.
- **Direct High-Capacity Fallbacks**: Route primary traffic and fallbacks to high-capacity, low-latency endpoints (e.g. 
vidia/nemotron-3-super-120b-a12b on NVIDIA NIM, ~0.5s response times).
- **Adaptive Cooldowns**: If an upstream provider rate-limits (429) or exhausts worker concurrency (ResourceExhausted), place that model in a 10-minute cooldown instantly so subsequent user requests do not hang.

## 2. Single-Instance Daemon Lifecycle
- **Zero Zombie Processes**: Never spawn a new daemon or proxy if a healthy process is already listening on the designated port (port 4000).
- **Process Tree Cleanup**: When stopping or restarting a proxy, use full process-tree termination (	askkill /F /T /PID) to kill both wrapper .exe and child python.exe processes.
- **Threshold Guard**: Watchdogs must require 3 consecutive failed health checks before concluding a service is dead, preventing flapping during heavy file processing.

## 3. Token & Memory Conservation
- Deliver focused, production-grade code without repetitive prose, placeholder commentary, or redundant echo statements.
- Avoid large duplicate logs in the workspace.
