/**
 * Qwen 2.5 Coder — High-Speed Local Inference Client
 * Connects to the local Ollama OpenAI-compatible endpoint at http://127.0.0.1:11434/v1
 * Supports ultra-fast 1.5B model, streaming SSE token generation, and deep 7B models.
 */

export const QWEN_BASE_URL = 'http://127.0.0.1:11434/v1';
export const DEFAULT_QWEN_MODEL = 'qwen2.5-coder:1.5b'; // Ultra-fast ~1.5s on Ryzen 7 CPU
export const DEEP_QWEN_MODEL = 'qwen2.5-coder:7b';
const QWEN_TIMEOUT_MS = 60000;

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ─── System Prompt — Indian Legal AI ────────────────────────────────────────

export function buildLegalSystemPrompt(task: string): string {
  const base = `You are an expert Indian legal AI assistant integrated into a professional law firm application called "Legal Copilot". You have comprehensive knowledge of:
- Bharatiya Nyaya Sanhita (BNS 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), Bharatiya Sakshya Adhiniyam (BSA 2023)
- Indian Penal Code (IPC 1860), Code of Criminal Procedure (CrPC 1973), Indian Evidence Act (1872), Civil Procedure Code (CPC 1908)
- Limitation Act (1963), Negotiable Instruments Act (1881) — Section 138 dishonour of cheque proceedings
- Supreme Court and High Court practice, landmark precedents, and constitutional provisions

Always cite section numbers accurately, use proper Indian legal terminology, and format output in clear markdown headers suitable for advocates.`;

  const taskInstructions: Record<string, string> = {
    'bns-transition': `TASK: BNS 2023 Transition Mapping. Provide exact section-by-section cross-mapping between old IPC/CrPC/IEA sections and new BNS/BNSS/BSA 2023 provisions in a clear table format. Include punishment changes and procedural differences.`,
    'drafting': `TASK: Legal Document Drafting. Draft a complete, court-ready legal document with all formal elements — cause title, court details, grounds, prayers, and verification. Follow the formal structure required by Indian courts.`,
    'limitation-check': `TASK: Limitation Analysis. State the exact limitation period under the Limitation Act 1963 Schedule or special statute. Calculate statutory deadlines and analyze Section 5 condonation grounds with Supreme Court precedents.`,
    'case-brief': `TASK: Pre-Hearing Brief Preparation. Prepare a structured pre-hearing synopsis: (1) Case summary, (2) Legal issues framed, (3) Submissions, (4) Statutory provisions, (5) Precedents, (6) Specific prayers.`,
    'general-research': `TASK: Statutory Legal Research. Provide concise, high-accuracy legal research with statutory provisions, relevant High Court / Supreme Court precedents, and practical advice.`,
  };

  return `${base}\n\n${taskInstructions[task] || taskInstructions['general-research']}`;
}

// ─── Direct Non-Streaming Call ───────────────────────────────────────────────

export async function callQwen(
  messages: QwenMessage[],
  options: { model?: string; temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  const model = options.model || DEFAULT_QWEN_MODEL;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), QWEN_TIMEOUT_MS);

  try {
    const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 1500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Qwen API error: HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Qwen request timed out. Please retry.');
    }
    throw err;
  }
}

// ─── Real-Time Token Streaming (SSE) ─────────────────────────────────────────

export async function streamQwen(
  messages: QwenMessage[],
  onChunk: (chunk: string, fullText: string) => void,
  options: { model?: string; temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  const model = options.model || DEFAULT_QWEN_MODEL;
  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 1500,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming failed: HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulated = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content || '';
          if (delta) {
            accumulated += delta;
            onChunk(delta, accumulated);
          }
        } catch {
          // ignore malformed JSON chunk
        }
      }
    }
  }

  return accumulated;
}

// ─── High-Level Invoker ──────────────────────────────────────────────────────

export async function invokeQwenLegalCopilot(payload: {
  task: string;
  prompt?: string;
  input?: string;
  context?: string;
  case_id?: string;
  model?: string;
  onStreamChunk?: (chunk: string, fullText: string) => void;
}): Promise<{
  output: string;
  content: string;
  disclaimer: string;
  model: string;
  latencyMs?: number;
}> {
  const effectivePrompt = payload.prompt || payload.input || '';
  if (!effectivePrompt.trim()) {
    throw new Error('No prompt provided');
  }

  const systemPrompt = buildLegalSystemPrompt(payload.task);
  const messages: QwenMessage[] = [{ role: 'system', content: systemPrompt }];

  if (payload.context) {
    messages.push({
      role: 'user',
      content: `CASE DOCKET CONTEXT:\n${payload.context}\n\nLEGAL QUERY:\n${effectivePrompt}`,
    });
  } else {
    messages.push({ role: 'user', content: effectivePrompt });
  }

  const targetModel = payload.model || DEFAULT_QWEN_MODEL;
  const startTime = Date.now();

  let content = '';
  if (payload.onStreamChunk) {
    content = await streamQwen(messages, payload.onStreamChunk, {
      model: targetModel,
      temperature: payload.task === 'drafting' ? 0.2 : 0.35,
      max_tokens: payload.task === 'drafting' ? 2000 : 1200,
    });
  } else {
    content = await callQwen(messages, {
      model: targetModel,
      temperature: payload.task === 'drafting' ? 0.2 : 0.35,
      max_tokens: payload.task === 'drafting' ? 2000 : 1200,
    });
  }

  const latencyMs = Date.now() - startTime;

  return {
    output: content,
    content,
    disclaimer: `AI-generated output powered by ${targetModel} running locally on your CPU/GPU. Always verify statutory citations with primary sources before filing.`,
    model: `${targetModel} • Local Engine`,
    latencyMs,
  };
}
