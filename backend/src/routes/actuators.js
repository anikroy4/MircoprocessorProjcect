'use strict';
/**
 * Actuator routes
 * GET  /api/actuators/status
 * POST /api/actuators/control
 * GET  /api/actuators/history
 * POST /api/actuators/esp-update  (ESP8266 reports current state back)
 */

const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');
const esp8266Service = require('../services/esp8266');

const VALID_DEVICES = ['water_pump', 'cooling_fan', 'ventilation_fan', 'light', 'shade_motor'];
const VALID_ACTIONS = ['ON', 'OFF', 'AUTO', 'SET_POSITION'];
const VALID_MODES   = ['AUTO', 'MANUAL'];

// ── GET /api/actuators/status ─────────────────────────────────────────────────
router.get('/status', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT device, status, mode, value, updated_at
       FROM actuator_current_status
       ORDER BY FIELD(device, 'water_pump', 'cooling_fan', 'ventilation_fan', 'light', 'shade_motor')`
    );
    res.json(rows);
  } catch (err) {
    console.error('[actuators/status]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// ── POST /api/actuators/control ───────────────────────────────────────────────
router.post('/control', async (req, res) => {
  let { device, action, mode = 'MANUAL', value } = req.body;

  if (action === 'AUTO') {
    mode = 'AUTO';
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!device || !VALID_DEVICES.includes(device)) {
    return res.status(400).json({
      error: `Invalid device. Must be one of: ${VALID_DEVICES.join(', ')}`,
    });
  }
  if (!action || !VALID_ACTIONS.includes(action)) {
    return res.status(400).json({
      error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}`,
    });
  }
  if (!VALID_MODES.includes(mode)) {
    return res.status(400).json({ error: 'Mode must be AUTO or MANUAL.' });
  }
  if (action === 'SET_POSITION') {
    const v = parseFloat(value);
    if (isNaN(v) || v < 0 || v > 100) {
      return res.status(400).json({ error: 'SET_POSITION requires value between 0 and 100.' });
    }
  }

  const numericValue = (value !== null && value !== undefined && !isNaN(parseFloat(value)))
    ? parseFloat(value)
    : null;

  // Determine new status for current-status table
  let newStatus;
  if (action === 'ON')                newStatus = 'ON';
  else if (action === 'OFF')          newStatus = 'OFF';
  else if (action === 'SET_POSITION') newStatus = numericValue > 0 ? 'ON' : 'OFF';
  else                                newStatus = action === 'AUTO' ? 'OFF' : action;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Update or Insert into actuator_current_status
    await conn.query(
      `INSERT INTO actuator_current_status (device, status, mode, value, updated_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status = VALUES(status), mode = VALUES(mode), value = VALUES(value), updated_at = NOW()`,
      [device, newStatus, mode, numericValue]
    );

    // 2. Log to actuator_logs
    await conn.query(
      `INSERT INTO actuator_logs (device, action, mode, value, source)
       VALUES (?, ?, ?, ?, 'dashboard')`,
      [device, action, mode, numericValue]
    );

    // 3. Update system_status.last_actuator_update
    await conn.query(
      `UPDATE system_status SET last_actuator_update = NOW() WHERE id = 1`
    );

    await conn.commit();

    // 4. Forward command to ESP8266 (non-blocking)
    const espResult = await esp8266Service.sendCommand({ device, action, mode, value: numericValue });

    // 5. Return updated device state
    const [[updated]] = await conn.query(
      `SELECT device, status, mode, value, updated_at
       FROM actuator_current_status WHERE device = ?`,
      [device]
    );

    res.json({
      success:  true,
      message:  `${device} ${action} command executed successfully.`,
      device:   updated,
      esp8266:  espResult,
    });
  } catch (err) {
    await conn.rollback();
    console.error('[actuators/control]', err.message);
    res.status(500).json({ error: 'Control command failed: ' + err.message });
  } finally {
    conn.release();
  }
});

// ── GET /api/actuators/history (paginated) ────────────────────────────────────
router.get('/history', async (req, res) => {
  const page     = Math.max(1, parseInt(req.query.page     || '1',  10));
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || '15', 10)));
  const offset   = (page - 1) * pageSize;
  const device   = req.query.device   || '';
  const dateFrom = req.query.dateFrom || '';
  const dateTo   = req.query.dateTo   || '';

  // Validate device filter
  if (device && !VALID_DEVICES.includes(device)) {
    return res.status(400).json({ error: 'Invalid device filter.' });
  }

  const conditions = [];
  const params     = [];
  if (device)   { conditions.push('device = ?');        params.push(device); }
  if (dateFrom) { conditions.push('created_at >= ?');   params.push(dateFrom); }
  if (dateTo)   { conditions.push('created_at <= ?');   params.push(dateTo + ' 23:59:59'); }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM actuator_logs ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT id, device, action, mode, value, source, created_at
       FROM actuator_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({ data: rows, total, page, pageSize });
  } catch (err) {
    console.error('[actuators/history]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// ── POST /api/actuators/esp-update  (ESP8266 → backend, hardware-reported state) ──
router.post('/esp-update', async (req, res) => {
  const { device, status, mode, value } = req.body;

  if (!device || !VALID_DEVICES.includes(device)) {
    return res.status(400).json({ error: 'Invalid device.' });
  }

  try {
    await pool.query(
      `INSERT INTO actuator_current_status (device, status, mode, value, updated_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = NOW()`,
      [
        device,
        status || 'OFF',
        mode   || 'AUTO',
        (value !== undefined && value !== null) ? parseFloat(value) : null,
      ]
    );

    await pool.query(
      `UPDATE system_status SET last_actuator_update = NOW() WHERE id = 1`
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[actuators/esp-update]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

module.exports = router;