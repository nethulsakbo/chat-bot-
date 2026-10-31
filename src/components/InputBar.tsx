import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Flame,
  Sparkles,
  Paperclip,
  Globe,
  X,
} from 'lucide-react';
import { NethulMode, NethulModel } from '../types';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  mode: NethulMode;
  onToggleMode: () => void;
  model: NethulModel;
  onModelChange: (model: NethulModel) => void;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  disabled = false,
  mode,
  onToggleMode,
  model,
}) => {
  const [text, setText] = useState('');
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [isThinkEnabled, setIsThinkEnabled] = useState(true);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap at 160px
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setText('');
    setAttachedFile(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (unless Shift is held)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-black border-t border-gray-100 dark:border-neutral-900 pb-[env(safe-area-inset-bottom,12px)] transition-colors">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Attachment badge preview if file uploaded */}
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 w-fit animate-fade-in">
            <Paperclip size={13} className="text-gray-500" />
            <span className="truncate max-w-[200px]">{attachedFile}</span>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Outer Input Box with Grok rounded styling */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] shadow-sm hover:border-gray-300 dark:hover:border-neutral-700 focus-within:border-gray-400 dark:focus-within:border-neutral-600 transition-all">
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={
                mode === 'fun'
                  ? 'Ask Nethul anything (Fun Mode active 🔥)...'
                  : `Ask ${model} anything...`
              }
              className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none min-h-[44px] max-h-[160px] leading-relaxed"
            />

            {/* Bottom Controls Bar inside Input */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              {/* Left Action Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* File Attachment Hidden Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Attach file"
                >
                  <Paperclip size={17} />
                </button>

                {/* DeepSearch toggle */}
                <button
                  type="button"
                  onClick={() => setIsDeepSearch(!isDeepSearch)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    isDeepSearch
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Toggle DeepSearch"
                >
                  <Globe size={13} />
                  <span className="hidden xs:inline">DeepSearch</span>
                </button>

                {/* Think reasoning toggle */}
                <button
                  type="button"
                  onClick={() => setIsThinkEnabled(!isThinkEnabled)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    isThinkEnabled
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Toggle Thinking reasoning"
                >
                  <Sparkles size={13} />
                  <span>Think</span>
                </button>

                {/* Fun Mode Toggle Pill */}
                <button
                  type="button"
                  onClick={onToggleMode}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    mode === 'fun'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-semibold shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Toggle Fun Mode"
                >
                  <Flame size={13} className={mode === 'fun' ? 'text-amber-500 animate-bounce' : ''} />
                  <span>Fun Mode</span>
                </button>
              </div>

              {/* Right Send Button */}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!text.trim() || disabled}
                  aria-label="Send message"
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${
                    text.trim() && !disabled
                      ? 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 shadow-sm'
                      : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Disclaimer subtext */}
        <div className="mt-1.5 text-center text-[11px] text-gray-400 dark:text-gray-500 select-none">
          Nethul can make mistakes. Verify important facts and check sources.
        </div>
      </div>
    </div>
  );
};
