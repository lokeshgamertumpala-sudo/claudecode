---
description: Switch active model across all 11 NVIDIA NIM frontier models or list available engines
---

# 🤖 Frontier Model Switcher (/model)

Target Model / Argument: $ARGUMENTS

You are operating under the **Frontier Multi-Model Switching Protocol**.
Your goal is to inspect, select, and switch the active underlying AI engine across the 11 supported NVIDIA NIM models.

---

## ⚡ 1. Available Frontier Models

1. **Mistral Large 4** (`mistralai/mistral-large-4-1t-a52b`): 1.05T Frontier MoE, 52B Active **[PRIMARY DEFAULT]**
2. **NVIDIA Nemotron Ultra 550B MoE** (`nvidia/nemotron-3-ultra-550b-a55b`): 550B Reasoning Giant, sub-second latency
3. **Step 5 Preview** (`stepfun-ai/step-5-preview`): 600B MoE, 1M context window, multimodal reasoning
4. **MiniMax M3.1 Flash** (`minimaxai/minimax-m3.1-flash`): 428B MoE, ultra-fast agentic & code specialist
5. **DeepSeek V4.1 Flash** (`deepseek-ai/deepseek-v4.1-flash`): High-speed reasoning & coding powerhouse
6. **Poolside Laguna XS 2.1** (`poolside/laguna-xs-2.1`): Software engineering specialist
7. **DeepSeek R1** (`deepseek-ai/deepseek-r1`): 671B Frontier Open Reasoning Engine
8. **DeepSeek V3** (`deepseek-ai/deepseek-v3`): 671B Frontier MoE Code & Language Model
9. **Meta Llama 3.3 70B Instruct** (`meta/llama-3.3-70b-instruct`): 70B Frontier Open Instruction Model
10. **Qwen 2.5 72B Instruct** (`qwen/qwen2.5-72b-instruct`): 72B Advanced Reasoning & Code Flagship
11. **Auto Smart-Failover** (`auto`): Seamless resilience mesh with zero API errors

---

## 🚀 2. Execution Procedure

- If `$ARGUMENTS` is provided (e.g., `mistral`, `ultra`, `r1`, `auto`, `2`, `5`):
  Execute model switch:
  ```cmd
  python select_model.py $ARGUMENTS
  ```
- If `$ARGUMENTS` is empty:
  Display the interactive model menu:
  ```cmd
  python select_model.py --list
  ```

Confirm the active model preference is saved in `active_model.txt` and synced to `.claude/settings.json`.
