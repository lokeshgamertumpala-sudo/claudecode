Output the following AI model selection guide directly as plain markdown text. DO NOT invoke any tool named "ai".

### 🤖 Active Model Selector (NVIDIA NIM Enterprise Proxy)

| # | Model Name | Slug | Speed | Key Strengths |
|---|------------|------|-------|---------------|
| **1** | **Auto Smart-Failover (Recommended)** | `auto` | ~0.3s | Prioritizes Nemotron 120B; adaptive failover across all models (Zero Errors) |
| **2** | **NVIDIA Nemotron 3 Super 120B** | `nemotron` | **~0.3s** | 120B enterprise model, ultra-fast, 100% quota |
| **3** | **Poolside Laguna XS 2.1** | `laguna` | ~0.3s | High-speed code specialist model |
| **4** | **OpenAI GPT-OSS 20B** | `gpt-oss` | ~0.6s | Fast utility & lightweight coding edits |
| **5** | **Moonshot AI Kimi-K3** | `kimi-k3` | ~1.5s | Deep reasoning & coding (rate-limited on free tier) |

Ask the user: "Which model would you like to use? Reply with the number (1-5) or model name."
If an argument or model name was provided, use the `Bash` tool to run:
`python c:\Users\NEW\OneDrive\Desktop\claudecode\select_model.py <arg>`
