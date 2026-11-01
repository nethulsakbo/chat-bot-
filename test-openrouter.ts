import { OpenRouter } from "@openrouter/sdk";
import * as fs from 'fs';
import * as path from 'path';

// Read API key from .env if present
let apiKey = process.env.VITE_OPENROUTER_API_KEY;

if (!apiKey) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/VITE_OPENROUTER_API_KEY\s*=\s*(.+)/);
      if (match) apiKey = match[1].trim();
    }
  } catch {
    // Fallback
  }
}

if (!apiKey) {
  apiKey = "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";
}

const openrouter = new OpenRouter({
  apiKey
});

async function main() {
  console.log("Connecting to z-ai/glm-5.3-flash...\n");

  // Stream the response to get reasoning tokens in usage
  const stream = await openrouter.chat.send({
    chatRequest: {
      model: "z-ai/glm-5.3-flash",
      messages: [
        {
          role: "user",
          content: "How many r's are in the word 'strawberry'?"
        }
      ],
      stream: true
    }
  });

  let response = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of stream as any) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      response += content;
      process.stdout.write(content);
    }

    // Usage information comes in the final chunk
    if (chunk.usage) {
      console.log("\n\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
      console.log("Total tokens:", chunk.usage.totalTokens);
    }
  }
}

main().catch(console.error);
