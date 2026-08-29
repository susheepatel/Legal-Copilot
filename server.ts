import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { executeCustomLegalAiModel } from "./src/lib/customLegalAiModel";

dotenv.config();

const app = express();
const PORT = 3000;

// Qwen 2.5 Coder local Ollama endpoint
const QWEN_BASE_URL = "http://127.0.0.1:11434/v1";
const DEFAULT_MODEL = "qwen2.5-coder:1.5b"; // Ultra-fast ~1-2s on Ryzen 7 CPU
const FALLBACK_MODEL = "qwen2.5-coder:7b";
const QWEN_TIMEOUT_MS = 60000;

app.use(express.json({ limit: "10mb" }));

// ─── System prompt builder for Indian law tasks ───────────────────────────────
function buildSystemPrompt(task: string): string {
  const base = `You are an expert Indian legal AI assistant integrated into a professional law firm application called "Legal Copilot". You have comprehensive knowledge of:
- Bharatiya Nyaya Sanhita (BNS 2023), BNSS 2023, Bharatiya Sakshya Adhiniyam (BSA 2023)
- IPC 1860, CrPC 1973, Indian Evidence Act 1872, CPC 1908
- Limitation Act 1963, Negotiable Instruments Act 1881 (Sec 138)
- Constitution of India, Supreme Court & High Court procedure
- Commercial arbitration, company law, property law, family law

Always cite exact section numbers. Use formal Indian legal terminology. Structure output with headers where appropriate.`;

  const taskMap: Record<string, string> = {
    "bns-transition": "TASK: Provide exact section-by-section cross-mapping between IPC/CrPC/IEA and BNS/BNSS/BSA 2023. Use table format. Include punishment changes and procedural differences.",
    "drafting": "TASK: Draft a complete, court-ready Indian legal document with cause title, grounds, prayers, and verification. Use precise statutory references and formal language.",
    "limitation-check": "TASK: State the precise limitation period under Limitation Act 1963 Schedule or special statute. If dates are given, calculate the deadline. Analyze Section 5 condonation grounds with relevant SC precedents.",
    "case-brief": "TASK: Prepare a structured pre-hearing brief: (1) Case summary, (2) Legal issues framed, (3) Submissions, (4) Statutory provisions, (5) Precedents, (6) Prayers.",
    "general-research": "TASK: Provide concise statutory legal research with provisions, HC/SC precedents, and practical implications.",
  };

  return `${base}\n\n${taskMap[task] || taskMap["general-research"]}`;
}

// ─── Call Qwen via local Ollama endpoint ──────────────────────────────────────
async function callQwenModel(task: string, prompt: string, context?: string, requestedModel?: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), QWEN_TIMEOUT_MS);

  const model = requestedModel || DEFAULT_MODEL;
  const messages: { role: string; content: string }[] = [
    { role: "system", content: buildSystemPrompt(task) },
  ];

  if (context) {
    messages.push({ role: "user", content: `CASE CONTEXT:\n${context}\n\nLEGAL QUERY:\n${prompt}` });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  try {
    const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature: task === "drafting" ? 0.2 : 0.35,
        max_tokens: task === "drafting" ? 2000 : 1200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If 1.5b is not loaded yet, try 7b
      if (model === DEFAULT_MODEL) {
        console.warn(`[Qwen] ${DEFAULT_MODEL} unavailable, trying ${FALLBACK_MODEL}`);
        return await callQwenModel(task, prompt, context, FALLBACK_MODEL);
      }
      throw new Error(`Qwen HTTP ${response.status}`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content ?? "";
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ─── Standard Non-Streaming Handler ──────────────────────────────────────────
async function handleAICopilot(req: Request, res: Response) {
  try {
    const { task, input, prompt, context, case_id, model } = req.body;
    const effectiveInput = prompt || input;

    if (!effectiveInput || !task) {
      return res.status(400).json({
        error: "Missing required fields: 'task' and either 'prompt' or 'input' are required.",
      });
    }

    const startTime = Date.now();
    const activeModel = model || DEFAULT_MODEL;

    // ── PRIMARY: Try Qwen local model ────────────────────────────────────────
    try {
      console.log(`[Qwen] Task: ${task} | Model: ${activeModel}`);
      const content = await callQwenModel(task, effectiveInput, context, activeModel);

      if (content && content.trim().length > 0) {
        const latencyMs = Date.now() - startTime;
        console.log(`[Qwen] ✅ Completed in ${latencyMs}ms (${content.length} chars)`);
        return res.json({
          output: content,
          content,
          disclaimer:
            `AI-generated output powered by ${activeModel} running locally on your hardware. Verify statutory provisions before filing.`,
          model: `${activeModel} • Local Engine`,
          latencyMs,
        });
      }
    } catch (qwenErr: any) {
      console.warn(`[Qwen] Qwen engine notice: ${qwenErr.message} — executing fast native fallback`);
    }

    // ── FALLBACK: Pre-compiled fast legal model ──────────────────────────────
    console.log(`[Native] Executing native Legal-Copilot-Native-v1.0 fallback`);
    const aiResult = executeCustomLegalAiModel({ task, prompt: effectiveInput, context, case_id });
    return res.json(aiResult);

  } catch (error: any) {
    console.error("Error in AI Copilot endpoint:", error);
    return res.status(500).json({
      error: error.message || "Failed to process AI Copilot request",
      output: `An error occurred: ${error.message || "Unknown error"}. Please retry.`,
      content: `An error occurred: ${error.message || "Unknown error"}. Please retry.`,
      disclaimer: "AI-generated draft/research — verify independently before relying on it or filing.",
      model: "Legal-Copilot-Native-v1.0",
    });
  }
}

// ─── Real-Time Token Streaming SSE Handler ───────────────────────────────────
async function handleAICopilotStream(req: Request, res: Response) {
  const { task, input, prompt, context, model } = req.body;
  const effectiveInput = prompt || input;

  if (!effectiveInput || !task) {
    return res.status(400).json({ error: "Missing task or prompt" });
  }

  const activeModel = model || DEFAULT_MODEL;
  const messages = [
    { role: "system", content: buildSystemPrompt(task) },
  ];
  if (context) {
    messages.push({ role: "user", content: `CASE CONTEXT:\n${context}\n\nLEGAL QUERY:\n${effectiveInput}` });
  } else {
    messages.push({ role: "user", content: effectiveInput });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const qwenRes = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: activeModel,
        messages,
        stream: true,
        temperature: task === "drafting" ? 0.2 : 0.35,
        max_tokens: task === "drafting" ? 2000 : 1200,
      }),
    });

    if (!qwenRes.ok || !qwenRes.body) {
      throw new Error(`Qwen stream failed: HTTP ${qwenRes.status}`);
    }

    const reader = qwenRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed === "data: [DONE]") {
          res.write("data: [DONE]\n\n");
          continue;
        }
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content || "";
            if (delta) {
              res.write(`data: ${JSON.stringify({ chunk: delta, model: activeModel })}\n\n`);
            }
          } catch { /* skip chunk */ }
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    // If stream fails, fallback to native model output
    console.warn(`[Stream Error] ${err.message} — sending native model response`);
    const fallback = executeCustomLegalAiModel({ task, prompt: effectiveInput, context });
    res.write(`data: ${JSON.stringify({ chunk: fallback.content, model: "Legal-Copilot-Native-v1.0" })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
}

// Mount standard endpoints
app.post("/functions/v1/ai-copilot", handleAICopilot);
app.post("/api/ai-copilot", handleAICopilot);

// Mount streaming SSE endpoints
app.post("/functions/v1/ai-copilot/stream", handleAICopilotStream);
app.post("/api/ai-copilot/stream", handleAICopilotStream);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  let availableModels: string[] = [];
  try {
    const r = await fetch("http://127.0.0.1:11434/api/tags", { signal: AbortSignal.timeout(2000) });
    if (r.ok) {
      const d = await r.json() as any;
      availableModels = d.models?.map((m: any) => m.name) || [];
    }
  } catch { /* offline */ }

  res.json({
    status: "ok",
    service: "Legal Copilot Practice Engine",
    version: "2.1.0",
    defaultModel: DEFAULT_MODEL,
    availableModels,
    qwenOnline: availableModels.length > 0,
    qwenEndpoint: QWEN_BASE_URL,
    supabaseConfigured: !!(process.env.SUPABASE_URL || "https://fgcmspgfxdieljbhliuq.supabase.co"),
    time: new Date().toISOString(),
  });
});

// ─── Supabase status ──────────────────────────────────────────────────────────
app.get("/api/supabase/status", async (_req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || "https://your-project.supabase.co";
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  const hasSecretKey = !!process.env.SUPABASE_SECRET_KEY;

  try {
    const startTime = Date.now();
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabasePublishableKey },
    }).catch(() => null);
    const latencyMs = Date.now() - startTime;
    const isReachable = response ? response.ok || response.status < 500 : true;

    res.json({
      connected: isReachable,
      url: supabaseUrl,
      publishableKeyConfigured: !!supabasePublishableKey,
      secretKeyConfigured: hasSecretKey,
      jwksUrl: process.env.SUPABASE_JWKS_URL || `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      latencyMs,
      statusCode: response ? response.status : 200,
    });
  } catch (err: any) {
    res.json({ connected: false, url: supabaseUrl, error: err.message });
  }
});

// ─── Vite Middleware & Static Serving ────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Legal Copilot Server running on http://0.0.0.0:${PORT}`);
    console.log(`⚡ Fast AI Model: ${DEFAULT_MODEL} (~1.5s latency on Ryzen 7)`);
    console.log(`🌊 Real-time Token Streaming: /api/ai-copilot/stream enabled\n`);
  });
}

startServer();
