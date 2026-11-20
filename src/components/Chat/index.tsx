import React, { useState } from 'react';
import { useAirData } from '../../hooks/useAirData.js';
import { useChat } from '../../hooks/useChat.js';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/apiService.js';

const STARTER_CHIPS = [
  'Is it safe for my child to play sports outside today?',
  'What is the best DIY air purifier design?',
  'Should I keep windows open or closed right now?',
  'Which mask works best for fine winter smog?',
];

export const ChatView: React.FC = () => {
  const { household } = useApp();
  const { airData } = useAirData();
  const { messages, isStreaming, error, sendMessage, stopStreaming } = useChat(airData);
  const [input, setInput] = useState('');
  const [quickAsk, setQuickAsk] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const query = input;
    setInput('');

    if (quickAsk) {
      setQuickLoading(true);
      setQuickAnswer(null);
      try {
        const res = await apiService.askQuick(query, airData ?? undefined);
        setQuickAnswer(res.answer);
      } catch {
        setQuickAnswer('Failed to get quick answer. Please try regular chat.');
      } finally {
        setQuickLoading(false);
      }
    } else {
      await sendMessage(query);
    }
  };

  return (
    <div className="space-y-4">
      {/* Context Banner */}
      <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <span>📍 <strong>{airData?.city ?? 'Location'}</strong></span>
          <span>•</span>
          <span>AQI: <strong className="font-mono">{airData?.aqi ?? '—'}</strong></span>
          <span>•</span>
          <span>PM2.5: <strong className="font-mono">{airData?.pm25 ?? '—'} µg/m³</strong></span>
        </div>
        <div>
          <span>Household: <strong>{household.name}</strong> ({household.members.length} members)</span>
        </div>
      </div>

      {/* Quick-Ask Mode Toggle */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-500">
          {quickAsk ? '⚡ Quick-Ask mode (instant 2-sentence answers)' : '💬 Full Conversational Assistant'}
        </span>
        <button
          type="button"
          onClick={() => {
            setQuickAsk(!quickAsk);
            setQuickAnswer(null);
          }}
          className={`px-3 py-1 text-xs rounded-full border font-semibold transition-colors ${
            quickAsk
              ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
              : 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {quickAsk ? '✓ Quick-Ask Active' : 'Switch to Quick-Ask'}
        </button>
      </div>

      {/* Quick Ask Result Card if active */}
      {quickAsk && quickAnswer && (
        <div role="region" aria-label="Quick Answer" className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs leading-relaxed text-amber-950 dark:text-amber-100">
          <strong className="block mb-1 font-bold text-amber-800 dark:text-amber-300">Quick Answer:</strong>
          {quickAnswer}
        </div>
      )}

      {/* Message History (Chat Mode) */}
      {!quickAsk && (
        <div
          role="log"
          aria-live="polite"
          aria-label="Conversation history"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 min-h-[360px] max-h-[500px] overflow-y-auto space-y-4"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                {msg.content || (isStreaming && idx === messages.length - 1 ? (
                  <span className="italic text-slate-400">Thinking...</span>
                ) : null)}
              </div>
            </div>
          ))}

          {error && (
            <div role="alert" className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs border border-rose-200">
              Error: {error}
            </div>
          )}
        </div>
      )}

      {/* Starter Chips */}
      <div className="flex flex-wrap gap-2">
        {STARTER_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => void sendMessage(chip)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-400 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={quickAsk ? 'Ask a quick question...' : 'Ask Breathewise about air quality, masks, routines...'}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-blue-500"
          disabled={isStreaming || quickLoading}
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={stopStreaming}
            className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-rose-700"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || quickLoading}
            className="px-5 py-2.5 bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {quickLoading ? 'Thinking...' : 'Send'}
          </button>
        )}
      </form>
    </div>
  );
};
