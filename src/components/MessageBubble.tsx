import React, { useState } from 'react';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: (messageId: string) => void;
  onRate?: (messageId: string, isLiked: boolean) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRegenerate,
  onRate,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const isBot = message.sender === 'bot';

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Helper to parse markdown-like code blocks and formatted text
  const renderFormattedText = (rawText: string) => {
    const parts = rawText.split(/(```[\s\S]*?```)/g);
    let codeBlockCount = 0;

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const currentCodeIdx = codeBlockCount++;
        const content = part.slice(3, -3);
        const firstLineEnd = content.indexOf('\n');
        let language = 'code';
        let code = content;

        if (firstLineEnd !== -1) {
          language = content.slice(0, firstLineEnd).trim() || 'code';
          code = content.slice(firstLineEnd + 1);
        }

        return (
          <div
            key={index}
            className="my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-[#0d1117] text-gray-100 text-xs font-mono shadow-sm"
          >
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#161b22] border-b border-gray-800 text-gray-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {language}
              </span>
              <button
                onClick={() => handleCopyCode(code, currentCodeIdx)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-gray-800 text-gray-300 transition-colors text-[11px]"
                title="Copy code"
              >
                {copiedCodeIndex === currentCodeIdx ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto leading-relaxed scrollbar-thin">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Process paragraphs, bold text, inline code, and lists
      const lines = part.split('\n');
      return (
        <span key={index} className="inline-block w-full">
          {lines.map((line, lIdx) => {
            // Unordered list
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              const listContent = line.trim().replace(/^[-*]\s+/, '');
              return (
                <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-2 flex-shrink-0" />
                  <span className="flex-1">{formatInline(listContent)}</span>
                </div>
              );
            }

            // Numbered list
            const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                  <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0">
                    {numMatch[1]}.
                  </span>
                  <span className="flex-1">{formatInline(numMatch[2])}</span>
                </div>
              );
            }

            // Regular line
            return (
              <span key={lIdx} className="block min-h-[1.25rem]">
                {formatInline(line)}
              </span>
            );
          })}
        </span>
      );
    });
  };

  const formatInline = (text: string) => {
    // Process **bold** and `code`
    const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return tokens.map((token, tIdx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={tIdx} className="font-semibold text-gray-900 dark:text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={tIdx}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-pink-600 dark:text-pink-400 font-mono text-xs"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  return (
    <div
      className={`w-full flex mb-4 animate-slide-up ${
        isBot ? 'justify-start' : 'justify-end'
      }`}
    >
      <div
        className={`flex gap-3 max-w-[92%] sm:max-w-[82%] md:max-w-[75%] ${
          isBot ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        {/* Avatar */}
        {isBot ? (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm text-white dark:text-black">
            {/* Grok Minimalist Geometric Slash Icon */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20L20 4" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <circle cx="16" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </div>
        ) : null}

        {/* Message Content Container */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {/* Thinking duration pill for bot if available */}
          {isBot && message.thinkingTime && (
            <div className="self-start mb-0.5">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
              >
                <Sparkles size={11} className="text-blue-500" />
                <span>{message.thinkingTime}</span>
                {showThinking ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showThinking && message.thinkingSteps && (
                <div className="mt-2 p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-900/50 text-xs text-gray-500 dark:text-gray-400 space-y-1 animate-fade-in">
                  {message.thinkingSteps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bubble */}
          <div
            className={`relative px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed break-words shadow-sm transition-all ${
              isBot
                ? 'bg-transparent text-gray-900 dark:text-gray-100 border-0 p-0 sm:px-1'
                : 'bg-black text-white dark:bg-white dark:text-black rounded-tr-sm ml-auto'
            }`}
          >
            {renderFormattedText(message.text)}

            {/* Streaming cursor indicator if still generating */}
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 dark:bg-blue-400 animate-pulse align-middle" />
            )}
          </div>

          {/* Action Footer for Bot Message */}
          {isBot && !message.isStreaming && (
            <div className="flex items-center gap-1 mt-1 text-gray-400 dark:text-gray-500">
              {/* Copy */}
              <button
                onClick={handleCopyMessage}
                aria-label="Copy message"
                className="p-1.5 rounded-md hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                title="Copy response"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>

              {/* Thumbs up */}
              <button
                onClick={() => onRate?.(message.id, true)}
                className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors ${
                  message.liked === true ? 'text-blue-500' : 'hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="Good response"
              >
                <ThumbsUp size={14} />
              </button>

              {/* Thumbs down */}
              <button
                onClick={() => onRate?.(message.id, false)}
                className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors ${
                  message.liked === false ? 'text-red-500' : 'hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="Bad response"
              >
                <ThumbsDown size={14} />
              </button>

              {/* Regenerate */}
              {onRegenerate && (
                <button
                  onClick={() => onRegenerate(message.id)}
                  className="p-1.5 rounded-md hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCw size={14} />
                </button>
              )}

              {/* Share */}
              <button
                onClick={handleCopyMessage}
                className="p-1.5 rounded-md hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                title="Share response"
              >
                <Share2 size={14} />
              </button>

              {/* Timestamp & model pill */}
              <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-auto select-none font-mono">
                {message.timestamp}
              </span>
            </div>
          )}

          {/* User message timestamp */}
          {!isBot && (
            <span className="text-[11px] text-gray-400 self-end select-none pr-1">
              {message.timestamp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

