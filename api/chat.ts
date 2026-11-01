import { connectToMongoDB } from './lib/mongodb';

export const config = {
  runtime: 'nodejs',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model, mode, sessionId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await connectToMongoDB();
    const db = client.db('chatbot');
    const collection = db.collection('messages');

    const latestUserMsg = messages[messages.length - 1];

    // Store incoming user message in MongoDB
    await collection.insertOne({
      sessionId: sessionId || 'default-session',
      role: 'user',
      content: latestUserMsg.content || latestUserMsg.text,
      timestamp: new Date(),
    });

    // Call OpenRouter AI
    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: 'OpenRouter API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const systemPrompt =
      mode === 'fun'
        ? 'You are Nethul, a highly intelligent, witty AI with sharp humor, candid insights, and zero corporate fluff. Answer directly and informatively.'
        : 'You are Nethul, an advanced, highly capable AI. Answer with deep clarity, objective logic, and clean markdown structure.';

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
        content: m.content || m.text,
      })),
    ];

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'nvidia/nemotron-3-ultra-550b-a55b:free',
        messages: formattedMessages,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return Response.json(
        { error: `OpenRouter error (${aiRes.status}): ${errText}` },
        { status: aiRes.status }
      );
    }

    const aiData = await aiRes.json();
    const assistantContent =
      aiData.choices?.[0]?.message?.content || 'No response generated.';
    const reasoningTokens =
      aiData.usage?.completionTokensDetails?.reasoningTokens ?? null;

    // Store assistant response in MongoDB
    await collection.insertOne({
      sessionId: sessionId || 'default-session',
      role: 'assistant',
      content: assistantContent,
      model: model || 'nvidia/nemotron-3-ultra-550b-a55b:free',
      reasoningTokens,
      timestamp: new Date(),
    });

    return Response.json({
      reply: assistantContent,
      reasoningTokens,
      model: model || 'nvidia/nemotron-3-ultra-550b-a55b:free',
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

