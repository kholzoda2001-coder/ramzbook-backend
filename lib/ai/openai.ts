/**
 * Minimal OpenAI-compatible Chat Completions wrapper.
 * No SDK dependency — uses fetch with a hard timeout so a hung request can
 * never block the API route. Works with any provider that exposes the
 * OpenAI Chat Completions format via `baseUrl`, e.g.:
 *   - OpenAI:     https://api.openai.com/v1
 *   - Gemini:     https://generativelanguage.googleapis.com/v1beta/openai
 *   - Groq:       https://api.groq.com/openai/v1
 *   - OpenRouter: https://openrouter.ai/api/v1
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAiChatResult {
  ok: boolean;
  reply?: string;
  error?: string;
  status?: number;
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

/**
 * Send a chat completion request. Returns { ok, reply } on success or
 * { ok:false, error, status } on any failure (never throws).
 */
export async function openAiChat(params: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}): Promise<OpenAiChatResult> {
  const { apiKey, model, messages } = params;
  if (!apiKey) return { ok: false, error: 'No API key configured' };

  // Normalise the base URL and build the chat-completions endpoint. Accepts a
  // base with or without a trailing slash or a trailing /chat/completions.
  const base = (params.baseUrl?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const endpoint = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: params.maxTokens ?? 400,
        temperature: params.temperature ?? 0.7,
      }),
      signal: AbortSignal.timeout(params.timeoutMs ?? 20000),
    });

    if (!res.ok) {
      let detail = '';
      try {
        const errJson = (await res.json()) as { error?: { message?: string } };
        detail = errJson?.error?.message ?? '';
      } catch {
        /* ignore parse error */
      }
      return { ok: false, status: res.status, error: detail || `OpenAI error ${res.status}` };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return { ok: false, error: 'Empty response from OpenAI' };

    return { ok: true, reply };
  } catch (e: any) {
    return { ok: false, error: e?.name === 'TimeoutError' ? 'Request timed out' : (e?.message ?? 'Network error') };
  }
}
