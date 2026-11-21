import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/apiService.js';
import type { AirData, StructuredAdvice } from '../types/index.js';

export function useAdvice(airData: AirData | null) {
  const { household, lang } = useApp();
  const [advice, setAdvice] = useState<StructuredAdvice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = useCallback(async () => {
    if (!airData) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getAdvice(household, airData, lang);
      setAdvice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [household, airData, lang]);

  useEffect(() => {
    void fetchAdvice();
  }, [fetchAdvice]);

  return { advice, loading, error, refresh: fetchAdvice };
}
