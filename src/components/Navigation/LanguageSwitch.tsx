import React from 'react';
import { useApp } from '../../context/AppContext.js';

export const LanguageSwitch: React.FC = () => {
  const { lang, setLang } = useApp();

  return (
    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900" role="group" aria-label="Language selection">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
          lang === 'en'
            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('hi')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
          lang === 'hi'
            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
        aria-pressed={lang === 'hi'}
      >
        हिन्दी
      </button>
    </div>
  );
};
