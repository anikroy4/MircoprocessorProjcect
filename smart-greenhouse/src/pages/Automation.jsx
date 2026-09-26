import { useState, useEffect } from 'react';
import { Leaf, Thermometer, Wind, Save, RotateCcw, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import ThresholdCard, { ThresholdInput } from '../components/automation/ThresholdCard.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { useSettings } from '../hooks/useSettings.js';
import { useSensorData } from '../hooks/useSensorData.js';
import { useToast } from '../components/common/Toast.jsx';
import { formatValue } from '../utils/formatters.js';
import { DEFAULT_THRESHOLDS } from '../utils/constants.js';

function AutomationRuleCard({ label, sensorValue, sensorUnit, thresholdLabel, result, isTriggered }) {
  return (
    <div className={`rounded-2xl p-4 border ${
      isTriggered ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{label}</p>
          <p className="text-gray-600 text-xs mt-0.5">
            Current:{' '}
            <span className="font-medium">
              {sensorValue !== null && sensorValue !== undefined
                ? `${formatValue(sensorValue)} ${sensorUnit}`
                : '—'}
            </span>
            {' · '}
            Threshold: <span className="font-medium">{thresholdLabel}</span>
          </p>
        </div>
        <StatusBadge
          status={isTriggered ? 'warning' : 'normal'}
          label={isTriggered ? 'Triggered' : 'OK'}
          size="xs"
        />
      </div>
      {isTriggered && (
        <div className="bg-white/60 rounded-xl px-3 py-2 mt-2">
          <p className="text-xs font-medium text-gray-700">→ {result}</p>
        </div>
      )}
    </div>
  );
}

export default function Automation() {
  const { settings, loading, saving, error: settingsError, fetchSettings, saveSettings } = useSettings();
  const { data: sensors } = useSensorData();
  const { addToast } = useToast();

  const [form, setForm] = useState({ ...DEFAULT_THRESHOLDS });
  const [dirty, setDirty] = useState(false);

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
    addToast({ type: 'info', message: 'Form reset to defaults. Click Save to apply.' });
  };

  // Live trigger logic
  const soilDry  = sensors ? sensors.soil_moisture < form.soil_min : false;
  const tempHigh = sensors ? sensors.temperature   >= form.temperature_high : false;
  const airPoor  = sensors ? sensors.air_quality   >= form.air_quality_threshold : false;

  if (loading) {
    return (
      <Layout title="Automation" subtitle="Configure sensor thresholds and automation rules">
        <div className="max-w-5xl space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="w-40 h-5 bg-gray-100 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-8 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Automation" subtitle="Configure sensor thresholds and automation rules">
      <div className="max-w-5xl space-y-6">
        {settingsError && <ErrorState message={settingsError} onRetry={fetchSettings} compact />}

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3.5">
          <p className="text-blue-800 text-sm font-medium mb-0.5">How Automation Works</p>
          <p className="text-blue-600 text-xs">
            These thresholds are sent to the backend and used by Arduino Mega for local decision-making.
            When a sensor value crosses a threshold, Arduino automatically activates the corresponding actuator.
            Manual overrides from the Device Control page always take precedence in MANUAL mode.
          </p>
        </div>

        {/* Threshold cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Soil Moisture */}
          <ThresholdCard title="Soil Moisture Automation" icon={Leaf} iconBg="bg-emerald-100" iconColor="text-emerald-600">
            <ThresholdInput
              label="Minimum Threshold (Pump ON)"
              value={form.soil_min}
              onChange={(v) => update('soil_min', v)}
              min={0} max={100} unit="%"
              description="Water pump turns ON automatically when soil moisture drops below this."
            />
            <ThresholdInput
              label="Maximum Threshold (Pump OFF)"
              value={form.soil_max}
              onChange={(v) => update('soil_max', v)}
              min={0} max={100} unit="%"
              description="Water pump turns OFF automatically when soil moisture exceeds this."
            />
          </ThresholdCard>

          {/* Temperature */}
          <ThresholdCard title="Temperature Automation" icon={Thermometer} iconBg="bg-red-100" iconColor="text-red-500">
            <ThresholdInput
              label="Cooling ON Above"
              value={form.temperature_high}
              onChange={(v) => update('temperature_high', v)}
              min={0} max={60} unit="°C"
              description="Cooling fan activates when temperature exceeds this value."
            />
            <ThresholdInput
              label="Cooling OFF Below"
              value={form.temperature_low}
              onChange={(v) => update('temperature_low', v)}
              min={0} max={60} unit="°C"
              description="Cooling fan deactivates when temperature falls below this value."
            />
          </ThresholdCard>

          {/* Air Quality */}
          <ThresholdCard title="Air Quality Automation" icon={Wind} iconBg="bg-gray-100" iconColor="text-gray-600">
            <ThresholdInput
              label="Ventilation Threshold"
              value={form.air_quality_threshold}
              onChange={(v) => update('air_quality_threshold', v)}
              min={0} max={200} unit="AQI"
              description="Ventilation fan turns ON when air quality index exceeds this value."
            />
          </ThresholdCard>
        </div>

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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Reset Defaults
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

        {/* Live Automation Status */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Current Automation Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AutomationRuleCard
              label="Water Pump Automation"
              sensorValue={sensors?.soil_moisture}
              sensorUnit="%"
              thresholdLabel={`< ${form.soil_min}% → ON, > ${form.soil_max}% → OFF`}
              result="Water Pump automatically ON — soil too dry"
              isTriggered={soilDry}
            />
            <AutomationRuleCard
              label="Cooling Fan Automation"
              sensorValue={sensors?.temperature}
              sensorUnit="°C"
              thresholdLabel={`≥ ${form.temperature_high}°C → ON`}
              result={`Cooling Fan automatically ON — temperature high (${formatValue(sensors?.temperature)}°C)`}
              isTriggered={tempHigh}
            />
            <AutomationRuleCard
              label="Ventilation Fan Automation"
              sensorValue={sensors?.air_quality}
              sensorUnit="AQI"
              thresholdLabel={`≥ ${form.air_quality_threshold} → ON`}
              result={`Ventilation Fan automatically ON — poor air quality (${formatValue(sensors?.air_quality)} AQI)`}
              isTriggered={airPoor}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
}
