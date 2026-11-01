export interface StoredMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  model?: string;
  mode?: 'normal' | 'fun';
  reasoningTokens?: number;
}

/**
 * Send a message to /api/chat which:
 * 1. Persists user prompt to MongoDB
 * 2. Queries OpenRouter AI
 * 3. Persists AI reply to MongoDB
 * 4. Returns reply & token stats
 */
export async function sendChatMessageToBackend(payload: {
  sessionId: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  model?: string;
  mode?: 'normal' | 'fun';
}): Promise<{ reply: string; reasoningTokens?: number; model?: string }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server API error (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Fetch past messages for a session from MongoDB
 */
export async function fetchSessionMessages(sessionId: string): Promise<StoredMessage[]> {
  try {
    const res = await fetch(`/api/messages?sessionId=${encodeURIComponent(sessionId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch (err) {
    console.warn('Could not fetch stored messages from MongoDB:', err);
    return [];
  }
}

