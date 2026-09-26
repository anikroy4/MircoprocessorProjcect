import { useState, useEffect } from 'react';
import { Save, RotateCcw, Loader2, Info } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useSettings } from '../hooks/useSettings.js';
import { useToast } from '../components/common/Toast.jsx';
import { DEFAULT_THRESHOLDS } from '../utils/constants.js';
import { formatTimestamp } from '../utils/formatters.js';

function Section({ title, description, children }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { settings, loading, saving, error, fetchSettings, saveSettings } = useSettings();
  const { addToast } = useToast();

  const [form, setForm] = useState({ ...DEFAULT_THRESHOLDS });
  const [dirty, setDirty] = useState(false);
  const [apiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');
  const [useMock] = useState(import.meta.env.VITE_USE_MOCK_DATA === 'true');
  const [pollInterval] = useState(import.meta.env.VITE_POLL_INTERVAL || '5000');

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
      setDirty(false);
    }
  }, [settings]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await saveSettings(form);
      setDirty(false);
      addToast({ type: 'success', title: 'Settings Saved', message: 'Automation thresholds updated successfully.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message || 'Could not save settings.' });
    }
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_THRESHOLDS });
    setDirty(true);
  };

  if (loading) {
    return (
      <Layout title="Settings" subtitle="System configuration and thresholds">
        <div className="max-w-3xl space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-40" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings" subtitle="System configuration and automation thresholds">
      <div className="max-w-3xl space-y-5">
        {error && <ErrorState message={error} onRetry={fetchSettings} compact />}

        {/* Connection Settings (read-only display) */}
        <Section title="API Connection" description="Backend API and data source configuration">
          <SettingRow label="API Base URL" description="Configured via VITE_API_BASE_URL environment variable">
            <span className="font-mono text-xs bg-gray-100 px-2.5 py-1.5 rounded-lg text-gray-700">
              {apiUrl}
            </span>
          </SettingRow>
          <SettingRow label="Data Mode" description="Toggle between mock data and real API">
            <span className={`text-xs font-medium px-2.5 py-1.5 rounded-full border ${
              useMock
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              {useMock ? '⚠ Mock Data (Development)' : '✓ Live API (Production)'}
            </span>
          </SettingRow>
          <SettingRow label="Poll Interval" description="How often the dashboard fetches new sensor/actuator data">
            <span className="font-mono text-xs bg-gray-100 px-2.5 py-1.5 rounded-lg text-gray-700">
              {parseInt(pollInterval) / 1000}s
            </span>
          </SettingRow>
        </Section>

        {/* Automation Thresholds */}
        <Section title="Automation Thresholds" description="These values control when actuators activate automatically">
          <div className="space-y-4">
            {[
              { key: 'soil_min',              label: 'Soil Moisture Minimum',    unit: '%',   min: 0,   max: 100, desc: 'Pump turns ON below this' },
              { key: 'soil_max',              label: 'Soil Moisture Maximum',    unit: '%',   min: 0,   max: 100, desc: 'Pump turns OFF above this' },
              { key: 'temperature_high',      label: 'Temperature High Threshold', unit: '°C', min: 0,  max: 60,  desc: 'Cooling fan activates' },
              { key: 'temperature_low',       label: 'Temperature Low Threshold',  unit: '°C', min: 0,  max: 60,  desc: 'Cooling fan deactivates' },
              { key: 'air_quality_threshold', label: 'Air Quality Threshold',    unit: 'AQI', min: 0,   max: 200, desc: 'Ventilation fan activates' },
            ].map(({ key, label, unit, min, max, desc }) => (
              <SettingRow key={key} label={label} description={desc}>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form[key] ?? ''}
                    onChange={(e) => update(key, Number(e.target.value))}
                    min={min}
                    max={max}
                    className="w-20 text-right text-sm font-semibold border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-500 w-8">{unit}</span>
                </div>
              </SettingRow>
            ))}
          </div>
        </Section>

        {/* Last saved info */}
        {settings?.updated_at && (
          <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
            <Info size={12} />
            <span>Last saved: {formatTimestamp(settings.updated_at)}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div>
            {dirty && (
              <span className="text-amber-600 text-xs font-medium bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* About / Project Info */}
        <Section title="About This Project" description="CSE 4326 — Microprocessors & Microcontrollers Laboratory">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span>Project</span>
              <span className="font-medium text-gray-800">IoT-Based Smart Greenhouse</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span>Course</span>
              <span className="font-medium text-gray-800">CSE 4326 Lab</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span>Hardware</span>
              <span className="font-medium text-gray-800">Arduino Mega + ESP8266</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span>Frontend</span>
              <span className="font-medium text-gray-800">React + Vite + Tailwind</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Version</span>
              <span className="font-medium text-gray-800">1.0.0</span>
            </div>
          </div>
        </Section>
      </div>
    </Layout>
  );
}
