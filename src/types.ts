export type MessageSender = 'user' | 'bot';

export interface CodeBlock {
  language: string;
  code: string;
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  thinkingTime?: string;
  thinkingSteps?: string[];
  model?: string;
  mode?: 'normal' | 'fun';
  liked?: boolean | null;
  isStreaming?: boolean;
}

export type NethulMode = 'normal' | 'fun';
export type NethulModel = 'Nethul 3' | 'Nethul 2' | 'Nethul Mini';

// Backward compatibility aliases if needed
export type GrokMode = NethulMode;
export type GrokModel = NethulModel;

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}
