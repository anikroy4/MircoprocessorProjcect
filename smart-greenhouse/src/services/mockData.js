/**
 * Mock data layer — only used when VITE_USE_MOCK_DATA=true
 * Replace with real API calls by setting VITE_USE_MOCK_DATA=false
 */

// Simulate network delay
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// Simulate occasional failures for realistic UX testing
let callCount = 0;

function makeTimeSeries(points, rangeKey, baseValue, variance, decimalPlaces = 1) {
  const now = Date.now();
  const rangeMs = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
    '7d': 604800000,
  }[rangeKey] || 86400000;

  const step = rangeMs / points;

  return Array.from({ length: points }, (_, i) => {
    const t = now - rangeMs + i * step;
    const noise = (Math.random() - 0.5) * variance;
    const trend = Math.sin(i / (points / 4)) * (variance / 4);
    const val = Math.max(0, parseFloat((baseValue + noise + trend).toFixed(decimalPlaces)));
    return {
      timestamp: new Date(t).toISOString(),
      value: val,
    };
  });
}

// ─── Latest Sensor Data ─────────────────────────────────────────────────────
export async function mockGetLatestSensors() {
  await delay(200);
  return {
    id: Date.now(),
    temperature: parseFloat((27.4 + (Math.random() - 0.5) * 2).toFixed(1)),
    humidity: parseFloat((62.3 + (Math.random() - 0.5) * 5).toFixed(1)),
    soil_moisture: parseFloat((45.0 + (Math.random() - 0.5) * 8).toFixed(1)),
    light: parseFloat((650 + (Math.random() - 0.5) * 200).toFixed(0)),
    air_quality: parseFloat((38.0 + (Math.random() - 0.5) * 10).toFixed(1)),
    created_at: new Date().toISOString(),
  };
}

// ─── Sensor History ──────────────────────────────────────────────────────────
export async function mockGetSensorHistory(type, range) {
  await delay(400);
  const points = range === '7d' ? 56 : range === '24h' ? 48 : range === '6h' ? 36 : 24;

  const configs = {
    temperature: { base: 27.5, variance: 6 },
    humidity: { base: 62, variance: 14 },
    soil_moisture: { base: 45, variance: 18 },
    light: { base: 600, variance: 400, dec: 0 },
    air_quality: { base: 38, variance: 20 },
  };

  const cfg = configs[type] || { base: 50, variance: 10 };
  return makeTimeSeries(points, range, cfg.base, cfg.variance, cfg.dec ?? 1);
}

// ─── Actuator Status ─────────────────────────────────────────────────────────
let actuatorState = {
  water_pump: { device: 'water_pump', status: 'OFF', mode: 'AUTO', value: null, updated_at: new Date().toISOString() },
  cooling_fan: { device: 'cooling_fan', status: 'OFF', mode: 'AUTO', value: null, updated_at: new Date().toISOString() },
  ventilation_fan: { device: 'ventilation_fan', status: 'OFF', mode: 'AUTO', value: null, updated_at: new Date().toISOString() },
  shade_motor: { device: 'shade_motor', status: 'OFF', mode: 'AUTO', value: 45, updated_at: new Date().toISOString() },
};

export async function mockGetActuatorStatus() {
  await delay(200);
  return Object.values(actuatorState).map((a) => ({ ...a }));
}

export async function mockControlActuator(device, action, mode, value) {
  await delay(500);
  if (!actuatorState[device]) throw new Error(`Unknown device: ${device}`);

  actuatorState[device] = {
    ...actuatorState[device],
    status: action === 'SET_POSITION' ? (value > 0 ? 'ON' : 'OFF') : action,
    mode: mode || 'MANUAL',
    value: value ?? actuatorState[device].value,
    updated_at: new Date().toISOString(),
  };

  return {
    success: true,
    message: `${device} ${action} command executed successfully.`,
    device: actuatorState[device],
  };
}

// ─── Automation Settings ─────────────────────────────────────────────────────
let automationSettings = {
  id: 1,
  soil_min: 30,
  soil_max: 70,
  temperature_high: 35,
  temperature_low: 30,
  light_threshold: 800,
  air_quality_threshold: 70,
  updated_at: new Date().toISOString(),
};

export async function mockGetSettings() {
  await delay(200);
  return { ...automationSettings };
}

export async function mockUpdateSettings(settings) {
  await delay(300);
  automationSettings = { ...automationSettings, ...settings, updated_at: new Date().toISOString() };
  return { success: true, settings: { ...automationSettings } };
}

// ─── System Status ────────────────────────────────────────────────────────────
export async function mockGetSystemStatus() {
  await delay(300);
  return {
    id: 1,
    arduino_status: 'connected',
    esp8266_status: 'connected',
    wifi_status: 'connected',
    backend_status: 'online',
    database_status: 'connected',
    esp8266_ip: '192.168.1.45',
    wifi_signal: -62,
    last_sensor_update: new Date(Date.now() - 4000).toISOString(),
    last_actuator_update: new Date(Date.now() - 12000).toISOString(),
    last_update: new Date().toISOString(),
  };
}

// ─── Actuator History ────────────────────────────────────────────────────────
const devices = ['water_pump', 'cooling_fan', 'ventilation_fan', 'shade_motor'];
const actions = ['ON', 'OFF', 'SET_POSITION'];
const modes = ['AUTO', 'MANUAL'];
const statuses = ['success', 'success', 'success', 'failed'];

function generateActuatorLogs(count = 50) {
  return Array.from({ length: count }, (_, i) => ({
    id: count - i,
    device: devices[Math.floor(Math.random() * devices.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    mode: modes[Math.floor(Math.random() * modes.length)],
    value: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : null,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    created_at: new Date(Date.now() - i * 180000).toISOString(),
  }));
}

const actuatorLogs = generateActuatorLogs(80);

export async function mockGetActuatorHistory({ page = 1, pageSize = 15, device = '', dateFrom = '', dateTo = '' } = {}) {
  await delay(400);
  let filtered = [...actuatorLogs];
  if (device) filtered = filtered.filter((l) => l.device === device);
  if (dateFrom) filtered = filtered.filter((l) => new Date(l.created_at) >= new Date(dateFrom));
  if (dateTo) filtered = filtered.filter((l) => new Date(l.created_at) <= new Date(dateTo));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return { data: filtered.slice(start, start + pageSize), total, page, pageSize };
}

// ─── Sensor History Table ────────────────────────────────────────────────────
function generateSensorReadings(count = 100) {
  return Array.from({ length: count }, (_, i) => ({
    id: count - i,
    temperature: parseFloat((27.5 + (Math.random() - 0.5) * 6).toFixed(1)),
    humidity: parseFloat((62 + (Math.random() - 0.5) * 14).toFixed(1)),
    soil_moisture: parseFloat((45 + (Math.random() - 0.5) * 18).toFixed(1)),
    light: parseFloat((600 + (Math.random() - 0.5) * 400).toFixed(0)),
    air_quality: parseFloat((38 + (Math.random() - 0.5) * 20).toFixed(1)),
    created_at: new Date(Date.now() - i * 300000).toISOString(),
  }));
}

const sensorReadings = generateSensorReadings(120);

export async function mockGetSensorReadings({ page = 1, pageSize = 15, dateFrom = '', dateTo = '' } = {}) {
  await delay(400);
  let filtered = [...sensorReadings];
  if (dateFrom) filtered = filtered.filter((r) => new Date(r.created_at) >= new Date(dateFrom));
  if (dateTo) filtered = filtered.filter((r) => new Date(r.created_at) <= new Date(dateTo));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return { data: filtered.slice(start, start + pageSize), total, page, pageSize };
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export async function mockGetAnalytics(range) {
  await delay(400);
  const multiplier = range === '30d' ? 30 : range === '7d' ? 7 : 1;
  return {
    temperature: { avg: 27.4, max: 36.2, min: 21.8 },
    humidity: { avg: 62.1, max: 88.5, min: 41.2 },
    soil_moisture: { avg: 44.8, max: 78.3, min: 18.6 },
    light: { avg: 612, max: 1240, min: 42 },
    air_quality: { avg: 38.2, max: 74.5, min: 12.1 },
    actuator_runtime: {
      water_pump: parseFloat((2.4 * multiplier).toFixed(1)),
      cooling_fan: parseFloat((5.8 * multiplier).toFixed(1)),
      ventilation_fan: parseFloat((8.2 * multiplier).toFixed(1)),
    },
    range,
  };
}
