import { Thermometer, Droplets, Leaf, Wind } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import SensorChart from '../components/sensors/SensorChart.jsx';
import SensorCard from '../components/sensors/SensorCard.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { DataUpdateIndicator } from '../components/common/LiveIndicator.jsx';
import { useSensorData } from '../hooks/useSensorData.js';
import { useSettings } from '../hooks/useSettings.js';
import {
  formatValue,
  getTemperatureStatus, getHumidityStatus, getSoilStatus,
  getSoilLabel, getAirQualityStatus, getAirQualityLabel,
} from '../utils/formatters.js';
import { CHART_COLORS } from '../utils/constants.js';

export default function LiveMonitoring() {
  const { data: sensors, loading, error, lastUpdated, refetch } = useSensorData();
  const { settings } = useSettings();

  const cards = [
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
    <Layout title="Live Monitoring" subtitle="Real-time sensor readings & historical trends">
      <div className="space-y-6 max-w-7xl">
        {error && <ErrorState message={error} onRetry={refetch} compact />}

        {/* Live Sensor Cards */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-gray-800 font-semibold">Current Readings</h2>
            <DataUpdateIndicator 
              lastUpdated={lastUpdated} 
              isLive={!loading && !error}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
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
                loading={loading}
              />
            ))}
          </div>
        </section>

        {/* Charts */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-gray-800 font-semibold">Sensor History Charts</h2>
            <DataUpdateIndicator 
              isLive={!loading && !error}
              label="Auto-refresh"
            />
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Select a time range on each chart to view historical data. Charts auto-refresh every 3 seconds.
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <SensorChart
              type="temperature"
              label="Temperature (°C)"
              color={CHART_COLORS.temperature}
              threshold={settings?.temperature_high}
            />
            <SensorChart
              type="humidity"
              label="Humidity (%)"
              color={CHART_COLORS.humidity}
            />
            <SensorChart
              type="soil_moisture"
              label="Soil Moisture (%)"
              color={CHART_COLORS.soil_moisture}
              threshold={settings?.soil_min}
            />
            <SensorChart
              type="air_quality"
              label="Air Quality (AQI)"
              color={CHART_COLORS.air_quality}
              threshold={settings?.air_quality_threshold}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
}
