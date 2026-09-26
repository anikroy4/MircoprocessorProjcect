import { useState, useEffect, useCallback, useRef } from 'react';
import { getLatestSensors } from '../services/api.js';
import { POLL_INTERVAL } from '../utils/constants.js';

export function useSensorData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const result = await getLatestSensors(abortRef.current.signal);
      setData(result);
      setLastUpdated(new Date().toISOString());
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        // 404 means "no data yet" — not a real error, just show empty state
        if (err.message && err.message.includes('No sensor readings')) {
          setData(null);
          setError(null);
        } else {
          setError(err.message || 'Failed to fetch sensor data');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}
