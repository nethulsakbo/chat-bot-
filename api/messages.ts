import { connectToMongoDB } from './lib/mongodb';

export const config = {
  runtime: 'nodejs',
};

// GET /api/messages?sessionId=xyz - Load user's message history from MongoDB
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId') || 'default-session';

    const client = await connectToMongoDB();
    const db = client.db('chatbot');
    const collection = db.collection('messages');

    const messages = await collection
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .limit(100)
      .toArray();

    return Response.json({
      success: true,
      sessionId,
      messages: messages.map((m) => ({
        id: m._id.toString(),
        sender: m.role === 'assistant' ? 'bot' : 'user',
        text: m.content,
        timestamp: new Date(m.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        model: m.model,
        mode: m.mode,
        reasoningTokens: m.reasoningTokens,
      })),
    });
  } catch (error: any) {
    console.error('Failed to retrieve messages from MongoDB:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Store chat sessions or arbitrary user events
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, role, content, metadata } = body;

    if (!content) {
      return Response.json({ error: 'content is required' }, { status: 400 });
    }

    const client = await connectToMongoDB();
    const db = client.db('chatbot');
    const collection = db.collection('messages');

    const doc = {
      sessionId: sessionId || 'default-session',
      role: role || 'user',
      content,
      metadata: metadata || {},
      timestamp: new Date(),
    };

    const result = await collection.insertOne(doc);

    return Response.json({
      success: true,
      insertedId: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error('Failed to store message in MongoDB:', error);
    return Response.json(
      { error: error.message || 'Failed to save message' },
      { status: 500 }
    );
  }
}

