import React, { useState } from 'react';
import { useAirData } from '../../hooks/useAirData.js';
import { useAdvice } from '../../hooks/useAdvice.js';
import { compareModes } from '../../lib/engine/modes.js';
import { MODE_EXPOSURE_MULTIPLIER } from '../../lib/constants.js';
import type { TransportMode } from '../../types/index.js';
import { LoadingSpinner } from '../shared/LoadingSpinner.js';

const ALL_MODES: TransportMode[] = ['metro', 'bus', 'car', 'ev', 'two_wheeler', 'cycle', 'walk'];

const MODE_LABELS: Record<TransportMode, { label: string; icon: string }> = {
  metro: { label: 'Metro / Rapid Rail', icon: '🚇' },
  bus: { label: 'Public Bus', icon: '🚌' },
  car: { label: 'Petrol / Diesel Car', icon: '🚗' },
  ev: { label: 'Electric Vehicle (EV)', icon: '⚡' },
  two_wheeler: { label: 'Motorbike / Scooter', icon: '🛵' },
  cycle: { label: 'Bicycle', icon: '🚲' },
  walk: { label: 'Walking', icon: '🚶' },
};

export const AlternativesView: React.FC = () => {
  const { airData } = useAirData();
  const { advice, loading } = useAdvice(airData);

  const [distanceKm, setDistanceKm] = useState<number>(10);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [selectedTravelMode, setSelectedTravelMode] = useState<TransportMode>('two_wheeler');

  const pm25 = airData?.pm25 ?? 90;
  const comparison = compareModes({ distanceKm, durationMinutes: durationMins }, pm25, ALL_MODES);

  // Calculate diurnal commute exposure windows (6 AM to 9 PM)
  const hourlyWindows = (airData?.hourly && airData.hourly.length > 0)
    ? airData.hourly
        .filter((h) => h.hour >= 6 && h.hour <= 21)
        .map((h) => {
          const multiplier = MODE_EXPOSURE_MULTIPLIER[selectedTravelMode] ?? 1;
          const breathingRateM3h = (16 * 60) / 1000; // adult light breathing (16 L/min)
          const dose = h.pm25 * multiplier * breathingRateM3h * (durationMins / 60);
          return {
            hour: h.hour,
            pm25: h.pm25,
            dose,
          };
        })
    : [];

  const bestHour = hourlyWindows.length > 0
    ? [...hourlyWindows].sort((a, b) => a.dose - b.dose)[0]
    : null;

  const worstHour = hourlyWindows.length > 0
    ? [...hourlyWindows].sort((a, b) => b.dose - a.dose)[0]
    : null;

  const doseSaved = bestHour && worstHour ? Math.max(0, worstHour.dose - bestHour.dose) : 0;
  const pctSaved = bestHour && worstHour && worstHour.dose > 0
    ? Math.round((doseSaved / worstHour.dose) * 100)
    : 0;

  if (loading) return <LoadingSpinner label="Loading commute alternatives..." />;

  return (
    <div className="space-y-6">
      {/* 1. Mode Comparison Table */}
      <section aria-labelledby="mode-comparison-heading" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 id="mode-comparison-heading" className="text-lg font-bold">
              Transport Mode Comparison: Smog Exposure vs. Carbon
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Compare how your travel choice impacts your lungs and the urban air basin.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div>
              <label htmlFor="dist-input" className="font-semibold block text-slate-600 dark:text-slate-400">Distance (km)</label>
              <input
                id="dist-input"
                type="number"
                min="1"
                max="100"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-20 px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label htmlFor="dur-input" className="font-semibold block text-slate-600 dark:text-slate-400">Duration (mins)</label>
              <input
                id="dur-input"
                type="number"
                min="5"
                max="180"
                value={durationMins}
                onChange={(e) => setDurationMins(Math.max(5, parseFloat(e.target.value) || 5))}
                className="w-20 px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Inhaled PM2.5 (µg)</th>
                <th className="py-2.5 px-3">CO2e Emissions (kg)</th>
                <th className="py-2.5 px-3">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparison.results.map((r) => {
                const meta = MODE_LABELS[r.mode];
                const isBest = r.mode === 'metro';
                return (
                  <tr key={r.mode} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${isBest ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
                    <td className="py-3 px-3 font-semibold flex items-center gap-2">
                      <span aria-hidden="true" className="text-base">{meta.icon}</span>
                      <span>{meta.label}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">
                      {Math.round(r.inhaledPm25Ug)} µg
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">
                      {r.co2eKg.toFixed(2)} kg
                    </td>
                    <td className="py-3 px-3">
                      {isBest && (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                          ⭐ Top Pick
                        </span>
                      )}
                      {r.mode === 'two_wheeler' && (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">High tailpipe exposure</span>
                      )}
                      {r.mode === 'car' && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Highest emission rate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">
          {comparison.assumptions.join(' • ')}
        </p>
      </section>

      {/* 2. Best Time to Travel: Diurnal Lowest-Exposure Window */}
      {hourlyWindows.length > 0 && (
        <section aria-labelledby="travel-window-heading" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">⏱️</span>
                <h2 id="travel-window-heading" className="text-lg font-bold">
                  Best Time to Travel: Lowest-Exposure Commute Window
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Calculated using hourly CAMS PM2.5 forecasts and EPA inhalation rates across diurnal temperature inversions.
              </p>
            </div>

            {/* Travel Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              {(['metro', 'bus', 'two_wheeler', 'car', 'walk'] as TransportMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedTravelMode(m)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    selectedTravelMode === m
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span aria-hidden="true" className="mr-1">{MODE_LABELS[m]?.icon}</span>
                  <span className="capitalize">{m.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actionable Comparison Callout */}
          {bestHour && worstHour && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 border border-emerald-200 dark:border-emerald-800/50 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                    <span>💡</span> Lowest-Exposure Departure Recommendation
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    Departing at <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{bestHour.hour}:00</strong> instead of peak smog at <strong className="text-rose-700 dark:text-rose-300 font-bold">{worstHour.hour}:00</strong> reduces inhaled PM2.5 by <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{pctSaved}%</strong> ({doseSaved.toFixed(1)} µg saved) for the same {distanceKm} km trip.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 shadow-sm text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Best Window</span>
                    <strong className="text-sm font-mono text-emerald-600 dark:text-emerald-400">{bestHour.hour}:00 - {(bestHour.hour + 1) % 24}:00</strong>
                    <span className="block text-[11px] text-slate-500">{Math.round(bestHour.dose)} µg dose</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 shadow-sm text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Peak Smog</span>
                    <strong className="text-sm font-mono text-rose-600 dark:text-rose-400">{worstHour.hour}:00 - {(worstHour.hour + 1) % 24}:00</strong>
                    <span className="block text-[11px] text-slate-500">{Math.round(worstHour.dose)} µg dose</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hourly Timeline Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[580px] flex items-end gap-1.5 h-32 pt-4 px-2">
              {hourlyWindows.map((w) => {
                const isBest = bestHour && w.hour === bestHour.hour;
                const isWorst = worstHour && w.hour === worstHour.hour;
                const barHeight = Math.max(15, Math.min(100, (w.dose / (worstHour?.dose || 1)) * 100));

                let barColor = 'bg-blue-400 dark:bg-blue-600';
                if (isBest) barColor = 'bg-emerald-500 dark:bg-emerald-400';
                else if (isWorst) barColor = 'bg-rose-500 dark:bg-rose-400';
                else if (w.pm25 > 120) barColor = 'bg-amber-500 dark:bg-amber-600';

                return (
                  <div key={w.hour} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="text-[10px] font-mono text-slate-400 mb-1">
                      {Math.round(w.dose)}
                    </div>
                    <div
                      style={{ height: `${barHeight}%` }}
                      className={`w-full rounded-t-md transition-all ${barColor} group-hover:opacity-90`}
                      title={`${w.hour}:00 • ${Math.round(w.pm25)} µg/m³ • ${w.dose.toFixed(1)} µg dose`}
                    />
                    <div className={`mt-2 text-[10px] font-mono ${isBest ? 'font-bold text-emerald-600 dark:text-emerald-400' : isWorst ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                      {w.hour}h
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sr-only">
            {hourlyWindows.map((w) => (
              <p key={w.hour}>
                At {w.hour}:00, ambient PM2.5 is {w.pm25} micrograms per cubic meter, resulting in an estimated inhaled dose of {w.dose.toFixed(1)} micrograms for {selectedTravelMode}.
              </p>
            ))}
          </div>
        </section>
      )}

      {/* 3. AI Lifestyle & Commute Swaps */}
      {advice?.alternatives && (
        <section aria-labelledby="swaps-heading" className="space-y-4">
          <h2 id="swaps-heading" className="text-lg font-bold">
            Tailored Clean Travel Swaps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advice.alternatives.map((swap, idx) => (
              <article
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-slate-500">Effort: {swap.effort}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    Clean Swap
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-xs p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
                    <span className="font-bold">From: </span>{swap.from}
                  </div>
                  <div className="text-xs p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold">To: </span>{swap.to}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500 block">Exposure Delta</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {swap.exposureDelta} µg
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CO2e Saved</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {swap.co2eDelta} kg
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
