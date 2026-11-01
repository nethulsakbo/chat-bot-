import React, { useState } from 'react';
import { X, Check, Key, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import {
  AVAILABLE_MODELS,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
} from '../services/openRouter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [selectedModel, setSelectedModel] = useState(getStoredModel());
  const [isSaved, setIsSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setStoredModel(selectedModel);
    setIsSaved(true);
    onSaved?.();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (res.ok) {
        const data = await res.json();
        const label = data?.data?.label || 'Key verified';
        const freeReqs = data?.data?.free_model_daily_requests?.remaining ?? 50;
        setTestResult({
          success: true,
          message: `Valid (${label}). Free daily requests remaining: ${freeReqs}`,
        });
      } else {
        setTestResult({ success: false, message: `Key check failed (Status ${res.status}).` });
      }
    } catch {
      setTestResult({ success: false, message: 'Could not reach OpenRouter. Check network.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">
              <Key size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                OpenRouter AI Settings
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure live AI models and API credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            OpenRouter API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-900 text-xs font-mono text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span>Stored securely in your local browser storage</span>
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
            >
              {isTesting ? 'Verifying...' : 'Test Connection'}
            </button>
          </div>
          {testResult && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {testResult.success ? <ShieldCheck size={14} /> : <X size={14} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Live OpenRouter Model
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            {AVAILABLE_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m.id)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                  selectedModel === m.id
                    ? 'border-black dark:border-white bg-gray-50 dark:bg-neutral-800/80 font-medium'
                    : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50/50 dark:hover:bg-neutral-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white font-medium">{m.name}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-mono">
                      {m.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                    {m.id}
                  </div>
                </div>
                {selectedModel === m.id && (
                  <Check size={15} className="text-black dark:text-white flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-800">
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
          >
            Get an API key <ExternalLink size={10} />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all shadow-sm active:scale-95"
            >
              {isSaved ? (
                <>
                  <Check size={14} className="text-emerald-400 dark:text-emerald-600" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

