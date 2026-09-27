'use strict';
/**
 * Sensor routes
 * GET /api/sensors/latest
 * GET /api/sensors/history?type=temperature&range=24h
 * GET /api/sensors/readings?page=1&pageSize=15&dateFrom=&dateTo=
 * POST /api/sensors  (called by ESP8266 to insert new readings)
 */

const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');

// ── Range helper ──────────────────────────────────────────────────────────────
function rangeToInterval(range) {
  const map = {
    '1h':  'INTERVAL 1 HOUR',
    '6h':  'INTERVAL 6 HOUR',
    '24h': 'INTERVAL 24 HOUR',
    '7d':  'INTERVAL 7 DAY',
    '30d': 'INTERVAL 30 DAY',
  };
  return map[range] || 'INTERVAL 24 HOUR';
}

// ── GET /api/sensors/latest ───────────────────────────────────────────────────
router.get('/latest', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, temperature, humidity, soil_moisture, light, air_quality, created_at
       FROM sensor_readings
       ORDER BY created_at DESC
       LIMIT 1`
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No sensor readings available yet.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('[sensors/latest]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// ── GET /api/sensors/history?type=temperature&range=24h ──────────────────────
router.get('/history', async (req, res) => {
  const { type, range = '24h' } = req.query;

  const validTypes = ['temperature', 'humidity', 'soil_moisture', 'light', 'air_quality'];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
  }

  const interval = rangeToInterval(range);

  try {
    // For 7-day range: bucket by hour. For shorter ranges: bucket by 5-minute intervals.
    let bucketExpr;
    if (range === '7d' || range === '30d') {
      bucketExpr = `DATE_FORMAT(created_at, '%Y-%m-%dT%H:00:00Z')`;
    } else if (range === '24h') {
      bucketExpr = `DATE_FORMAT(created_at, '%Y-%m-%dT%H:30:00Z')`;
    } else {
      bucketExpr = `DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:00Z')`;
    }

    // Safe: type is validated against whitelist above — no injection risk
    const [rows] = await pool.query(
      `SELECT
         ${bucketExpr}          AS timestamp,
         AVG(${type})            AS value
       FROM sensor_readings
       WHERE created_at >= NOW() - ${interval}
         AND ${type} IS NOT NULL
       GROUP BY timestamp
       ORDER BY timestamp ASC`
    );

    // Flatten AVG decimals
    const result = rows.map((r) => ({
      timestamp: r.timestamp,
      value: r.value !== null ? parseFloat(parseFloat(r.value).toFixed(2)) : null,
    }));

    res.json(result);
  } catch (err) {
    console.error('[sensors/history]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// ── GET /api/sensors/readings (paginated table) ───────────────────────────────
router.get('/readings', async (req, res) => {
  const page     = Math.max(1, parseInt(req.query.page     || '1',  10));
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || '15', 10)));
  const offset   = (page - 1) * pageSize;
  const dateFrom = req.query.dateFrom || '';
  const dateTo   = req.query.dateTo   || '';

  // Build safe WHERE clauses using parameterized queries
  const conditions = [];
  const params     = [];

  if (dateFrom) { conditions.push('created_at >= ?'); params.push(dateFrom); }
  if (dateTo)   { conditions.push('created_at <= ?'); params.push(dateTo + ' 23:59:59'); }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM sensor_readings ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT id, temperature, humidity, soil_moisture, light, air_quality, created_at
       FROM sensor_readings
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({ data: rows, total, page, pageSize });
  } catch (err) {
    console.error('[sensors/readings]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// ── POST /api/sensors  (ESP8266 → backend → MySQL) ───────────────────────────
router.post('/', async (req, res) => {
  const { temperature, humidity, soil_moisture, light, air_quality } = req.body;

  // Basic validation — at least one sensor value must be present
  const hasData = [temperature, humidity, soil_moisture, light, air_quality]
    .some((v) => v !== null && v !== undefined && !isNaN(parseFloat(v)));

  if (!hasData) {
    return res.status(400).json({ error: 'Request must contain at least one sensor value.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO sensor_readings (temperature, humidity, soil_moisture, light, air_quality)
       VALUES (?, ?, ?, ?, ?)`,
      [
        temperature   !== undefined ? parseFloat(temperature)   : null,
        humidity      !== undefined ? parseFloat(humidity)      : null,
        soil_moisture !== undefined ? parseFloat(soil_moisture) : null,
        light         !== undefined ? parseFloat(light)         : null,
        air_quality   !== undefined ? parseFloat(air_quality)   : null,
      ]
    );

    // Update system_status.last_sensor_update
    await pool.query(
      `UPDATE system_status SET last_sensor_update = NOW() WHERE id = 1`
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('[sensors POST]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// ── DELETE /api/sensors/:id (delete single sensor reading) ───────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || id <= 0) {
    return res.status(400).json({ error: 'Invalid sensor reading ID.' });
  }

  try {
    const [result] = await pool.query(
      `DELETE FROM sensor_readings WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sensor reading not found.' });
    }

    res.json({ success: true, message: 'Sensor reading deleted successfully.' });
  } catch (err) {
    console.error('[sensors DELETE]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// ── DELETE /api/sensors/bulk (delete multiple sensor readings) ───────────────
router.delete('/', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Request must contain an array of IDs.' });
  }

  const validIds = ids.filter((id) => Number.isInteger(id) && id > 0);
  if (validIds.length === 0) {
    return res.status(400).json({ error: 'No valid IDs provided.' });
  }

  try {
    const placeholders = validIds.map(() => '?').join(',');
    const [result] = await pool.query(
      `DELETE FROM sensor_readings WHERE id IN (${placeholders})`,
      validIds
    );

    res.json({
      success: true,
      message: `${result.affectedRows} sensor reading(s) deleted successfully.`,
      deletedCount: result.affectedRows,
    });
  } catch (err) {
    console.error('[sensors bulk DELETE]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

module.exports = router;
