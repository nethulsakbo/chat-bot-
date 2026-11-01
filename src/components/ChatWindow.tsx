import React, { useState } from 'react';
import { Header } from './Header';
import { MessageList } from './MessageList';
import { EmptyState } from './EmptyState';
import { InputBar } from './InputBar';
import { Sidebar } from './Sidebar';
import { SettingsModal } from './SettingsModal';
import { Message, NethulMode, NethulModel, ChatSession } from '../types';
import { getMockNethulResponse } from '../services/mockNethul';
import {
  streamOpenRouter,
  getStoredApiKey,
  getStoredModel,
  OpenRouterMessage,
} from '../services/openRouter';
import { sendChatMessageToBackend } from '../services/chatBackend';

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'session-welcome',
    title: 'Welcome to Nethul',
    timestamp: 'Just now',
    messages: [
      {
        id: 'msg-welcome-1',
        sender: 'bot',
        text: 'Welcome to **Nethul**! I am an AI designed with maximum curiosity, candid insight, and a healthy dose of humor.\n\nAsk me anything: write code, brainstorm ideas, analyze concepts, or switch to **Fun Mode** if you like a little spice in your answers.',
        timestamp: '12:00 PM',
        model: 'Nethul 3',
        mode: 'normal',
      },
    ],
  },
];

export const ChatWindow: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-welcome');
  const [activeModel, setActiveModel] = useState<NethulModel>('Nethul 3');
  const [activeMode, setActiveMode] = useState<NethulMode>('normal');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState<boolean>(!!getStoredApiKey());

  // Active session helper
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession ? currentSession.messages : [];

  // Toggle dark mode by updating HTML element class
  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const updateCurrentMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === activeSessionId) {
          const updated =
            typeof newMessages === 'function' ? newMessages(session.messages) : newMessages;
          // Update title if session title was default
          let title = session.title;
          if (title === 'New conversation' && updated.length > 0) {
            const firstUserMsg = updated.find((m) => m.sender === 'user');
            if (firstUserMsg) {
              title = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
            }
          }
          return { ...session, messages: updated, title };
        }
        return session;
      })
    );
  };

  const handleSendMessage = async (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    // Add user message immediately
    updateCurrentMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    const apiKey = getStoredApiKey();

    if (apiKey) {
      // Try live OpenRouter stream
      const botMessageId = `bot-${Date.now()}`;
      const startTime = Date.now();

      // Prior conversation context
      const chatContext: OpenRouterMessage[] = [
        ...messages.map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        })),
        { role: 'user' as const, content: text },
      ];

      // Insert placeholder bot message
      const botPlaceholder: Message = {
        id: botMessageId,
        sender: 'bot',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: `${activeModel} (Live)`,
        mode: activeMode,
        isStreaming: true,
      };

      updateCurrentMessages((prev) => [...prev, botPlaceholder]);

      try {
        await streamOpenRouter(chatContext, activeMode, getStoredModel(), {
          onThinking: (thought) => {
            updateCurrentMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? {
                      ...msg,
                      thinkingSteps: [thought.slice(0, 120) + (thought.length > 120 ? '...' : '')],
                    }
                  : msg
              )
            );
          },
          onChunk: (chunk) => {
            setIsThinking(false);
            updateCurrentMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, text: chunk }
                  : msg
              )
            );
          },
          onComplete: (fullContent, _thinking, reasoningTokens) => {
            setIsThinking(false);
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            const thinkingLabel = reasoningTokens
              ? `Thought for ${duration}s (${reasoningTokens} tokens)`
              : `Thought for ${duration}s`;
            updateCurrentMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? {
                      ...msg,
                      text: fullContent,
                      isStreaming: false,
                      thinkingTime: thinkingLabel,
                    }
                  : msg
              )
            );

            // Persist the completed exchange into MongoDB in the background
            fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: activeSessionId,
                role: 'assistant',
                content: fullContent,
                metadata: { reasoningTokens, model: activeModel, mode: activeMode },
              }),
            }).catch(() => {});
          },
          onError: async () => {
            // Handled in catch block
          },
        });
        return;
      } catch (streamError) {
        console.warn('OpenRouter client stream failed, attempting backend MongoDB API route:', streamError);
      }
    }

    // Try backend API route (/api/chat) which automatically stores to MongoDB
    try {
      const botMessageId = `bot-${Date.now()}`;
      const botPlaceholder: Message = {
        id: botMessageId,
        sender: 'bot',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: `${activeModel}`,
        mode: activeMode,
        isStreaming: true,
      };
      updateCurrentMessages((prev) => [...prev, botPlaceholder]);

      const backendData = await sendChatMessageToBackend({
        sessionId: activeSessionId,
        messages: [
          ...messages.map((m) => ({
            role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.text,
          })),
          { role: 'user', content: text },
        ],
        model: getStoredModel(),
        mode: activeMode,
      });

      setIsThinking(false);
      updateCurrentMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: backendData.reply,
                isStreaming: false,
                thinkingTime: backendData.reasoningTokens
                  ? `Thought (${backendData.reasoningTokens} tokens)`
                  : undefined,
              }
            : msg
        )
      );
      return;
    } catch (backendError) {
      console.warn('Backend /api/chat unavailable, using local fallback:', backendError);
    }

    // Local Simulated Nethul Response (Fallback or default)
    try {
      const mockResult = await getMockNethulResponse(text, activeMode, activeModel);
      await new Promise((resolve) => setTimeout(resolve, mockResult.thinkingDuration * 1000));

      setIsThinking(false);

      const botMessageId = `bot-${Date.now()}`;
      const botMessage: Message = {
        id: botMessageId,
        sender: 'bot',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinkingTime: `Thought for ${mockResult.thinkingDuration}s`,
        thinkingSteps: mockResult.thinkingSteps,
        model: activeModel,
        mode: activeMode,
        isStreaming: true,
      };

      updateCurrentMessages((prev) => {
        // Remove empty placeholder if any
        const filtered = prev.filter((m) => m.sender !== 'bot' || m.text.length > 0);
        return [...filtered, botMessage];
      });

      // Stream character by character
      const fullText = mockResult.text;
      let currentIndex = 0;
      const chunkSize = Math.max(2, Math.floor(fullText.length / 45));

      const streamInterval = setInterval(() => {
        currentIndex += chunkSize;
        if (currentIndex >= fullText.length) {
          currentIndex = fullText.length;
          clearInterval(streamInterval);
          updateCurrentMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: fullText, isStreaming: false }
                : msg
            )
          );
        } else {
          const partial = fullText.slice(0, currentIndex);
          updateCurrentMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: partial } : msg
            )
          );
        }
      }, 20);
    } catch {
      setIsThinking(false);
    }
  };

  const handleRegenerate = async (botMessageId: string) => {
    if (isThinking) return;

    // Find the message and the preceding user prompt
    const msgIndex = messages.findIndex((m) => m.id === botMessageId);
    if (msgIndex === -1) return;

    // Look backward for the prompt
    let userPrompt = 'Tell me more';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        userPrompt = messages[i].text;
        break;
      }
    }

    // Remove the previous bot message and re-run
    const filtered = messages.filter((m) => m.id !== botMessageId);
    updateCurrentMessages(filtered);

    // Re-trigger bot response
    setIsThinking(true);
    const mockResult = await getMockNethulResponse(userPrompt, activeMode, activeModel);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsThinking(false);

    const newBotMessage: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: mockResult.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thinkingTime: `Thought for ${mockResult.thinkingDuration}s`,
      thinkingSteps: mockResult.thinkingSteps,
      model: activeModel,
      mode: activeMode,
      isStreaming: false,
    };

    updateCurrentMessages((prev) => [...prev, newBotMessage]);
  };

  const handleRate = (messageId: string, isLiked: boolean) => {
    updateCurrentMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            liked: m.liked === isLiked ? null : isLiked,
          };
        }
        return m;
      })
    );
  };

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New conversation',
      timestamp: 'Just now',
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleClearCurrentChat = () => {
    updateCurrentMessages([]);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fallbackId = `session-${Date.now()}`;
        setActiveSessionId(fallbackId);
        return [
          {
            id: fallbackId,
            title: 'New conversation',
            timestamp: 'Just now',
            messages: [],
          },
        ];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors">
      {/* Sidebar / Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header */}
        <Header
          activeModel={activeModel}
          onModelChange={setActiveModel}
          activeMode={activeMode}
          onToggleMode={() =>
            setActiveMode((prev) => (prev === 'normal' ? 'fun' : 'normal'))
          }
          onNewChat={handleNewChat}
          onClearChat={handleClearCurrentChat}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasApiKey={apiKeyAvailable}
          hasMessages={messages.length > 0}
        />

        {/* Content Area: Empty State or Message List */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {messages.length === 0 ? (
            <EmptyState
              onSelectPrompt={handleSendMessage}
              mode={activeMode}
              model={activeModel}
            />
          ) : (
            <MessageList
              messages={messages}
              isThinking={isThinking}
              activeModel={activeModel}
              onRegenerate={handleRegenerate}
              onRate={handleRate}
            />
          )}
        </main>

        {/* Fixed Bottom Input Bar */}
        <InputBar
          onSendMessage={handleSendMessage}
          disabled={isThinking}
          mode={activeMode}
          onToggleMode={() =>
            setActiveMode((prev) => (prev === 'normal' ? 'fun' : 'normal'))
          }
          model={activeModel}
          onModelChange={setActiveModel}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => setApiKeyAvailable(!!getStoredApiKey())}
      />
    </div>
  );
};

