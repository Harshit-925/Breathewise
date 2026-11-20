import React from 'react';
import type { BestWindowsResult, HourlyData } from '../../types/index.js';

interface HourlyBestWindowsProps {
  hourly: readonly HourlyData[];
  bestWindows?: BestWindowsResult;
}

export const HourlyBestWindows: React.FC<HourlyBestWindowsProps> = ({ hourly, bestWindows }) => {
  const maxPm25 = Math.max(...hourly.map((h) => h.pm25), 100);

  return (
    <section aria-labelledby="hourly-windows-heading" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="hourly-windows-heading" className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            24-Hour Forecast & Best Outdoor Windows
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked cleanest hours for walks, commute, and ventilation
          </p>
        </div>
      </div>

      {/* Recommended Windows Chips */}
      {bestWindows && bestWindows.windows.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {bestWindows.windows.map((w, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-medium"
            >
              <span aria-hidden="true">🌟 Window #{idx + 1}:</span>
              <strong className="font-bold">
                {String(w.startHour).padStart(2, '0')}:00 - {String(w.endHour).padStart(2, '0')}:00
              </strong>
              <span>({w.avgPm25} µg/m³ avg)</span>
            </div>
          ))}
        </div>
      )}

      {/* SVG Bar Chart with sr-only Text Equivalent */}
      <div className="relative">
        <svg
          viewBox="0 0 720 120"
          className="w-full h-28 overflow-visible"
          aria-hidden="true"
          focusable="false"
        >
          {hourly.map((h, idx) => {
            const barWidth = 22;
            const x = idx * 30 + 4;
            const barHeight = Math.max(4, (h.pm25 / maxPm25) * 85);
            const y = 100 - barHeight;
            const isHigh = h.pm25 > 100;
            const isModerate = h.pm25 > 35;
            const fill = isHigh ? '#f43f5e' : isModerate ? '#f59e0b' : '#10b981';

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  fill={fill}
                  className="transition-all hover:opacity-80"
                />
                {idx % 3 === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={115}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {String(h.hour).padStart(2, '0')}h
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Screen Reader Twin */}
        <div className="sr-only">
          <h3>Hourly PM2.5 Forecast:</h3>
          <ul>
            {hourly.map((h) => (
              <li key={h.hour}>
                Hour {h.hour}:00 — PM2.5 is {h.pm25} µg/m³.
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
