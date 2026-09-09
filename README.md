# Claude Code with NVIDIA NIM (Moonshot AI Kimi-K3)

Run Anthropic's **Claude Code** agentic CLI powered by **Moonshot AI Kimi-K3** hosted on **NVIDIA NIM** (`integrate.api.nvidia.com`).

---

## Autonomous Multi-Day Execution ("Run For Days" Mode)

To run Claude Code for hours or days autonomously (e.g., building a complete 3D game or full-stack application overnight without stopping):

### Launch Autonomous Mode:
```powershell
.\run-autonomous.ps1
```
*(Or double-click `run-autonomous.bat`)*

### What Autonomous Mode Does:
1. **Never Pauses for Permissions (`--dangerously-skip-permissions`)**: Automatically permits all file writes, edits, and shell commands so the agent never hangs waiting for user input while you are away.
2. **Infinite Context Management (`--autocompact auto`)**: Continuously compacts and archives old conversation turns so the session never crashes from context limits over days of work.
3. **24/7 Self-Healing Watchdog (`proxy-watchdog.ps1`)**: Automatically monitors port `4000`. If the proxy ever crashes, disconnects, or hits a memory glitch, the watchdog revives it within 2 seconds.
4. **30-Minute Generation Timeout (`request_timeout: 1800`)**: Prevents long thinking/reasoning turns from dropping the streaming connection.
5. **Multi-Tier Upstream Fallback**: If NVIDIA's `moonshotai/kimi-k3` endpoint hits a temporary 429 rate limit or 503 overload, LiteLLM automatically fails over to `minimaxai/minimax-m3`, `nvidia/nemotron-3-super-120b-a12b`, or `meta/llama-3.2-11b-vision-instruct`, keeping the autonomous loop alive without crashing.

---

## Standard Interactive Mode

To run standard interactive Claude Code:
```powershell
.\start-claude.ps1
```
*(Or double-click `start-claude.bat`)*

---

## Resume Any Session

If a session is interrupted or you want to continue where you left off:
```powershell
.\run-autonomous.ps1 --resume
```

---

## Stopping the Background Proxy
When you are completely finished with your work:
```powershell
.\stop-proxy.ps1
```
