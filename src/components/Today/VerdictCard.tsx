import React from 'react';
import type { StructuredAdvice } from '../../types/index.js';

export const VerdictCard: React.FC<{ advice: StructuredAdvice | null; loading?: boolean }> = ({
  advice,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-28 rounded-2xl p-5 border border-slate-200 dark:border-slate-700" />
    );
  }

  if (!advice) return null;

  const levelStyles = {
    good: 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200',
    moderate: 'border-amber-300 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200',
    unhealthy: 'border-orange-300 bg-orange-50/70 dark:bg-orange-950/40 text-orange-950 dark:text-orange-200',
    hazardous: 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200',
  }[advice.verdict.level];

  return (
    <article aria-labelledby="verdict-heading" className={`border rounded-2xl p-5 shadow-sm ${levelStyles}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            {advice.verdict.level === 'good' ? '🍃' : advice.verdict.level === 'moderate' ? '⛅' : '⚠️'}
          </span>
          <h2 id="verdict-heading" className="text-base font-bold">
            {advice.verdict.headline}
          </h2>
        </div>

        {advice.isOffline ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full shrink-0">
            ⚡ AI unavailable, offline guidance
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-700 px-2 py-0.5 rounded-full shrink-0">
            🤖 Gemini 2.5 Flash Verified Guidance
          </span>
        )}
      </div>
      <p className="mt-1 text-sm leading-relaxed opacity-90">{advice.verdict.why}</p>
    </article>
  );
};
