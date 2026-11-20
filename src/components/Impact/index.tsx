import React, { useState } from 'react';
import { useAirData } from '../../hooks/useAirData.js';
import { inhaledDose } from '../../lib/engine/exposure.js';
import { actionImpact } from '../../lib/engine/impact.js';

export const ImpactView: React.FC = () => {
  const { airData } = useAirData();
  const pm25 = airData?.pm25 ?? 120;

  // Interactive toggle actions
  const [useMask, setUseMask] = useState<boolean>(true);
  const [usePurifier, setUsePurifier] = useState<boolean>(true);
  const [workFromHome, setWorkFromHome] = useState<boolean>(false);
  const [switchTransit, setSwitchTransit] = useState<boolean>(true);

  // Baseline scenario: 3 hours outdoors, no mask, leaky indoor, car commute
  const baselineDose = inhaledDose(pm25, 3, 0.9, 0.7, 0).doseUg;
  const baselineCarCo2e = 2.4; // 12 km commute

  // Active scenario
  const outdoorHours = workFromHome ? 0.5 : 2.0;
  const maskEfficiency = useMask ? 0.95 : 0;
  const indoorIoRatio = usePurifier ? 0.2 : 0.6;
  const activeDose = inhaledDose(pm25, outdoorHours, 0.9, indoorIoRatio, maskEfficiency).doseUg;

  const wfhImpact = workFromHome ? actionImpact('wfh', { dailyDriveKm: 15, currentMode: 'car' }) : null;
  const transitImpact = switchTransit ? actionImpact('public_transit', { dailyDriveKm: 12, currentMode: 'car' }) : null;

  const co2eSavedTotal = (wfhImpact?.co2eSavedKg ?? 0) + (transitImpact?.co2eSavedKg ?? 0);
  const activeCo2e = Math.max(0, baselineCarCo2e - co2eSavedTotal);

  const doseReductionPct = Math.round(((baselineDose - activeDose) / (baselineDose || 1)) * 100);

  return (
    <section aria-labelledby="impact-meter-heading" className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 id="impact-meter-heading" className="text-lg font-bold">
          Personal Exposure & Emission Impact Meter
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Toggle personal interventions below to see direct mathematical reduction in PM2.5 inhaled dose and avoided greenhouse emissions.
        </p>

        {/* Action Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            useMask ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={useMask}
              onChange={(e) => setUseMask(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
            <span className="text-xs font-semibold">Wear N95 Outdoors (95% filter)</span>
          </label>

          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            usePurifier ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={usePurifier}
              onChange={(e) => setUsePurifier(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
            <span className="text-xs font-semibold">Run HEPA Purifier (I/O 0.2)</span>
          </label>

          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            workFromHome ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={workFromHome}
              onChange={(e) => setWorkFromHome(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
            <span className="text-xs font-semibold">Work From Home (Skip traffic)</span>
          </label>

          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            switchTransit ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={switchTransit}
              onChange={(e) => setSwitchTransit(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
            <span className="text-xs font-semibold">Switch to Metro / Transit</span>
          </label>
        </div>

        {/* Before / After Comparison Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          {/* Dose meter */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inhaled PM2.5 Dose</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ↓ {doseReductionPct}% Saved
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div>
                <span className="text-[11px] text-slate-400 block">Baseline (Unprotected)</span>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {Math.round(baselineDose)} µg
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">With Your Choices</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {Math.round(activeDose)} µg
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, 100 - doseReductionPct)}%` }}
              />
            </div>
          </div>

          {/* Carbon emissions meter */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily Commute Carbon</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ↓ {co2eSavedTotal.toFixed(2)} kg CO2e
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div>
                <span className="text-[11px] text-slate-400 block">Baseline Solo Car</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {baselineCarCo2e.toFixed(2)} kg
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Protected Commute</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {activeCo2e.toFixed(2)} kg
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, (activeCo2e / baselineCarCo2e) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Assumptions Accordion */}
        <details className="mt-5 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-400">
          <summary className="cursor-pointer font-semibold select-none">
            📐 View Mathematical Formulas & Scientific Assumptions
          </summary>
          <div className="mt-3 space-y-1.5 leading-relaxed text-[11px] border-t border-slate-200 dark:border-slate-700 pt-2">
            <p><strong>Inhaled Dose:</strong> Dose (µg) = Ambient PM2.5 × Hours × Breathing Rate (0.9 m³/h) × (1 - Mask Efficiency) × Indoor/Outdoor Ratio.</p>
            <p><strong>Mask Efficiency:</strong> N95 certified respirator modeled at 95% filtration efficiency when well-fitted.</p>
            <p><strong>Emissions:</strong> DEFRA and CPCB passenger car emission baseline: ~0.192 kg CO2e/km; Electric metro transit baseline: ~0.038 kg CO2e/passenger-km.</p>
          </div>
        </details>
      </div>
    </section>
  );
};
