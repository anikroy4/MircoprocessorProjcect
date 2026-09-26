import { useState, useEffect, useCallback, useRef } from 'react';
import { getActuatorStatus, controlActuator } from '../services/api.js';
import { POLL_INTERVAL } from '../utils/constants.js';

export function useActuatorStatus() {
  const [actuators, setActuators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controlling, setControlling] = useState(null); // device being controlled
  const abortRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const result = await getActuatorStatus(abortRef.current.signal);
      setActuators(result);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch actuator status');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const sendCommand = useCallback(async (device, action, mode, value) => {
    setControlling(device);
    try {
      const result = await controlActuator(device, action, mode, value);
      // Refresh after command
      await fetchStatus();
      return result;
    } finally {
      setControlling(null);
    }
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchStatus]);

  const getActuator = useCallback((device) => {
    return actuators.find((a) => a.device === device) || null;
  }, [actuators]);

  return { actuators, loading, error, controlling, fetchStatus, sendCommand, getActuator };
}
