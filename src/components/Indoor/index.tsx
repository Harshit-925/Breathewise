import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { useAirData } from '../../hooks/useAirData.js';
import { useAdvice } from '../../hooks/useAdvice.js';
import { cadrRequired, purificationTime, windowSchedule } from '../../lib/engine/cadr.js';
import { LoadingSpinner } from '../shared/LoadingSpinner.js';

export const IndoorView: React.FC = () => {
  const { household, setHousehold } = useApp();
  const { airData } = useAirData();
  const { advice, loading } = useAdvice(airData);

  const [length, setLength] = useState<number>(5);
  const [width, setWidth] = useState<number>(4);
  const [height, setHeight] = useState<number>(2.8);
  const [targetAch, setTargetAch] = useState<number>(4);

  const roomVol = Math.round(length * width * height);
  const cadrCalc = cadrRequired(roomVol, targetAch);
  const purifyMins = Math.round(purificationTime(roomVol, cadrCalc.cadrM3h, 1.0, 0, 0.90).minutes);

  const winSchedule = airData ? windowSchedule(airData.hourly) : null;

  if (loading) return <LoadingSpinner label="Loading indoor air guidance..." />;

  return (
    <div className="space-y-6">
      {/* 1. CADR & Purification Time Calculator */}
      <section aria-labelledby="cadr-calculator-heading" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 id="cadr-calculator-heading" className="text-lg font-bold">
          Clean Air Delivery Rate (CADR) & Decay Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Calculate the exact air filtration capacity required for your room dimensions (EPA & AHAM standard math).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div>
            <label htmlFor="dim-length" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Length (m)
            </label>
            <input
              id="dim-length"
              type="number"
              min="1"
              max="20"
              step="0.5"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label htmlFor="dim-width" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Width (m)
            </label>
            <input
              id="dim-width"
              type="number"
              min="1"
              max="20"
              step="0.5"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label htmlFor="dim-height" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Ceiling Height (m)
            </label>
            <input
              id="dim-height"
              type="number"
              min="2"
              max="6"
              step="0.2"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 2)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label htmlFor="target-ach" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Target ACH
            </label>
            <select
              id="target-ach"
              value={targetAch}
              onChange={(e) => setTargetAch(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value={3}>3 ACH (Moderate protection)</option>
              <option value={4}>4 ACH (CDC/EPA recommended)</option>
              <option value={6}>6 ACH (Vulnerable/Asthma)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <div>
            <span className="text-xs text-blue-800 dark:text-blue-300 font-semibold block">Total Room Volume</span>
            <span className="text-2xl font-black text-blue-950 dark:text-blue-100">{roomVol} <span className="text-sm font-normal">m³</span></span>
          </div>
          <div>
            <span className="text-xs text-blue-800 dark:text-blue-300 font-semibold block">Required CADR</span>
            <span className="text-2xl font-black text-blue-950 dark:text-blue-100">{cadrCalc.cadrM3h} <span className="text-sm font-normal">m³/h</span></span>
          </div>
          <div>
            <span className="text-xs text-blue-800 dark:text-blue-300 font-semibold block">90% Clean Time</span>
            <span className="text-2xl font-black text-blue-950 dark:text-blue-100">~{purifyMins} <span className="text-sm font-normal">minutes</span></span>
          </div>
        </div>

        {household.roomVolume !== roomVol && (
          <button
            type="button"
            onClick={() => setHousehold({ ...household, roomVolume: roomVol })}
            className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Apply {roomVol} m³ volume to my household profile
          </button>
        )}
      </section>

      {/* 2. Window Ventilation Schedule */}
      {winSchedule && (
        <section aria-labelledby="window-schedule-heading" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 id="window-schedule-heading" className="text-lg font-bold">
            Window Ventilation vs. Sealing Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hour-by-hour guidance on when outdoor air is clean enough to flush indoor CO2 without letting in severe PM2.5.
          </p>

          <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2">
            {winSchedule.slots.map((slot) => (
              <div
                key={slot.hour}
                className={`p-2 rounded-lg text-center border text-xs ${
                  slot.recommended
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300'
                }`}
              >
                <div className="font-mono font-bold">{String(slot.hour).padStart(2, '0')}:00</div>
                <div className="text-[10px] mt-1">{slot.pm25} µg</div>
                <div className="font-bold text-[11px] mt-1">
                  {slot.recommended ? 'Ventilate' : 'Seal'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Three Tiers of Indoor Air Solutions */}
      {advice?.indoor && (
        <section aria-labelledby="indoor-tiers-heading" className="space-y-4">
          <h2 id="indoor-tiers-heading" className="text-lg font-bold">
            Indoor Air Quality Hacks & Solutions by Budget
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {advice.indoor.map((tier) => (
              <article
                key={tier.tier}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tier.tier === 'diy' ? '🛠️ DIY / Budget' : tier.tier === 'standard' ? '📦 Standard' : '🌟 Premium'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{tier.costBand}</span>
                  </div>

                  <h3 className="font-bold text-base mb-2">{tier.title}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-4">{tier.effect}</p>

                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {tier.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  {tier.assumptions.join(' • ')}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
