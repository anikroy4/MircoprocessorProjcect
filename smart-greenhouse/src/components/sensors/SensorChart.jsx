import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { getSensorHistory } from '../../services/api.js';
import { formatChartTime, formatValue } from '../../utils/formatters.js';
import { TIME_RANGES, CHART_COLORS, POLL_INTERVAL } from '../../utils/constants.js';
import { ChartSkeleton } from '../common/LoadingSkeleton.jsx';
import ErrorState from '../common/ErrorState.jsx';

const UNITS = {
  temperature: '°C',
  humidity: '%',
  soil_moisture: '%',
  light: 'LUX',
  air_quality: 'AQI',
};

function CustomTooltip({ active, payload, label, unit, range }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="text-gray-500 text-xs mb-1">{formatChartTime(label, range)}</p>
      <p className="font-semibold text-gray-900">
        {formatValue(payload[0].value)} {unit}
      </p>
    </div>
  );
}

export default function SensorChart({ type, label, color, threshold, defaultRange = '24h' }) {
  const [range, setRange] = useState(defaultRange);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const abortRef = useRef(null);

  const chartColor = color || CHART_COLORS[type] || '#22c55e';
  const unit = UNITS[type] || '';

  const fetchData = useCallback(async (r) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    
    setError(null);
    if (isInitialLoad) setLoading(true); // Only show loading skeleton on first load
    
    try {
      const result = await getSensorHistory(type, r, abortRef.current.signal);
      setData(result);
      setIsInitialLoad(false);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load chart data');
      }
    } finally {
      setLoading(false);
    }
  }, [type, isInitialLoad]); // Dependencies: type and data.length check

  useEffect(() => {
    fetchData(range);
    // Auto-refresh chart data every POLL_INTERVAL
    const interval = setInterval(() => fetchData(range), POLL_INTERVAL);
    
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [type, range, fetchData]); // Added fetchData to dependencies

  const handleRange = (r) => {
    setRange(r);
  };

  if (loading) return <ChartSkeleton height={250} />;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <p className="text-xs text-gray-500">
            {data.length > 0
              ? `${data.length} data points`
              : 'No data in range'}
          </p>
        </div>

        {/* Range selector */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => handleRange(r.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                range === r.value
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r.label.replace('Last ', '')}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => fetchData(range)} compact />
      ) : data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
          No data available for this range
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => formatChartTime(v, range)}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}${unit}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip unit={unit} range={range} />} />
            {threshold !== undefined && (
              <ReferenceLine
                y={threshold}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'Threshold', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: chartColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
