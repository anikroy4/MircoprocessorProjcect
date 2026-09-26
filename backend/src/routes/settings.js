'use strict';
/**
 * Automation settings routes
 * GET /api/settings
 * PUT /api/settings
 * POST /api/settings  (also accepted — frontend used POST initially)
 */

const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');

// ── GET /api/settings ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, soil_min, soil_max, temperature_low, temperature_high,
              humidity_high, light_threshold, air_quality_threshold, updated_at
       FROM automation_settings
       ORDER BY id DESC LIMIT 1`
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No automation settings found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('[settings GET]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// ── Shared update handler ─────────────────────────────────────────────────────
async function updateSettings(req, res) {
  const {
    soil_min,
    soil_max,
    temperature_low,
    temperature_high,
    humidity_high,
    light_threshold,
    air_quality_threshold,
  } = req.body;

  // At least one field must be provided
  const fields = {
    soil_min,
    soil_max,
    temperature_low,
    temperature_high,
    humidity_high,
    light_threshold,
    air_quality_threshold,
  };

  const setClauses = [];
  const params     = [];

  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined && val !== null && !isNaN(parseFloat(val))) {
      setClauses.push(`${key} = ?`);
      params.push(parseFloat(val));
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'No valid settings fields provided.' });
  }

  try {
    const [rows] = await pool.query('SELECT id FROM automation_settings ORDER BY id DESC LIMIT 1');

    if (rows.length === 0) {
      // Insert first row
      await pool.query(
        `INSERT INTO automation_settings
           (soil_min, soil_max, temperature_low, temperature_high, humidity_high, light_threshold, air_quality_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          fields.soil_min              ?? 30,
          fields.soil_max              ?? 70,
          fields.temperature_low       ?? 30,
          fields.temperature_high      ?? 35,
          fields.humidity_high         ?? 90,
          fields.light_threshold       ?? 800,
          fields.air_quality_threshold ?? 70,
        ]
      );
    } else {
      await pool.query(
        `UPDATE automation_settings SET ${setClauses.join(', ')}, updated_at = NOW()
         WHERE id = ?`,
        [...params, rows[0].id]
      );
    }

    // Return updated row
    const [[updated]] = await pool.query(
      `SELECT id, soil_min, soil_max, temperature_low, temperature_high,
              humidity_high, light_threshold, air_quality_threshold, updated_at
       FROM automation_settings ORDER BY id DESC LIMIT 1`
    );

    res.json({ success: true, settings: updated });
  } catch (err) {
    console.error('[settings PUT/POST]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
}

// Accept both PUT (REST standard) and POST (existing frontend uses POST)
router.put('/',  updateSettings);
router.post('/', updateSettings);

module.exports = router;
