import React from 'react';
import type { StructuredAdvice } from '../../../server/ai/fallback.js';

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
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {advice.verdict.level === 'good' ? '🍃' : advice.verdict.level === 'moderate' ? '⛅' : '⚠️'}
        </span>
        <div>
          <h2 id="verdict-heading" className="text-base font-bold">
            {advice.verdict.headline}
          </h2>
          <p className="mt-1 text-sm leading-relaxed opacity-90">{advice.verdict.why}</p>
        </div>
      </div>
    </article>
  );
};
