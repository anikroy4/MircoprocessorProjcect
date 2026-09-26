'use strict';
/**
 * ESP8266 Communication Service
 * ─────────────────────────────────────────────────────────────────────────────
 * This module is the ONLY place where backend-to-hardware communication lives.
 * The React dashboard never talks to hardware directly.
 *
 * Architecture:
 *   React Dashboard → POST /api/actuators/control
 *     → Backend (this file) → HTTP to ESP8266
 *       → ESP8266 → UART/Serial → Arduino Mega → Relay/MOSFET/Servo
 *
 * Current state: STUB MODE
 *   The functions are fully implemented and ready to use.
 *   Set ESP8266_BASE_URL in .env to your ESP8266's local IP when hardware is connected.
 *   e.g.  ESP8266_BASE_URL=http://192.168.1.45
 *
 * When ESP8266_BASE_URL is not set, the service operates in stub mode:
 *   - Commands are logged to console
 *   - A "pending" response is returned so the dashboard still works
 *   - No network request is made
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();

const ESP8266_BASE_URL = process.env.ESP8266_BASE_URL || '';
const ESP8266_TIMEOUT_MS = parseInt(process.env.ESP8266_TIMEOUT_MS || '3000', 10);

/**
 * Send an actuator command to the ESP8266.
 * ESP8266 receives the command and forwards it to Arduino Mega via UART.
 *
 * @param {object} command  { device, action, mode, value }
 * @returns {object}        { sent: boolean, mode: 'hardware'|'stub', response? }
 */
async function sendCommand(command) {
  const { device, action, mode, value } = command;

  if (!ESP8266_BASE_URL) {
    // ── Stub mode: hardware not connected yet ────────────────────────────────
    console.log(`[ESP8266 STUB] Command → device=${device} action=${action} mode=${mode} value=${value ?? 'null'}`);
    return { sent: false, mode: 'stub', reason: 'ESP8266_BASE_URL not configured' };
  }

  // ── Real hardware mode ────────────────────────────────────────────────────
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ESP8266_TIMEOUT_MS);

    const response = await fetch(`${ESP8266_BASE_URL}/command`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ device, action, mode, value: value ?? null }),
      signal:  controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const text = await response.text();
      console.warn(`[ESP8266] Command failed: ${response.status} — ${text}`);
      return { sent: false, mode: 'hardware', error: `ESP8266 responded with ${response.status}` };
    }

    const data = await response.json().catch(() => ({ ok: true }));
    console.log(`[ESP8266] Command sent successfully:`, data);
    return { sent: true, mode: 'hardware', response: data };

  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ESP8266] Command timed out');
      return { sent: false, mode: 'hardware', error: 'ESP8266 request timed out' };
    }
    console.warn('[ESP8266] Connection error:', err.message);
    return { sent: false, mode: 'hardware', error: err.message };
  }
}

/**
 * Push updated automation settings to ESP8266.
 * ESP8266 stores these thresholds locally so Arduino can operate autonomously
 * even if Wi-Fi drops.
 *
 * @param {object} settings  automation_settings row
 */
async function pushSettings(settings) {
  if (!ESP8266_BASE_URL) {
    console.log('[ESP8266 STUB] Settings push →', settings);
    return { sent: false, mode: 'stub' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ESP8266_TIMEOUT_MS);

    const response = await fetch(`${ESP8266_BASE_URL}/settings`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(settings),
      signal:  controller.signal,
    });

    clearTimeout(timer);
    return { sent: response.ok, mode: 'hardware', status: response.status };
  } catch (err) {
    console.warn('[ESP8266] Settings push failed:', err.message);
    return { sent: false, mode: 'hardware', error: err.message };
  }
}

/**
 * Request a status ping from ESP8266.
 * Returns whether ESP8266 responded.
 */
async function ping() {
  if (!ESP8266_BASE_URL) return { alive: false, mode: 'stub' };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ESP8266_TIMEOUT_MS);

    const response = await fetch(`${ESP8266_BASE_URL}/ping`, { signal: controller.signal });
    clearTimeout(timer);
    return { alive: response.ok, mode: 'hardware', status: response.status };
  } catch (_) {
    return { alive: false, mode: 'hardware' };
  }
}

module.exports = { sendCommand, pushSettings, ping };
