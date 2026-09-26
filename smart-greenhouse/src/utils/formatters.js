/**
 * Format a timestamp for display
 */
export function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (isNaN(d)) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Format a timestamp as relative time (e.g., "2 min ago")
 */
export function formatRelativeTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (isNaN(d)) return '—';
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Format chart X-axis timestamps
 */
export function formatChartTime(ts, range) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return '';
  if (range === '7d') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Format a number to fixed decimal places
 */
export function formatValue(val, decimals = 1) {
  if (val === null || val === undefined) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return n.toFixed(decimals);
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format device name from snake_case
 */
export function formatDeviceName(device) {
  if (!device) return '';
  return device.split('_').map(capitalize).join(' ');
}

/**
 * Get temperature status based on thresholds
 */
export function getTemperatureStatus(value, settings) {
  if (value === null || value === undefined) return 'inactive';
  const high = settings?.temperature_high ?? 35;
  const low = settings?.temperature_low ?? 30;
  if (value >= high) return 'critical';
  if (value >= low) return 'warning';
  return 'normal';
}

/**
 * Get humidity status
 */
export function getHumidityStatus(value) {
  if (value === null || value === undefined) return 'inactive';
  if (value < 30 || value > 90) return 'warning';
  return 'normal';
}

/**
 * Get soil moisture status
 */
export function getSoilStatus(value, settings) {
  if (value === null || value === undefined) return 'inactive';
  const min = settings?.soil_min ?? 30;
  const max = settings?.soil_max ?? 70;
  if (value < min) return 'dry';
  if (value > max) return 'wet';
  return 'normal';
}

/**
 * Get air quality status
 */
export function getAirQualityStatus(value, threshold) {
  if (value === null || value === undefined) return 'inactive';
  const thr = threshold ?? 70;
  if (value >= thr) return 'critical';
  if (value >= thr * 0.7) return 'warning';
  return 'normal';
}

/**
 * Get light status based on threshold
 */
export function getLightStatus(value, settings) {
  if (value === null || value === undefined) return 'inactive';
  const threshold = settings?.light_threshold ?? 800;
  if (value > threshold * 1.2) return 'warning';
  return 'normal';
}

/**
 * Soil status label
 */
export function getSoilLabel(value, settings) {
  const status = getSoilStatus(value, settings);
  const map = { dry: 'Dry', normal: 'Normal', wet: 'Wet', inactive: 'N/A' };
  return map[status] || 'N/A';
}

/**
 * Air quality label
 */
export function getAirQualityLabel(value, threshold) {
  const status = getAirQualityStatus(value, threshold);
  const map = { normal: 'Good', warning: 'Moderate', critical: 'Poor', inactive: 'N/A' };
  return map[status] || 'N/A';
}

/**
 * Status badge color helper
 */
export function getStatusBadgeClass(status) {
  const map = {
    normal: 'bg-green-100 text-green-700 border border-green-200',
    good: 'bg-green-100 text-green-700 border border-green-200',
    online: 'bg-green-100 text-green-700 border border-green-200',
    connected: 'bg-green-100 text-green-700 border border-green-200',
    on: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    moderate: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    dry: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    wet: 'bg-blue-100 text-blue-700 border border-blue-200',
    critical: 'bg-red-100 text-red-700 border border-red-200',
    poor: 'bg-red-100 text-red-700 border border-red-200',
    offline: 'bg-red-100 text-red-700 border border-red-200',
    disconnected: 'bg-red-100 text-red-700 border border-red-200',
    off: 'bg-gray-100 text-gray-600 border border-gray-200',
    inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
    auto: 'bg-blue-100 text-blue-700 border border-blue-200',
    manual: 'bg-purple-100 text-purple-700 border border-purple-200',
  };
  return map[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-500 border border-gray-200';
}
