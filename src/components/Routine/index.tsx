import React from 'react';
import { useAirData } from '../../hooks/useAirData.js';
import { useAdvice } from '../../hooks/useAdvice.js';
import { LoadingSpinner } from '../shared/LoadingSpinner.js';

export const RoutineView: React.FC = () => {
  const { airData } = useAirData();
  const { advice, loading } = useAdvice(airData);

  if (loading) {
    return <LoadingSpinner label="Generating your low-emission routine..." />;
  }

  if (!advice || advice.routine.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500">
        No routine currently available. Please check air data.
      </div>
    );
  }

  return (
    <section aria-labelledby="routine-heading" className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 id="routine-heading" className="text-lg font-bold">
          Tailored Low-Emission Daily Routine
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Adjust your schedule around peak diurnal smog traps and safe ventilation windows.
        </p>

        <div className="mt-6 space-y-4">
          {advice.routine.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                  ⏰ {item.window}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {item.impact}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.activity}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                <strong className="font-medium text-slate-700 dark:text-slate-300">Why: </strong>
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
