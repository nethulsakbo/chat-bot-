import React from 'react';
import {
  Sparkles,
  Code2,
  Atom,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { PROMPT_SUGGESTIONS } from '../services/mockNethul';
import { NethulMode, NethulModel } from '../types';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  mode: NethulMode;
  model: NethulModel;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  mode,
  model,
}) => {
  const getIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Atom className="text-blue-500" size={18} />;
      case 1:
        return <Code2 className="text-emerald-500" size={18} />;
      case 2:
        return <Flame className="text-amber-500" size={18} />;
      default:
        return <Lightbulb className="text-purple-500" size={18} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl w-full mx-auto select-none animate-fade-in text-center">
      {/* Grok Minimalist Slash Logo */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg mb-6 transition-transform hover:scale-105 duration-300">
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 20L20 4" />
          <circle cx="8" cy="8" r="1.8" fill="currentColor" />
          <circle cx="16" cy="16" r="1.8" fill="currentColor" />
        </svg>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
        What do you want to know?
      </h1>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Powered by <span className="font-semibold text-gray-800 dark:text-gray-200">{model}</span>
        {mode === 'fun' && (
          <span className="ml-1.5 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-xs bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
            <Sparkles size={11} /> Fun Mode
          </span>
        )}
        . Deep reasoning, real-time insights, zero fluff.
      </p>

      {/* Prompt Suggestions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
        {PROMPT_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.query)}
            className="group flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50/70 dark:hover:bg-neutral-900/60 transition-all text-left shadow-2xs hover:shadow-sm"
          >
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 group-hover:scale-110 transition-transform flex-shrink-0">
              {getIcon(idx)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white truncate">
                {item.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {item.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

