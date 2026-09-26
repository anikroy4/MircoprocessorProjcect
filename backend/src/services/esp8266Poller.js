'use strict';
/**
 * ESP8266 Poller Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Polls http://ESP8266_IP/status every ESP8266_POLL_INTERVAL ms.
 * Extracts sensor + actuator data and saves it to MySQL.
 *
 * This runs inside the Node.js backend process — no extra process needed.
 * Start it by calling startPoller() from server.js after DB is ready.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const http   = require('http');
const { pool } = require('../config/db');

const ESP8266_IP       = process.env.ESP8266_IP || '';
const POLL_INTERVAL_MS = parseInt(process.env.ESP8266_POLL_INTERVAL || '3000', 10);

let pollTimer    = null;
let lastRawData  = null;
let pollCount    = 0;
let errorCount   = 0;
let lastPollTime = null;

// ── Simple HTTP GET (no extra dependencies) ──────────────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Invalid JSON from ESP8266')); }
      });
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

// ── Save sensor reading to MySQL ─────────────────────────────────────────────
async function saveSensorReading(sensors) {
  const { temperature, humidity, soil_moisture, air_quality } = sensors;

  // Skip if all values are 0 — Arduino not sending data yet
  const allZero = [temperature, humidity, soil_moisture, air_quality]
    .every((v) => v === 0 || v === null || v === undefined);

  if (allZero) {
    console.log('[Poller] All sensor values are 0 — Arduino not sending yet. Skipping save.');
    return null;
  }

  const [result] = await pool.query(
    `INSERT INTO sensor_readings (temperature, humidity, soil_moisture, air_quality)
     VALUES (?, ?, ?, ?)`,
    [
      temperature   ?? null,
      humidity      ?? null,
      soil_moisture ?? null,
      air_quality   ?? null,
    ]
  );

  // Update system_status last_sensor_update
  await pool.query(
    `UPDATE system_status SET
       last_sensor_update = NOW(),
       esp8266_status     = 'connected',
       arduino_status     = 'connected',
       wifi_status        = 'connected',
       database_status    = 'connected'
     WHERE id = 1`
  );

  return result.insertId;
}

// ── Update actuator states in MySQL ─────────────────────────────────────────
async function updateActuatorStates(actuators) {
  if (!actuators) return;

  // Map ESP8266 actuator keys to our device names
  const deviceMap = {
    water_pump:      actuators.water_pump,
    cooling_fan:     actuators.cooling_fan,
    ventilation_fan: actuators.light,   // ESP8266 calls it "light"
  };

  for (const [device, status] of Object.entries(deviceMap)) {
    if (status === undefined) continue;
    await pool.query(
      `UPDATE actuator_current_status
       SET status = ?, mode = 'AUTO', updated_at = NOW()
       WHERE device = ?`,
      [status === 'ON' ? 'ON' : 'OFF', device]
    );
  }
}

// ── Single poll cycle ────────────────────────────────────────────────────────
async function pollOnce() {
  if (!ESP8266_IP) return;

  try {
    const url  = `http://${ESP8266_IP}/status`;
    const data = await httpGet(url);

    lastRawData  = data;
    lastPollTime = new Date().toISOString();
    pollCount++;
    errorCount = 0;

    const sensors   = data.sensors   || {};
    const actuators = data.actuators || {};

    // Log cleanly
    console.log(
      `[Poller #${pollCount}] T:${sensors.temperature}°C ` +
      `H:${sensors.humidity}% ` +
      `Soil:${sensors.soil_moisture}% ` +
      `AQ:${sensors.air_quality} ` +
      `Pump:${actuators.water_pump} Fan:${actuators.cooling_fan}`
    );

    // Save to DB
    const insertId = await saveSensorReading(sensors);
    if (insertId) {
      console.log(`[Poller] Saved to DB → sensor_readings id=${insertId}`);
    }

    await updateActuatorStates(actuators);

  } catch (err) {
    errorCount++;
    if (errorCount <= 3 || errorCount % 10 === 0) {
      console.warn(`[Poller] ⚠ Poll failed (${errorCount}): ${err.message}`);
    }

    // Mark ESP8266 as disconnected after 3 consecutive failures
    if (errorCount === 3) {
      try {
        await pool.query(
          `UPDATE system_status SET esp8266_status = 'disconnected', arduino_status = 'disconnected' WHERE id = 1`
        );
      } catch (_) {}
    }
  }
}

// ── Start polling ────────────────────────────────────────────────────────────
function startPoller() {
  if (!ESP8266_IP) {
    console.log('[Poller] ESP8266_IP not set in .env — poller disabled.');
    return;
  }

  console.log(`[Poller] ✅ Starting — polling http://${ESP8266_IP}/status every ${POLL_INTERVAL_MS}ms`);

  // First poll immediately
  pollOnce();

  // Then repeat on interval
  pollTimer = setInterval(pollOnce, POLL_INTERVAL_MS);
}

function stopPoller() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
    console.log('[Poller] Stopped.');
  }
}

function getPollerStatus() {
  return {
    running:      pollTimer !== null,
    esp8266_ip:   ESP8266_IP,
    poll_interval_ms: POLL_INTERVAL_MS,
    poll_count:   pollCount,
    error_count:  errorCount,
    last_poll:    lastPollTime,
    last_data:    lastRawData,
  };
}

module.exports = { startPoller, stopPoller, getPollerStatus };
