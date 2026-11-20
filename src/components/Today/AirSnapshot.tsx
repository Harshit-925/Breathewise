import React from 'react';
import type { AirData, StagnationResult, WhoMultipleResult } from '../../types/index.js';
import { AqiBadge } from '../shared/AqiBadge.js';
import { Sparkline } from '../shared/Sparkline.js';

interface AirSnapshotProps {
  airData: AirData;
  stagnation?: StagnationResult;
  whoMultiple?: WhoMultipleResult;
  isSimulation?: boolean;
}

export const AirSnapshot: React.FC<AirSnapshotProps> = ({
  airData,
  stagnation,
  whoMultiple,
  isSimulation = false,
}) => {
  const pm25Trend = airData.hourly.map((h) => h.pm25);

  return (
    <section aria-labelledby="air-snapshot-heading" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 id="air-snapshot-heading" className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Current Air Quality Snapshot
          </h2>
          <div className="text-2xl font-black mt-1 flex items-center gap-3">
            <span>{airData.city}</span>
            <AqiBadge aqi={airData.aqi} />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div>
            <span className="block text-[11px] uppercase tracking-wider">Updated</span>
            <time dateTime={airData.updatedAt}>{new Date(airData.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
          </div>
          {airData.temperature !== undefined && (
            <div>
              <span className="block text-[11px] uppercase tracking-wider">Temp</span>
              <span>{Math.round(airData.temperature)}°C</span>
            </div>
          )}
          {airData.windSpeed !== undefined && (
            <div>
              <span className="block text-[11px] uppercase tracking-wider">Wind</span>
              <span>{airData.windSpeed.toFixed(1)} m/s</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Key Pollutants & Engine Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 block">PM2.5 Concentration</span>
          <span className="text-xl font-bold">{airData.pm25} <span className="text-xs font-normal">µg/m³</span></span>
          <div className="mt-2">
            <Sparkline data={pm25Trend} width={100} height={24} strokeColor="#ef4444" ariaLabel="24-hour PM2.5 trend" />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 block">PM10 Coarse Dust</span>
          <span className="text-xl font-bold">{airData.pm10} <span className="text-xs font-normal">µg/m³</span></span>
          <span className="text-[11px] text-slate-400 block mt-3">Road dust & debris</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 block">WHO Guideline Multiple</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {whoMultiple ? `${whoMultiple.multiple}x` : '—'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">vs 15 µg/m³ 24h limit</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 block">Atmospheric Stagnation</span>
          <span className="text-xl font-bold capitalize flex items-center gap-1.5 mt-0.5">
            <span aria-hidden="true">
              {stagnation?.level === 'high' ? '🛑' : stagnation?.level === 'medium' ? '⚠️' : '✅'}
            </span>
            {stagnation?.level ?? 'Low'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {stagnation?.level === 'high' ? 'High smog trapping' : 'Normal dispersion'}
          </span>
        </div>
      </div>

      {isSimulation && (
        <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
          <span>🧪</span>
          <span>Simulation mode active: Showing synthetic smog values for testing mitigation measures.</span>
        </div>
      )}
    </section>
  );
};
