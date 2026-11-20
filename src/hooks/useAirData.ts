import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext.js';
import { apiService, type AirApiResponse } from '../services/apiService.js';
import { pm25ToAqi } from '../lib/engine/aqi.js';
import type { AirData } from '../types/index.js';

export function useAirData() {
  const { location, simulationMultiplier } = useApp();
  const [rawResponse, setRawResponse] = useState<AirApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAir = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAirData(location.lat, location.lon);
      setRawResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load air data');
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lon]);

  useEffect(() => {
    void fetchAir();
  }, [fetchAir]);

  // Apply simulation multiplier if set
  const airData: AirData | null = useMemo(() => {
    if (!rawResponse) return null;
    const base = rawResponse.airData;
    if (simulationMultiplier === 1.0) return base;

    const simulatedPm25 = Math.round(base.pm25 * simulationMultiplier);
    const simulatedAqi = pm25ToAqi(simulatedPm25).aqi;
    const simulatedHourly = base.hourly.map((h) => ({
      ...h,
      pm25: Math.round(h.pm25 * simulationMultiplier),
    }));

    return {
      ...base,
      pm25: simulatedPm25,
      aqi: simulatedAqi,
      hourly: simulatedHourly,
    };
  }, [rawResponse, simulationMultiplier]);

  const isSimulation = simulationMultiplier !== 1.0;

  return {
    airData,
    stagnation: rawResponse?.stagnation,
    whoMultiple: rawResponse?.whoMultiple,
    bestWindows: rawResponse?.bestWindows,
    attribution: rawResponse?.attribution ?? 'CAMS ENSEMBLE + Open-Meteo',
    isMock: rawResponse?.isMock ?? false,
    isStale: rawResponse?.isStale ?? false,
    isSimulation,
    loading,
    error,
    refetch: fetchAir,
  };
}
