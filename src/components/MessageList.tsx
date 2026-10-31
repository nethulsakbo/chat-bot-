import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Message, NethulModel } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
  activeModel: NethulModel;
  onRegenerate: (messageId: string) => void;
  onRate: (messageId: string, isLiked: boolean) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isThinking,
  activeModel,
  onRegenerate,
  onRate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll to bottom on new messages or thinking state change
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isThinking]);

  // Track scroll position to show / hide floating "jump to bottom" button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 150);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-4 max-w-4xl w-full mx-auto relative transition-colors"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onRegenerate={onRegenerate}
          onRate={onRate}
        />
      ))}

      {/* Typing & Thinking indicator */}
      {isThinking && (
        <div className="flex justify-start w-full animate-fade-in pl-1 sm:pl-10">
          <TypingIndicator model={activeModel} isThinkingMode={true} />
        </div>
      )}

      {/* Target anchor for auto-scroll */}
      <div ref={bottomRef} className="h-4" />

      {/* Floating scroll to bottom button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          aria-label="Scroll to bottom"
          className="fixed bottom-24 right-6 sm:right-10 z-20 p-2.5 rounded-full bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 shadow-md border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all transform hover:scale-105 active:scale-95"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
};

