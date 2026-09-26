import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Leaf, Wind, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import Layout from '../components/layout/Layout.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { getAnalytics } from '../services/api.js';
import { formatValue } from '../utils/formatters.js';
import { ANALYTICS_RANGES, CHART_COLORS } from '../utils/constants.js';

function StatCard({ icon: Icon, label, value, unit, sub, iconBg, iconColor, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
        <div className="w-20 h-7 bg-gray-100 rounded mb-2" />
        <div className="w-24 h-4 bg-gray-100 rounded" />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
        {Icon && <Icon size={18} className={iconColor} />}
      </div>
      <div className="flex items-end gap-1 mb-1">
        <span className="text-2xl font-bold text-gray-900">{value ?? '—'}</span>
        {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
      </div>
      <p className="text-gray-600 text-sm">{label}</p>
      {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function RuntimeCard({ device, hours, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
        <div className="w-24 h-4 bg-gray-100 rounded mb-2" />
        <div className="w-16 h-6 bg-gray-100 rounded" />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={13} className="text-gray-400" />
        <span className="text-xs text-gray-500 uppercase tracking-wide">{device}</span>
      </div>
      <p className="text-xl font-bold text-gray-900">
        {hours ?? '—'}<span className="text-sm font-normal text-gray-500 ml-1">hrs</span>
      </p>
    </div>
  );
}

export default function Analytics() {
  const [range, setRange]     = useState('today');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = async (r) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalytics(r);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(range); }, [range]);

  const sensorAvgData = data
    ? [
        { name: 'Temp (°C)',    value: data.temperature?.avg,   fill: CHART_COLORS.temperature },
        { name: 'Humidity (%)', value: data.humidity?.avg,      fill: CHART_COLORS.humidity },
        { name: 'Soil (%)',     value: data.soil_moisture?.avg, fill: CHART_COLORS.soil_moisture },
        { name: 'AQI',          value: data.air_quality?.avg,   fill: CHART_COLORS.air_quality },
      ]
    : [];

  return (
    <Layout title="Analytics" subtitle="Aggregated sensor and actuator statistics">
      <div className="space-y-6 max-w-6xl">
        {/* Range selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Time Range:</span>
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {ANALYTICS_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  range === r.value
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={() => fetchData(range)} compact />}

        {/* Temperature */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Temperature</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard icon={Thermometer} label="Average Temperature" value={formatValue(data?.temperature?.avg)} unit="°C"
              iconBg="bg-red-100" iconColor="text-red-500" loading={loading} />
            <StatCard icon={Thermometer} label="Maximum Temperature" value={formatValue(data?.temperature?.max)} unit="°C"
              sub="Peak reading" iconBg="bg-red-50" iconColor="text-red-400" loading={loading} />
            <StatCard icon={Thermometer} label="Minimum Temperature" value={formatValue(data?.temperature?.min)} unit="°C"
              sub="Lowest reading" iconBg="bg-blue-50" iconColor="text-blue-400" loading={loading} />
          </div>
        </section>

        {/* Humidity & Soil */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Humidity & Soil</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <StatCard icon={Droplets} label="Average Humidity" value={formatValue(data?.humidity?.avg)} unit="%"
              iconBg="bg-blue-100" iconColor="text-blue-500" loading={loading} />
            <StatCard icon={Leaf} label="Average Soil Moisture" value={formatValue(data?.soil_moisture?.avg)} unit="%"
              iconBg="bg-emerald-100" iconColor="text-emerald-600" loading={loading} />
          </div>
        </section>

        {/* Air Quality */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Air Quality</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard icon={Wind} label="Average AQI" value={formatValue(data?.air_quality?.avg)} unit="AQI"
              iconBg="bg-gray-100" iconColor="text-gray-600" loading={loading} />
            <StatCard icon={Wind} label="Maximum AQI" value={formatValue(data?.air_quality?.max)} unit="AQI"
              sub="Peak reading" iconBg="bg-gray-50" iconColor="text-gray-500" loading={loading} />
            <StatCard icon={Wind} label="Minimum AQI" value={formatValue(data?.air_quality?.min)} unit="AQI"
              sub="Best reading" iconBg="bg-green-50" iconColor="text-green-500" loading={loading} />
          </div>
        </section>

        {/* Bar chart overview */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Sensor Averages Overview</h2>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {loading ? (
              <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sensorAvgData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [formatValue(v), 'Average']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {sensorAvgData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Actuator Runtime */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Actuator Runtime</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RuntimeCard device="Water Pump"      hours={data?.actuator_runtime?.water_pump}      loading={loading} />
            <RuntimeCard device="Cooling Fan"     hours={data?.actuator_runtime?.cooling_fan}     loading={loading} />
            <RuntimeCard device="Ventilation Fan" hours={data?.actuator_runtime?.ventilation_fan} loading={loading} />
          </div>
        </section>
      </div>
    </Layout>
  );
}
