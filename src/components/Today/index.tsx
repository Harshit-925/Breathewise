import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { useAirData } from '../../hooks/useAirData.js';
import { useAdvice } from '../../hooks/useAdvice.js';
import { AirSnapshot } from './AirSnapshot.js';
import { VerdictCard } from './VerdictCard.js';
import { HourlyBestWindows } from './HourlyBestWindows.js';
import { LoadingSpinner } from '../shared/LoadingSpinner.js';

export const TodayView: React.FC = () => {
  const { simulationMultiplier, setSimulationMultiplier } = useApp();
  const { airData, stagnation, whoMultiple, bestWindows, isSimulation, loading, error } = useAirData();
  const { advice, loading: adviceLoading } = useAdvice(airData);

  if (loading && !airData) {
    return <LoadingSpinner label="Fetching live air quality..." />;
  }

  if (error && !airData) {
    return (
      <div role="alert" className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
        Failed to load air data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simulation Scenario Slider */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <strong className="text-sm font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
            <span>🧪</span> What-If Smog Spike Simulator
          </strong>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
            Test how recommendations adapt if a severe winter smog episode occurs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="smog-multiplier" className="text-xs font-semibold text-purple-900 dark:text-purple-200">
            Pollution Multiplier: {simulationMultiplier.toFixed(1)}x
          </label>
          <input
            id="smog-multiplier"
            type="range"
            min="0.5"
            max="3.5"
            step="0.5"
            value={simulationMultiplier}
            onChange={(e) => setSimulationMultiplier(parseFloat(e.target.value))}
            className="w-32 accent-purple-600"
          />
          {simulationMultiplier !== 1.0 && (
            <button
              type="button"
              onClick={() => setSimulationMultiplier(1.0)}
              className="text-xs text-purple-700 dark:text-purple-300 underline font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {airData && (
        <>
          <AirSnapshot
            airData={airData}
            stagnation={stagnation}
            whoMultiple={whoMultiple}
            isSimulation={isSimulation}
          />
          <VerdictCard advice={advice} loading={adviceLoading} />
          <HourlyBestWindows hourly={airData.hourly} bestWindows={bestWindows} />
        </>
      )}
    </div>
  );
};
