import { MongoClient } from 'mongodb';

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://nethulguy_db_user:d3giSYzjvwzoRUeI@chatbocluster.gij4pcg.mongodb.net/?retryWrites=true&w=majority';

// Global cached client across hot-reloads and serverless function invocations
let cachedClient: MongoClient | null = null;

export async function connectToMongoDB(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('You successfully connected to MongoDB!');
    cachedClient = client;
    return client;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    console.log('Disconnected from MongoDB.');
  }
}

