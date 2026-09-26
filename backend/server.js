'use strict';
/**
 * Smart Greenhouse Backend API Server
 * CSE 4326 — IoT-Based Smart Greenhouse Automation & Monitoring System
 *
 * Start:  node server.js
 * Dev:    nodemon server.js
 *
 * Architecture:
 *   React Dashboard → This API → MySQL (greenhouse_db)
 *   ESP8266 → This API → MySQL (sensor inserts)
 *   This API → ESP8266 (actuator commands)
 */

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');

const { testConnection }  = require('./src/config/db');
const { initDb }          = require('./src/config/initDb');
const { startPoller }     = require('./src/services/esp8266Poller');

const sensorRoutes   = require('./src/routes/sensors');
const actuatorRoutes = require('./src/routes/actuators');
const settingsRoutes = require('./src/routes/settings');
const systemRoutes   = require('./src/routes/system');
const analyticsRoutes = require('./src/routes/analytics');

const app  = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, ESP8266)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods:  ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logger (development) ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Health check (no DB required) ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/sensors',   sensorRoutes);
app.use('/api/actuators', actuatorRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/system',    systemRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   Smart Greenhouse Backend API — CSE 4326    ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // Test DB connection
  console.log('[DB] Testing connection to greenhouse_db...');
  const connected = await testConnection();

  if (!connected) {
    console.error('[DB] ❌ Could not connect to MySQL.');
    console.error('     Make sure XAMPP MySQL is running and .env credentials are correct.');
    console.error('     Server will start anyway — API will return errors for DB-dependent routes.');
  } else {
    console.log('[DB] ✅ Connected to greenhouse_db successfully.');

    // Initialize tables
    try {
      await initDb();
    } catch (err) {
      console.error('[DB] Table initialization error:', err.message);
    }

    // Start polling ESP8266 /status endpoint every 3 seconds
    startPoller();
  }

  // Start HTTP server — bind to 0.0.0.0 so ESP8266 can reach it on LAN
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n[Server] ✅ Running at http://localhost:${PORT}`);
    console.log(`[Server] LAN URL: http://10.10.205.116:${PORT}`);
    console.log(`[Server] ESP8266: http://${process.env.ESP8266_IP || '?'}/status  (polling every ${process.env.ESP8266_POLL_INTERVAL || 3000}ms)`);
    console.log(`[Server] API base: http://localhost:${PORT}/api`);
    console.log(`[Server] Health:   http://localhost:${PORT}/health`);
    console.log(`\n── Endpoints ────────────────────────────────────`);
    console.log(`  GET    /api/sensors/latest`);
    console.log(`  GET    /api/sensors/history?type=temperature&range=24h`);
    console.log(`  GET    /api/sensors/readings?page=1&pageSize=15`);
    console.log(`  POST   /api/sensors              (ESP8266 → backend)`);
    console.log(`  GET    /api/actuators/status`);
    console.log(`  POST   /api/actuators/control`);
    console.log(`  GET    /api/actuators/history`);
    console.log(`  POST   /api/actuators/esp-update (ESP8266 → backend)`);
    console.log(`  GET    /api/settings`);
    console.log(`  PUT    /api/settings`);
    console.log(`  GET    /api/system/status`);
    console.log(`  POST   /api/system/status        (ESP8266 heartbeat)`);
    console.log(`  GET    /api/analytics?range=today`);
    console.log(`────────────────────────────────────────────────\n`);
  });
}

start();
