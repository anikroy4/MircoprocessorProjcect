'use strict';
/**
 * Analytics route
 * GET /api/analytics?range=today|7d|30d
 */

const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');

function rangeToInterval(range) {
  const map = {
    'today': 'INTERVAL 1 DAY',
    '7d':    'INTERVAL 7 DAY',
    '30d':   'INTERVAL 30 DAY',
  };
  return map[range] || 'INTERVAL 1 DAY';
}

router.get('/', async (req, res) => {
  const { range = 'today' } = req.query;
  const validRanges = ['today', '7d', '30d'];
  if (!validRanges.includes(range)) {
    return res.status(400).json({ error: 'Invalid range. Use today, 7d, or 30d.' });
  }

  const interval = rangeToInterval(range);

  try {
    // ── Sensor aggregates ────────────────────────────────────────────────────
    const [[sensorStats]] = await pool.query(
      `SELECT
         AVG(temperature)   AS temp_avg,
         MAX(temperature)   AS temp_max,
         MIN(temperature)   AS temp_min,
         AVG(humidity)      AS hum_avg,
         MAX(humidity)      AS hum_max,
         MIN(humidity)      AS hum_min,
         AVG(soil_moisture) AS soil_avg,
         MAX(soil_moisture) AS soil_max,
         MIN(soil_moisture) AS soil_min,
         AVG(light)         AS light_avg,
         MAX(light)         AS light_max,
         MIN(light)         AS light_min,
         AVG(air_quality)   AS aq_avg,
         MAX(air_quality)   AS aq_max,
         MIN(air_quality)   AS aq_min
       FROM sensor_readings
       WHERE created_at >= NOW() - ${interval}`
    );

    // ── Actuator ON runtime (hours) ──────────────────────────────────────────
    // Approximate: count ON logs × assumed avg cycle time
    const [runtimeRows] = await pool.query(
      `SELECT device, COUNT(*) AS on_count
       FROM actuator_logs
       WHERE action = 'ON'
         AND created_at >= NOW() - ${interval}
       GROUP BY device`
    );

    const runtime = {};
    for (const row of runtimeRows) {
      // Rough estimate: each ON event ≈ 5 min → hours = count * 5 / 60
      runtime[row.device] = parseFloat((row.on_count * 5 / 60).toFixed(1));
    }

    const round = (v) => v !== null && v !== undefined ? parseFloat(parseFloat(v).toFixed(1)) : null;

    res.json({
      range,
      temperature: {
        avg: round(sensorStats.temp_avg),
        max: round(sensorStats.temp_max),
        min: round(sensorStats.temp_min),
      },
      humidity: {
        avg: round(sensorStats.hum_avg),
        max: round(sensorStats.hum_max),
        min: round(sensorStats.hum_min),
      },
      soil_moisture: {
        avg: round(sensorStats.soil_avg),
        max: round(sensorStats.soil_max),
        min: round(sensorStats.soil_min),
      },
      light: {
        avg: round(sensorStats.light_avg),
        max: round(sensorStats.light_max),
        min: round(sensorStats.light_min),
      },
      air_quality: {
        avg: round(sensorStats.aq_avg),
        max: round(sensorStats.aq_max),
        min: round(sensorStats.aq_min),
      },
      actuator_runtime: {
        water_pump:      runtime['water_pump']      || 0,
        cooling_fan:     runtime['cooling_fan']     || 0,
        ventilation_fan: runtime['ventilation_fan'] || 0,
      },
    });
  } catch (err) {
    console.error('[analytics]', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

module.exports = router;
