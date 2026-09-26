'use strict';
/**
 * System status routes
 * GET  /api/system/status
 * POST /api/system/status  (ESP8266 reports its state)
 */

const express = require('express');
const router  = express.Router();
const { pool, testConnection } = require('../config/db');

// ── GET /api/system/status ────────────────────────────────────────────────────
router.get('/status', async (req, res) => {
  try {
    // Always check live DB connectivity
    const dbAlive = await testConnection();

    const [rows] = await pool.query(
      `SELECT id, arduino_status, esp8266_status, wifi_status,
              backend_status, database_status, esp8266_ip, wifi_signal,
              last_sensor_update, last_actuator_update, updated_at
       FROM system_status
       ORDER BY id DESC LIMIT 1`
    );

    if (rows.length === 0) {
      return res.json({
        id:               null,
        arduino_status:   'disconnected',
        esp8266_status:   'disconnected',
        wifi_status:      'disconnected',
        backend_status:   'online',
        database_status:  dbAlive ? 'connected' : 'disconnected',
        esp8266_ip:       null,
        wifi_signal:      null,
        last_sensor_update:   null,
        last_actuator_update: null,
        last_update:      new Date().toISOString(),
      });
    }

    const row = rows[0];

    // Reflect actual DB health at request-time
    row.database_status = dbAlive ? 'connected' : 'disconnected';
    row.backend_status  = 'online';
    row.last_update     = row.updated_at;

    res.json(row);
  } catch (err) {
    console.error('[system/status]', err.message);
    // Even if DB fails, return something useful so React knows backend is alive
    res.status(500).json({
      backend_status:  'online',
      database_status: 'disconnected',
      error:           err.message,
    });
  }
});

// ── POST /api/system/status  (ESP8266 heartbeat + status update) ──────────────
router.post('/status', async (req, res) => {
  const {
    arduino_status,
    esp8266_status,
    wifi_status,
    esp8266_ip,
    wifi_signal,
  } = req.body;

  const VALID = ['connected', 'disconnected', 'online', 'offline'];

  const fields   = [];
  const params   = [];

  if (arduino_status  && VALID.includes(arduino_status))  { fields.push('arduino_status = ?');  params.push(arduino_status); }
  if (esp8266_status  && VALID.includes(esp8266_status))  { fields.push('esp8266_status = ?');  params.push(esp8266_status); }
  if (wifi_status     && VALID.includes(wifi_status))     { fields.push('wifi_status = ?');     params.push(wifi_status); }
  if (esp8266_ip)     { fields.push('esp8266_ip = ?');    params.push(String(esp8266_ip).substring(0, 45)); }
  if (wifi_signal !== undefined) { fields.push('wifi_signal = ?'); params.push(parseInt(wifi_signal, 10)); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided.' });
  }

  try {
    const [rows] = await pool.query('SELECT id FROM system_status LIMIT 1');
    if (rows.length === 0) {
      return res.status(500).json({ error: 'system_status table is not initialized.' });
    }
    await pool.query(
      `UPDATE system_status SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      [...params, rows[0].id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[system/status POST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
