// test-mongo.ts
import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function main() {
  console.log('Testing connection to MongoDB Atlas...');
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri, {
    tls: true,
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  const db = client.db('chatbot');
  const collections = await db.listCollections().toArray();
  console.log('Successfully connected!');
  console.log('Collections in "chatbot" database:', collections.map((c) => c.name));
  await client.close();
}

main().catch((err) => {
  console.error('MongoDB test failed:', err);
  process.exit(1);
});

