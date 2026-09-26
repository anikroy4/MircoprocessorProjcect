import { useState, useEffect, useCallback, useRef } from 'react';
import { getSettings, updateSettings } from '../services/api.js';
import { DEFAULT_THRESHOLDS, POLL_INTERVAL } from '../utils/constants.js';

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_THRESHOLDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchSettings = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    
    try {
      const result = await getSettings(abortRef.current.signal);
      setSettings(result);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings) => {
    setSaving(true);
    try {
      const result = await updateSettings(newSettings);
      setSettings(result.settings || newSettings);
      setError(null);
      // Immediately refetch to confirm
      await fetchSettings();
      return result;
    } catch (err) {
      setError(err.message || 'Failed to save settings');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
    // Auto-refresh settings every POLL_INTERVAL to detect changes from other sources
    const interval = setInterval(fetchSettings, POLL_INTERVAL * 3); // Less frequent than sensors
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchSettings]);

  return { settings, loading, saving, error, fetchSettings, saveSettings };
}
