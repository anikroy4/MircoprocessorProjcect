/**
 * API Service Layer
 * All HTTP calls are centralized here.
 * Toggle VITE_USE_MOCK_DATA=false to use real backend.
 */

import {
  mockGetLatestSensors,
  mockGetSensorHistory,
  mockGetActuatorStatus,
  mockControlActuator,
  mockGetSettings,
  mockUpdateSettings,
  mockGetSystemStatus,
  mockGetActuatorHistory,
  mockGetSensorReadings,
  mockGetAnalytics,
} from './mockData.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// ─── HTTP helper ─────────────────────────────────────────────────────────────
async function request(method, path, body = null, signal = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (signal) options.signal = signal;
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    let msg = `Server error: ${res.status}`;
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  return res.json();
}

// ─── Sensors ─────────────────────────────────────────────────────────────────

/**
 * GET /api/sensors/latest
 * Returns: { id, temperature, humidity, soil_moisture, light, air_quality, created_at }
 */
export async function getLatestSensors(signal) {
  if (USE_MOCK) return mockGetLatestSensors();
  return request('GET', '/sensors/latest', null, signal);
}

/**
 * GET /api/sensors/history?type=temperature&range=24h
 * Returns: Array<{ timestamp, value }>
 */
export async function getSensorHistory(type, range = '24h', signal) {
  if (USE_MOCK) return mockGetSensorHistory(type, range);
  return request('GET', `/sensors/history?type=${type}&range=${range}`, null, signal);
}

/**
 * GET /api/sensors/readings — paginated table data
 * Returns: { data, total, page, pageSize }
 */
export async function getSensorReadings({ page = 1, pageSize = 15, dateFrom = '', dateTo = '' } = {}, signal) {
  if (USE_MOCK) return mockGetSensorReadings({ page, pageSize, dateFrom, dateTo });
  const params = new URLSearchParams({ page, pageSize });
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);
  return request('GET', `/sensors/readings?${params}`, null, signal);
}

/**
 * DELETE /api/sensors/:id — delete single sensor reading
 */
export async function deleteSensorReading(id) {
  return request('DELETE', `/sensors/${id}`);
}

/**
 * DELETE /api/sensors — bulk delete sensor readings
 * Body: { ids: [1, 2, 3] }
 */
export async function bulkDeleteSensorReadings(ids) {
  return request('DELETE', '/sensors', { ids });
}

// ─── Actuators ───────────────────────────────────────────────────────────────

/**
 * GET /api/actuators/status
 * Returns: Array<{ device, status, mode, value, updated_at }>
 */
export async function getActuatorStatus(signal) {
  if (USE_MOCK) return mockGetActuatorStatus();
  return request('GET', '/actuators/status', null, signal);
}

/**
 * POST /api/actuators/control
 * Body: { device, action, mode, value? }
 */
export async function controlActuator(device, action, mode = 'MANUAL', value = null) {
  if (USE_MOCK) return mockControlActuator(device, action, mode, value);
  return request('POST', '/actuators/control', { device, action, mode, ...(value !== null && { value }) });
}

/**
 * GET /api/actuators/history — paginated
 */
export async function getActuatorHistory({ page = 1, pageSize = 15, device = '', dateFrom = '', dateTo = '' } = {}, signal) {
  if (USE_MOCK) return mockGetActuatorHistory({ page, pageSize, device, dateFrom, dateTo });
  const params = new URLSearchParams({ page, pageSize });
  if (device) params.set('device', device);
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);
  return request('GET', `/actuators/history?${params}`, null, signal);
}

/**
 * DELETE /api/actuators/history/:id — delete single actuator log
 */
export async function deleteActuatorLog(id) {
  return request('DELETE', `/actuators/history/${id}`);
}

/**
 * DELETE /api/actuators/history — bulk delete actuator logs
 * Body: { ids: [1, 2, 3] }
 */
export async function bulkDeleteActuatorLogs(ids) {
  return request('DELETE', '/actuators/history', { ids });
}

// ─── Settings / Automation ───────────────────────────────────────────────────

/**
 * GET /api/settings
 */
export async function getSettings(signal) {
  if (USE_MOCK) return mockGetSettings();
  return request('GET', '/settings', null, signal);
}

/**
 * POST /api/settings  (backend also accepts PUT)
 */
export async function updateSettings(settings) {
  if (USE_MOCK) return mockUpdateSettings(settings);
  return request('PUT', '/settings', settings);
}

// ─── System Status ───────────────────────────────────────────────────────────

/**
 * GET /api/system/status
 */
export async function getSystemStatus(signal) {
  if (USE_MOCK) return mockGetSystemStatus();
  return request('GET', '/system/status', null, signal);
}

// ─── Analytics ───────────────────────────────────────────────────────────────

/**
 * GET /api/analytics?range=today|7d|30d
 */
export async function getAnalytics(range = 'today', signal) {
  if (USE_MOCK) return mockGetAnalytics(range);
  return request('GET', `/analytics?range=${range}`, null, signal);
}
