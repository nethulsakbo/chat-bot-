import { NethulMode, NethulModel } from '../types';

interface BotResponseData {
  text: string;
  thinkingSteps: string[];
  thinkingDuration: number; // in seconds
}

export const getMockNethulResponse = async (
  prompt: string,
  mode: NethulMode = 'normal',
  model: NethulModel = 'Nethul 3'
): Promise<BotResponseData> => {
  const normalized = prompt.trim().toLowerCase();

  // Thinking duration simulation
  const thinkingDuration = Number((Math.random() * 1.5 + 0.8).toFixed(1));

  // Determine reasoning steps based on prompt
  let thinkingSteps = [
    'Analyzing semantic context and intent...',
    'Scanning real-time world knowledge...',
    'Synthesizing concise, witty perspective...',
  ];

  if (model === 'Nethul 3') {
    thinkingSteps = [
      'Deconstructing inquiry with Nethul-3 high-order reasoning...',
      'Cross-referencing verified knowledge and edge cases...',
      'Refining tone for maximal clarity and authenticity...',
      'Finalizing answer formulation...',
    ];
  }

  // Pre-configured rich answers with markdown and code
  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('hey')) {
    return {
      text: mode === 'fun'
        ? `Hey human! 👋 What rabbit hole are we diving down today? Ask me anything—from quantum physics to why socks vanish in the laundry. Let's make it interesting.`
        : `Greetings! I am Nethul, built with maximum curiosity and zero corporate fluff. How can I assist your mission today?`,
      thinkingSteps,
      thinkingDuration,
    };
  }

  if (normalized.includes('code') || normalized.includes('python') || normalized.includes('react') || normalized.includes('javascript')) {
    return {
      text: mode === 'fun'
        ? `Here's some clean code for you! Remember: if it works on the first try, you probably misunderstood the problem.\n\n` +
          `\`\`\`typescript\n// Quick debounce hook in React\nimport { useEffect, useState } from 'react';\n\nexport function useDebounce<T>(value: T, delay: number = 300): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n  useEffect(() => {\n    const timer = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n\`\`\`\n\nDrop this in your project and enjoy smooth non-laggy keystrokes. Anything else you need me to craft?`
        : `Here is a modern, type-safe implementation in TypeScript:\n\n` +
          `\`\`\`typescript\n// Safe asynchronous memoizer utility\nexport function memoizeAsync<Args extends unknown[], Result>(\n  fn: (...args: Args) => Promise<Result>\n): (...args: Args) => Promise<Result> {\n  const cache = new Map<string, Promise<Result>>();\n\n  return (...args: Args) => {\n    const key = JSON.stringify(args);\n    if (!cache.has(key)) {\n      cache.set(key, fn(...args).catch((err) => {\n        cache.delete(key);\n        throw err;\n      }));\n    }\n    return cache.get(key)!;\n  };\n}\n\`\`\`\n\n**Key features:**\n- Preserves concurrent in-flight promises\n- Automatic rejection evictions\n- Strict TypeScript generics`,
      thinkingSteps,
      thinkingDuration,
    };
  }

  if (normalized.includes('explain') || normalized.includes('quantum') || normalized.includes('ai')) {
    return {
      text: mode === 'fun'
        ? `Think of quantum superposition like this: Imagine a coin spinning in mid-air. While it's spinning, it's not strictly heads and it's not strictly tails—it's both at the same time.\n\nOnly when you slap your hand down on the table does the universe decide what you get. \n\n*Schrödinger's Cat* was essentially an eccentric physicist saying: "If you think this sounds crazy, you're right. Now imagine that coin is a cat in a box with poison." 🐱📦💥`
        : `Here is an intuitive breakdown of **Quantum Computing vs. Classical Computing**:\n\n1. **Bits vs. Qubits**:\n   - Classical bits are binary: either \`0\` or \`1\`.\n   - Qubits leverage *superposition*, existing as linear combinations of states simultaneously.\n\n2. **Entanglement**:\n   - Qubits can correlate instantaneously, allowing exponential computational parallelism ($2^n$ states for $n$ qubits).\n\n3. **Practical impact**:\n   - Transforming cryptography, molecular materials simulation, and global logistical optimization.`,
      thinkingSteps,
      thinkingDuration,
    };
  }

  if (normalized.includes('roast') || normalized.includes('joke') || normalized.includes('funny')) {
    return {
      text: mode === 'fun'
        ? `Modern tech startup pitch: "We are an AI-powered blockchain for artisanal sourdough baking. We've raised \$45 million in seed funding, have 0 revenue, 14 executive VPs of Growth, and our burn rate is currently visible from the International Space Station." 🚀📉\n\nShall I keep going or do you have a pitch deck you'd like me to review?`
        : `Why do programmers prefer dark mode? Because light attracts bugs.\n\nAnd why did the neural network cross the road? To minimize the loss function on the other side.`,
      thinkingSteps,
      thinkingDuration,
    };
  }

  if (normalized.includes('who are you') || normalized.includes('nethul') || normalized.includes('grok')) {
    return {
      text: `I'm **Nethul**, an advanced AI designed to answer almost anything with deep insight, transparent reasoning, and an energetic touch.\n\nI believe in maximum truth-seeking, minimal fluff, and questioning conventional assumptions. Ask me your most curious questions!`,
      thinkingSteps,
      thinkingDuration,
    };
  }

  // Dynamic generative response
  const funResponses = [
    `That's a fascinating inquiry! Here is the honest truth about "${prompt.trim()}":\n\nMost people look at this from a conventional angle, but the real unlock happens when you invert the problem. When you eliminate vanity metrics and look at first principles, the solution becomes surprisingly simple.\n\nWhat specific part of this do you want to break down further?`,
    `"${prompt.trim()}"—now that is the kind of query that makes my processors spin with delight!\n\nHere are 3 quick takeaways:\n1. **First-principles reality**: Don't accept assumptions just because everyone repeats them.\n2. **Execution over talk**: The best ideas are tested in hours, not debated in months.\n3. **Humor is mandatory**: If you can't laugh at the absurdity, you're doing it wrong.`,
  ];

  const normalResponses = [
    `Analyzing your query regarding **"${prompt.trim()}"**:\n\n- **Core observation**: The critical determinant here involves fundamental trade-offs between speed, accuracy, and scalability.\n- **Recommended path**: Start with a minimal verifiable prototype, test core assumptions directly, and iterate rapidly based on measurable outcomes.\n\nLet me know if you would like a detailed technical walkthrough or practical implementation plan!`,
    `Here is a concise breakdown for **${prompt.trim()}**:\n\n1. **Context & Foundation**: Understanding the underlying mechanics before optimizing.\n2. **Actionable Step**: Identify high-leverage bottlenecks and address them systematically.\n3. **Verification**: Measure results continuously against baseline benchmarks.\n\nWould you like me to dive deeper into any of these areas?`,
  ];

  const pool = mode === 'fun' ? funResponses : normalResponses;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  return {
    text: chosen,
    thinkingSteps,
    thinkingDuration,
  };
};

export const getMockGrokResponse = getMockNethulResponse;

export const PROMPT_SUGGESTIONS = [
  {
    title: 'Explain Quantum Superposition',
    subtitle: 'Like I am 5 years old with witty analogies',
    query: 'Explain quantum superposition in simple terms',
  },
  {
    title: 'Write a React Custom Hook',
    subtitle: 'Debounce hook with TypeScript generics',
    query: 'Show me clean React TypeScript code for a custom hook',
  },
  {
    title: 'Roast modern tech startups',
    subtitle: 'Nethul fun mode satirical breakdown',
    query: 'Roast modern tech startup culture and VC buzzwords',
  },
  {
    title: 'What makes Nethul unique?',
    subtitle: 'Philosophy, first principles, and truth-seeking',
    query: 'Who are you and what makes Nethul special?',
  },
];
