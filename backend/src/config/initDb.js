'use strict';
/**
 * Database initializer.
 * Creates all required tables in greenhouse_db if they do not already exist.
 * Inserts default rows where needed (actuator_current_status, automation_settings, system_status).
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS and INSERT IGNORE.
 */

const { pool } = require('./db');

async function initDb() {
  const conn = await pool.getConnection();

  try {
    // ── 1. sensor_readings ────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        id           INT          NOT NULL AUTO_INCREMENT,
        temperature  FLOAT        NULL,
        humidity     FLOAT        NULL,
        soil_moisture FLOAT       NULL,
        light        FLOAT        NULL,
        air_quality  FLOAT        NULL,
        created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ── 2. actuator_current_status ───────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS actuator_current_status (
        id         INT          NOT NULL AUTO_INCREMENT,
        device     VARCHAR(50)  NOT NULL,
        status     VARCHAR(20)  NOT NULL DEFAULT 'OFF',
        mode       VARCHAR(20)  NOT NULL DEFAULT 'AUTO',
        value      FLOAT        NULL,
        updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_device (device)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed the actuators (INSERT IGNORE keeps existing rows intact)
    const defaultActuators = [
      ['water_pump',      'OFF', 'AUTO', null],
      ['cooling_fan',     'OFF', 'AUTO', null],
      ['ventilation_fan', 'OFF', 'AUTO', null],
      ['light',           'OFF', 'AUTO', null],
      ['shade_motor',     'OFF', 'AUTO', 0],
    ];
    for (const [device, status, mode, value] of defaultActuators) {
      await conn.query(
        `INSERT IGNORE INTO actuator_current_status (device, status, mode, value)
         VALUES (?, ?, ?, ?)`,
        [device, status, mode, value]
      );
    }

    // ── 3. actuator_logs ─────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS actuator_logs (
        id         INT          NOT NULL AUTO_INCREMENT,
        device     VARCHAR(50)  NOT NULL,
        action     VARCHAR(30)  NOT NULL,
        mode       VARCHAR(20)  NOT NULL DEFAULT 'MANUAL',
        value      FLOAT        NULL,
        source     VARCHAR(50)  NOT NULL DEFAULT 'dashboard',
        created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_device     (device),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ── 4. automation_settings ───────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS automation_settings (
        id                    INT   NOT NULL AUTO_INCREMENT,
        soil_min              FLOAT NOT NULL DEFAULT 30,
        soil_max              FLOAT NOT NULL DEFAULT 70,
        temperature_low       FLOAT NOT NULL DEFAULT 30,
        temperature_high      FLOAT NOT NULL DEFAULT 35,
        humidity_high         FLOAT NOT NULL DEFAULT 90,
        light_threshold       FLOAT NOT NULL DEFAULT 800,
        air_quality_threshold FLOAT NOT NULL DEFAULT 70,
        updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure at least one settings row exists
    const [settingsRows] = await conn.query('SELECT id FROM automation_settings LIMIT 1');
    if (settingsRows.length === 0) {
      await conn.query(`
        INSERT INTO automation_settings
          (soil_min, soil_max, temperature_low, temperature_high, humidity_high, light_threshold, air_quality_threshold)
        VALUES (30, 70, 30, 35, 90, 800, 70)
      `);
    }

    // ── 5. system_status ─────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_status (
        id               INT         NOT NULL AUTO_INCREMENT,
        arduino_status   VARCHAR(20) NOT NULL DEFAULT 'disconnected',
        esp8266_status   VARCHAR(20) NOT NULL DEFAULT 'disconnected',
        wifi_status      VARCHAR(20) NOT NULL DEFAULT 'disconnected',
        backend_status   VARCHAR(20) NOT NULL DEFAULT 'online',
        database_status  VARCHAR(20) NOT NULL DEFAULT 'disconnected',
        esp8266_ip       VARCHAR(45) NULL,
        wifi_signal      INT         NULL,
        last_sensor_update   TIMESTAMP NULL,
        last_actuator_update TIMESTAMP NULL,
        updated_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure one system_status row
    const [ssRows] = await conn.query('SELECT id FROM system_status LIMIT 1');
    if (ssRows.length === 0) {
      await conn.query(`
        INSERT INTO system_status
          (arduino_status, esp8266_status, wifi_status, backend_status, database_status)
        VALUES ('disconnected', 'disconnected', 'disconnected', 'online', 'connected')
      `);
    }

    console.log('[DB] Tables initialized successfully.');
  } finally {
    conn.release();
  }
}

module.exports = { initDb };
