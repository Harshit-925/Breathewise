import React from 'react';
import { aqiCategory } from '../../lib/engine/aqi.js';

interface AqiBadgeProps {
  aqi: number;
  showDetails?: boolean;
}

export const AqiBadge: React.FC<AqiBadgeProps> = ({ aqi, showDetails = true }) => {
  const cat = aqiCategory(aqi, 'epa');

  // Accessible color pairs for background and text
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    '#00e400': { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-900 dark:text-emerald-200', border: 'border-emerald-400' },
    '#ffff00': { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-950 dark:text-amber-200', border: 'border-amber-400' },
    '#ff7e00': { bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-950 dark:text-orange-200', border: 'border-orange-400' },
    '#ff0000': { bg: 'bg-rose-100 dark:bg-rose-950', text: 'text-rose-950 dark:text-rose-200', border: 'border-rose-400' },
    '#8f3f97': { bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-950 dark:text-purple-200', border: 'border-purple-400' },
    '#7e0023': { bg: 'bg-red-200 dark:bg-red-950', text: 'text-red-950 dark:text-red-200', border: 'border-red-600' },
  };

  const scheme = colorMap[cat.color] ?? {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-900 dark:text-slate-100',
    border: 'border-slate-400',
  };

  return (
    <div
      role="status"
      aria-label={`Air Quality Index is ${aqi}, classified as ${cat.label}`}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${scheme.bg} ${scheme.text} ${scheme.border} font-medium text-sm`}
    >
      <span aria-hidden="true" className="text-base">{cat.icon}</span>
      <span className="font-bold">{aqi}</span>
      {showDetails && <span className="text-xs uppercase tracking-wider">{cat.label}</span>}
      <span className="sr-only">Air Quality Index {aqi}: {cat.label}</span>
    </div>
  );
};
