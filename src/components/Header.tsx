import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Plus,
  Trash2,
  Moon,
  Sun,
  Menu,
  Flame,
  Check,
  Settings,
} from 'lucide-react';
import { NethulModel, NethulMode } from '../types';

interface HeaderProps {
  activeModel: NethulModel;
  onModelChange: (model: NethulModel) => void;
  activeMode: NethulMode;
  onToggleMode: () => void;
  onNewChat: () => void;
  onClearChat: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  hasMessages: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeModel,
  onModelChange,
  activeMode,
  onToggleMode,
  onNewChat,
  onClearChat,
  isDarkMode,
  onToggleDarkMode,
  onToggleSidebar,
  onOpenSettings,
  hasApiKey,
  hasMessages,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const models: { name: NethulModel; desc: string; badge?: string }[] = [
    { name: 'Nethul 3', desc: 'Flagship deep reasoning & live synthesis', badge: 'Fast & Deep' },
    { name: 'Nethul 2', desc: 'Balanced intelligence & speed', badge: 'Standard' },
    { name: 'Nethul Mini', desc: 'Ultra-fast lightweight queries', badge: 'Mini' },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-neutral-900 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Mobile Menu & Logo & Model Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile sidebar toggle button */}
          <button
            onClick={onToggleSidebar}
            aria-label="Open sidebar"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Menu size={19} />
          </button>

          {/* Grok Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs shadow-xs">
              <svg
                className="w-3.5 h-3.5"
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
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white select-none hidden xs:inline">
              Nethul
            </span>
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 transition-colors"
            >
              <span>{activeModel}</span>
              <ChevronDown size={13} className="text-gray-400" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl py-1.5 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Select Model
                </div>
                {models.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => {
                      onModelChange(m.name);
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {m.name}
                        </span>
                        {m.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-mono">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {m.desc}
                      </div>
                    </div>
                    {activeModel === m.name && (
                      <Check size={14} className="text-black dark:text-white mt-1 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fun Mode Badge */}
          {activeMode === 'fun' && (
            <button
              onClick={onToggleMode}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 hover:bg-amber-100 transition-colors"
              title="Click to toggle Fun Mode off"
            >
              <Flame size={12} className="text-amber-500" /> Fun Mode
            </button>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            title="Start new conversation"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Clear Current Chat */}
          {hasMessages && (
            <button
              onClick={onClearChat}
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              title="Clear current messages"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Settings Button (OpenRouter API) */}
          <button
            onClick={onOpenSettings}
            aria-label="API Settings"
            className="relative p-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            title="OpenRouter AI Settings"
          >
            <Settings size={17} />
            {hasApiKey && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors ml-1"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
};
