import { OpenRouter } from '@openrouter/sdk';
import { NethulMode } from '../types';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onThinking?: (thought: string) => void;
  onComplete: (fullContent: string, thinkingContent?: string, reasoningTokens?: number) => void;
  onError: (error: Error) => void;
}

// Curated OpenRouter models with good responsiveness
export const AVAILABLE_MODELS = [
  {
    id: 'z-ai/glm-5.3-flash',
    name: 'GLM 5.3 Flash (Z-AI)',
    description: 'Ultra-fast flash reasoning & high accuracy (Recommended)',
    badge: 'Recommended',
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'Nemotron 3 Ultra 550B (Free)',
    description: 'High-power reasoning & verified logic',
    badge: 'Fast & Free',
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'Nemotron 3.5 Lightning (Free)',
    description: 'Ultra-fast Nvidia reasoning model',
    badge: 'Free',
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Gemma 4 31B (Free)',
    description: 'Google free tier open instruction model',
    badge: 'Free',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (Free)',
    description: 'Meta flagship open intelligence',
    badge: 'Free',
  },
  {
    id: 'x-ai/grok-2-1212',
    name: 'Grok 2 (xAI)',
    description: 'xAI flagship Grok intelligence',
    badge: 'Grok',
  },
];

export const getStoredApiKey = (): string => {
  return (
    localStorage.getItem('nethul_openrouter_api_key') ||
    import.meta.env.VITE_OPENROUTER_API_KEY ||
    ''
  );
};

export const setStoredApiKey = (key: string): void => {
  localStorage.setItem('nethul_openrouter_api_key', key.trim());
};

export const getStoredModel = (): string => {
  return (
    localStorage.getItem('nethul_selected_model') ||
    import.meta.env.VITE_DEFAULT_MODEL ||
    'z-ai/glm-5.3-flash'
  );
};

export const setStoredModel = (modelId: string): void => {
  localStorage.setItem('nethul_selected_model', modelId.trim());
};

/**
 * Stream responses using the official @openrouter/sdk
 */
export const streamOpenRouter = async (
  messages: OpenRouterMessage[],
  mode: NethulMode = 'normal',
  customModel?: string,
  callbacks?: StreamCallbacks
): Promise<{ text: string; thinking?: string; reasoningTokens?: number }> => {
  const apiKey = getStoredApiKey();
  const model = customModel || getStoredModel();

  if (!apiKey) {
    throw new Error('No OpenRouter API key provided.');
  }

  const systemPrompt =
    mode === 'fun'
      ? 'You are Nethul, a highly intelligent, witty, rebellious AI with sharp humor, candid insights, and zero corporate fluff. Answer directly, cleverly, and informatively. Format code blocks cleanly with syntax highlighting tags.'
      : 'You are Nethul, an advanced, highly capable AI modeled after first principles. Answer with deep clarity, objective logic, and clean markdown structure. Format code blocks with language identifiers.';

  const formattedMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    })),
  ];

  try {
    const openrouter = new OpenRouter({
      apiKey,
    });

    const stream = await openrouter.chat.send({
      chatRequest: {
        model,
        messages: formattedMessages,
        stream: true,
      },
    });

    let response = '';
    let accumulatedThinking = '';
    let reasoningTokens: number | undefined;

    // Stream chunks as they arrive
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const chunk of stream as any) {
      const delta = chunk.choices?.[0]?.delta;

      // Extract reasoning/thinking tokens if provided in delta
      if (delta?.reasoning) {
        accumulatedThinking += delta.reasoning;
        callbacks?.onThinking?.(accumulatedThinking);
      }

      const content = delta?.content;
      if (content) {
        response += content;
        callbacks?.onChunk(response);
      }

      // Usage information comes in the final chunk
      if (chunk.usage) {
        const rTokens = chunk.usage.completionTokensDetails?.reasoningTokens;
        if (typeof rTokens === 'number') {
          reasoningTokens = rTokens;
          callbacks?.onThinking?.(`Used ${rTokens} reasoning tokens`);
        }
      }
    }

    callbacks?.onComplete(response, accumulatedThinking, reasoningTokens);
    return { text: response, thinking: accumulatedThinking, reasoningTokens };
  } catch (sdkError: unknown) {
    // If SDK fails in browser due to CORS or direct network, attempt fetch fallback
    console.warn('Falling back to direct SSE stream...', sdkError);
    return fallbackDirectFetchStream(apiKey, model, formattedMessages, callbacks);
  }
};

/**
 * Direct browser fetch fallback supporting SSE streaming and reasoning tokens
 */
async function fallbackDirectFetchStream(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  callbacks?: StreamCallbacks
): Promise<{ text: string; thinking?: string; reasoningTokens?: number }> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin || 'http://localhost:5173',
      'X-Title': 'Nethul AI Chatbot',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson?.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(`OpenRouter Error (${response.status}): ${errorDetail}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to read streaming response.');
  }

  const decoder = new TextDecoder('utf-8');
  let accumulatedContent = '';
  let accumulatedThinking = '';
  let reasoningTokens: number | undefined;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') break;

      if (trimmed.startsWith('data: ')) {
        try {
          const data = JSON.parse(trimmed.slice(6));
          const delta = data.choices?.[0]?.delta;

          if (delta?.reasoning) {
            accumulatedThinking += delta.reasoning;
            callbacks?.onThinking?.(accumulatedThinking);
          }

          if (delta?.content) {
            accumulatedContent += delta.content;
            callbacks?.onChunk(accumulatedContent);
          }

          if (data.usage?.completionTokensDetails?.reasoningTokens) {
            reasoningTokens = data.usage.completionTokensDetails.reasoningTokens;
            callbacks?.onThinking?.(`Used ${reasoningTokens} reasoning tokens`);
          }
        } catch {
          // Ignore parse errors on partial chunks
        }
      }
    }
  }

  callbacks?.onComplete(accumulatedContent, accumulatedThinking, reasoningTokens);
  return { text: accumulatedContent, thinking: accumulatedThinking, reasoningTokens };
}
