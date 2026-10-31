import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface TypingIndicatorProps {
  model?: string;
  isThinkingMode?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  model = 'Nethul 3',
  isThinkingMode = true,
}) => {
  const [seconds, setSeconds] = useState(0.8);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    'Analyzing inquiry context & nuance...',
    'Evaluating multi-domain knowledge...',
    'Synthesizing concise, sharp answer...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => +(prev + 0.1).toFixed(1));
    }, 100);

    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 max-w-2xl w-full animate-fade-in text-sm text-gray-800 dark:text-gray-200">
      {/* Grok Thinking Accordion (similar to Grok 3 / reasoning UI) */}
      {isThinkingMode && (
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-900/60 overflow-hidden transition-all duration-200">
          <button
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-gray-100/70 dark:hover:bg-neutral-800/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="font-medium text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles size={12} className="text-blue-500" />
                Thinking ({seconds}s)
              </span>
            </div>
            {isAccordionOpen ? (
              <ChevronUp size={14} className="text-gray-400" />
            ) : (
              <ChevronDown size={14} className="text-gray-400" />
            )}
          </button>

          {isAccordionOpen && (
            <div className="px-3.5 pb-2.5 pt-1 border-t border-gray-100 dark:border-neutral-800/80 text-xs text-gray-500 dark:text-gray-400 space-y-1">
              {steps.slice(0, currentStepIndex + 1).map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                  <span className={idx === currentStepIndex ? 'text-gray-900 dark:text-gray-200 font-medium' : ''}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pulsing Dots indicator */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"></span>
          <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"></span>
          <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"></span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          {model} generating response...
        </span>
      </div>
    </div>
  );
};

