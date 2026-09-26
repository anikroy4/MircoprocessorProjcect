import { useState, useEffect, useCallback, useRef } from 'react';
import { getSystemStatus } from '../services/api.js';
import { POLL_INTERVAL } from '../utils/constants.js';

export function useSystemStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const result = await getSystemStatus(abortRef.current.signal);
      setStatus(result);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch system status');
        // Mark system as offline when unreachable
        setStatus((prev) => prev ? { ...prev, backend_status: 'offline' } : null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchStatus]);

  const isOnline = status?.backend_status === 'online';
  const isArduinoConnected = status?.arduino_status === 'connected';
  const isEspConnected = status?.esp8266_status === 'connected';

  return { status, loading, error, isOnline, isArduinoConnected, isEspConnected, refetch: fetchStatus };
}
