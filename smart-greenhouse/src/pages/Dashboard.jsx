import { Link } from 'react-router-dom';
import {
  Thermometer, Droplets, Leaf, Wind,
  Cpu, Wifi, ArrowRight, Zap
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import SensorCard from '../components/sensors/SensorCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { DataUpdateIndicator } from '../components/common/LiveIndicator.jsx';
import { useSensorData } from '../hooks/useSensorData.js';
import { useActuatorStatus } from '../hooks/useActuatorStatus.js';
import { useSystemStatus } from '../hooks/useSystemStatus.js';
import { useSettings } from '../hooks/useSettings.js';
import {
  formatValue, formatRelativeTime,
  getTemperatureStatus, getHumidityStatus, getSoilStatus,
  getSoilLabel, getAirQualityStatus, getAirQualityLabel,
} from '../utils/formatters.js';
import { DEVICE_LABELS } from '../utils/constants.js';

function SystemInfoBar({ status, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex gap-4 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-100 rounded" />
              <div className="w-24 h-4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = [
    { label: 'System',       status: status?.backend_status  || 'offline',       Icon: Zap },
    { label: 'ESP8266',      status: status?.esp8266_status  || 'disconnected',   Icon: Wifi },
    { label: 'Arduino Mega', status: status?.arduino_status  || 'disconnected',   Icon: Cpu },
    { label: 'Database',     status: status?.database_status || 'disconnected',   Icon: null },
  ];

  return (
    <div className="bg-white rounded-2xl px-5 py-3.5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-5 flex-wrap">
        {items.map(({ label, status: s, Icon }) => (
          <div key={label} className="flex items-center gap-2">
            {Icon && (
              <Icon size={14} className={
                s === 'connected' || s === 'online'
                  ? 'text-green-500'
                  : s === 'disconnected' || s === 'offline'
                  ? 'text-red-400'
                  : 'text-yellow-500'
              } />
            )}
            <span className="text-sm text-gray-600">{label}:</span>
            <StatusBadge
              status={s === 'connected' || s === 'online' ? 'online' : 'offline'}
              label={s}
              size="xs"
              dot
            />
          </div>
        ))}
        {status?.last_update && (
          <div className="ml-auto text-xs text-gray-400 hidden md:block">
            Last update: {formatRelativeTime(status.last_update)}
          </div>
        )}
      </div>
    </div>
  );
}

function AutomationStatusCard({ sensors, settings }) {
  if (!sensors || !settings) return null;

  const soilDry  = sensors.soil_moisture < settings.soil_min;
  const tempHigh = sensors.temperature   >= settings.temperature_high;
  const airPoor  = sensors.air_quality   >= settings.air_quality_threshold;

  const alerts = [
    soilDry && {
      label:  `Soil Moisture ${formatValue(sensors.soil_moisture)}%`,
      detail: `Below threshold (${settings.soil_min}%)`,
      result: 'Water Pump → AUTO ON',
      type:   'warning',
    },
    tempHigh && {
      label:  `Temperature ${formatValue(sensors.temperature)}°C`,
      detail: `Above threshold (${settings.temperature_high}°C)`,
      result: 'Cooling Fan → AUTO ON',
      type:   'critical',
    },
    airPoor && {
      label:  `Air Quality ${formatValue(sensors.air_quality)} AQI`,
      detail: `Above threshold (${settings.air_quality_threshold})`,
      result: 'Ventilation Fan → AUTO ON',
      type:   'critical',
    },
  ].filter(Boolean);

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <Leaf size={16} className="text-green-600" />
        </div>
        <div>
          <p className="text-green-800 font-medium text-sm">All parameters within normal range</p>
          <p className="text-green-600 text-xs">No automation actions triggered</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {alerts.map((alert, i) => (
        <div key={i} className={`rounded-xl p-4 border ${
          alert.type === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`font-semibold text-sm mb-0.5 ${
            alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
          }`}>
            ⚠ {alert.label}
          </p>
          <p className={`text-xs mb-1 ${
            alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {alert.detail}
          </p>
          <p className={`text-xs font-medium ${
            alert.type === 'critical' ? 'text-red-700' : 'text-yellow-700'
          }`}>
            → {alert.result}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: sensors, loading: sLoading, error: sError, lastUpdated, refetch } = useSensorData();
  const { actuators, loading: aLoading } = useActuatorStatus();
  const { status, loading: statusLoading } = useSystemStatus();
  const { settings } = useSettings();

  const sensorCards = [
    {
      key:         'temperature',
      label:       'Temperature',
      icon:        Thermometer,
      iconBg:      'bg-red-100',
      iconColor:   'text-red-500',
      value:       formatValue(sensors?.temperature),
      unit:        '°C',
      status:      getTemperatureStatus(sensors?.temperature, settings),
      statusLabel:
        getTemperatureStatus(sensors?.temperature, settings) === 'critical' ? 'High'
        : getTemperatureStatus(sensors?.temperature, settings) === 'warning' ? 'Warm'
        : 'Normal',
    },
    {
      key:         'humidity',
      label:       'Humidity',
      icon:        Droplets,
      iconBg:      'bg-blue-100',
      iconColor:   'text-blue-500',
      value:       formatValue(sensors?.humidity),
      unit:        '%',
      status:      getHumidityStatus(sensors?.humidity),
      statusLabel: getHumidityStatus(sensors?.humidity) === 'warning' ? 'Check' : 'Normal',
    },
    {
      key:         'soil_moisture',
      label:       'Soil Moisture',
      icon:        Leaf,
      iconBg:      'bg-emerald-100',
      iconColor:   'text-emerald-600',
      value:       formatValue(sensors?.soil_moisture),
      unit:        '%',
      status:
        getSoilStatus(sensors?.soil_moisture, settings) === 'dry'  ? 'warning'
        : getSoilStatus(sensors?.soil_moisture, settings) === 'wet' ? 'wet'
        : 'normal',
      statusLabel: getSoilLabel(sensors?.soil_moisture, settings),
    },
    {
      key:         'air_quality',
      label:       'Air Quality',
      icon:        Wind,
      iconBg:      'bg-gray-100',
      iconColor:   'text-gray-600',
      value:       formatValue(sensors?.air_quality),
      unit:        'AQI',
      status:
        getAirQualityStatus(sensors?.air_quality, settings?.air_quality_threshold) === 'critical' ? 'critical'
        : getAirQualityStatus(sensors?.air_quality, settings?.air_quality_threshold) === 'warning' ? 'warning'
        : 'normal',
      statusLabel: getAirQualityLabel(sensors?.air_quality, settings?.air_quality_threshold),
    },
  ];

  return (
    <Layout title="Smart Greenhouse" subtitle="Real-time monitoring & automation">
      <div className="space-y-6 max-w-7xl">
        {/* System Status Bar */}
        <SystemInfoBar status={status} loading={statusLoading} />

        {/* Sensor Error */}
        {sError && <ErrorState message={sError} onRetry={refetch} compact />}

        {/* Sensor Cards */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-gray-800 font-semibold">Live Sensor Readings</h2>
              <DataUpdateIndicator 
                lastUpdated={lastUpdated} 
                isLive={!sLoading && !sError}
                label="Live"
              />
            </div>
            <Link to="/monitoring" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
              View charts <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sensorCards.map((card) => (
              <SensorCard
                key={card.key}
                icon={card.icon}
                label={card.label}
                value={card.value}
                unit={card.unit}
                status={card.status}
                statusLabel={card.statusLabel}
                iconBg={card.iconBg}
                iconColor={card.iconColor}
                lastUpdated={lastUpdated}
                loading={sLoading}
              />
            ))}
          </div>
        </div>

        {/* Bottom two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actuator Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Actuator Status</h2>
              <Link to="/control" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                Control <ArrowRight size={14} />
              </Link>
            </div>
            {aLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {actuators
                  .filter((a) => a.device !== 'shade_motor')
                  .map((act) => (
                    <div key={act.device} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                      act.status === 'ON' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <span className="text-sm font-medium text-gray-800">
                        {DEVICE_LABELS[act.device] || act.device}
                      </span>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          status={act.mode === 'AUTO' ? 'auto' : 'manual'}
                          label={act.mode}
                          size="xs"
                          dot={false}
                        />
                        <StatusBadge
                          status={act.status === 'ON' ? 'on' : 'off'}
                          label={act.status}
                          size="xs"
                        />
                      </div>
                    </div>
                  ))}
                {actuators.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">No actuator data available</p>
                )}
              </div>
            )}
          </div>

          {/* Automation Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Automation Status</h2>
              <Link to="/automation" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                Configure <ArrowRight size={14} />
              </Link>
            </div>
            {sLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <AutomationStatusCard sensors={sensors} settings={settings} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
