Output the following AI model selection guide directly as plain markdown text. DO NOT invoke any tool named "ai".

### 🤖 Active Model Selector (NVIDIA NIM Enterprise Proxy)

| # | Model Name | Slug | Speed | Key Strengths |
|---|------------|------|-------|---------------|
| **1** | **Auto Smart-Failover (Recommended)** | `auto` | ~0.4s | Prioritizes Kimi-K3; zero-downtime failover to Nemotron 120B on rate limits (Zero Errors) |
| **2** | **Moonshot AI Kimi-K3** | `kimi-k3` | ~1.5s | Deep reasoning, complex logic & code generation |
| **3** | **NVIDIA Nemotron 3 Super 120B** | `nemotron` | **~0.4s** | 120B enterprise model, ultra-fast 0.4s response, 100% quota |
| **4** | **Poolside Laguna XS 2.1** | `laguna` | ~1.2s | High-speed code specialist model |
| **5** | **OpenAI GPT-OSS 20B** | `gpt-oss` | ~1.8s | Fast utility & lightweight coding edits |

Ask the user: "Which model would you like to use? Reply with the number (1-5) or model name."
If an argument or model name was provided, use the `Bash` tool to run:
`python c:\Users\NEW\OneDrive\Desktop\claudecode\select_model.py <arg>`
