import { connectToMongoDB } from './lib/mongodb';

export const config = {
  runtime: 'nodejs',
};

// GET /api/sessions - List all saved sessions from MongoDB
export async function GET() {
  try {
    const client = await connectToMongoDB();
    const db = client.db('chatbot');
    const collection = db.collection('messages');

    // Aggregate sessions by sessionId with message counts & latest message
    const sessions = await collection
      .aggregate([
        {
          $sort: { timestamp: -1 },
        },
        {
          $group: {
            _id: '$sessionId',
            lastMessage: { $first: '$content' },
            lastTimestamp: { $first: '$timestamp' },
            totalMessages: { $sum: 1 },
          },
        },
        {
          $sort: { lastTimestamp: -1 },
        },
        {
          $limit: 30,
        },
      ])
      .toArray();

    return Response.json({
      success: true,
      sessions: sessions.map((s) => ({
        id: s._id,
        title: s.lastMessage
          ? s.lastMessage.slice(0, 32) + (s.lastMessage.length > 32 ? '...' : '')
          : 'Conversation',
        timestamp: new Date(s.lastTimestamp).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        }),
        totalMessages: s.totalMessages,
      })),
    });
  } catch (error: any) {
    console.error('Failed to get sessions:', error);
    return Response.json(
      { error: error.message || 'Failed to list sessions' },
      { status: 500 }
    );
  }
}

