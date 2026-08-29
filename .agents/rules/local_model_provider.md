---
description: Rule to route code generation and low-latency tasks to the local CUDA-accelerated Qwen 2.5 Coder model endpoint
globs: "**/*"
---

# Local NVIDIA CUDA AI Model Routing Rule

- **Primary Local Provider:** `local_cuda_engine`
- **Base Endpoint:** `http://localhost:11434/v1`
- **Model ID:** `qwen2.5-coder:7b`
- **Optimization Directives:**
  1. Prefer streaming (`stream=true`) to minimize Time-To-First-Token (TTFT).
  2. Keep system prompts concise and structured for fast response synthesis.
  3. Cap context window to 8,192 tokens for rapid VRAM throughput.
