// test-openrouter.ts
// Simple script to demo streaming response from OpenRouter SDK
// It reads the API key from the .env file (VITE_OPENROUTER_API_KEY)

import "dotenv/config";
import { OpenRouter } from "@openrouter/sdk";

const apiKey = process.env.VITE_OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Error: VITE_OPENROUTER_API_KEY not set in .env");
  process.exit(1);
}

const openrouter = new OpenRouter({ apiKey });

async function main() {
  const stream = await openrouter.chat.send({
    chatRequest: {
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: [
        { role: "user", content: "How many r's are in the word 'strawberry'?" }
      ],
      stream: true
    }
  });

  let response = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      response += content;
      process.stdout.write(content);
    }
    if (chunk.usage) {
      console.log("\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
      console.log("Total tokens:", chunk.usage.totalTokens);
    }
  }
  console.log("\n\nFull response:", response.trim());
}

main().catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});

