# 🔄 Smart Greenhouse - Automatic Data Update System

## Overview
Apnar Smart Greenhouse Dashboard ekhon **real-time automatic data update** system diye equipped. Database theke data automatically refresh hoy ar dashboard-e instantly reflect hoy.

## ✨ Key Features

### 1. **Real-Time Sensor Data Updates**
- ✅ **3 second polling interval** - Sensor readings automatically refresh every 3 seconds
- ✅ **Live indicator** - Green pulsing dot shows data is updating in real-time
- ✅ **Timestamp display** - Last update time visible on all sensor cards
- ✅ **Error recovery** - Auto-retry on connection failures

### 2. **Automatic Chart Refresh**
- ✅ All sensor history charts auto-update every 3 seconds
- ✅ No loading spinner on subsequent updates (smooth experience)
- ✅ Maintain selected time range during updates
- ✅ Threshold lines update automatically with settings

### 3. **Actuator Status Polling**
- ✅ Device states (ON/OFF) automatically sync
- ✅ Mode (AUTO/MANUAL) status updates in real-time
- ✅ Instant feedback after control commands

### 4. **System Status Monitoring**
- ✅ Backend, ESP8266, Arduino, Database connection status
- ✅ Auto-detect disconnections and reconnections
- ✅ Visual status indicators

### 5. **Settings Auto-Sync**
- ✅ Automation thresholds automatically refresh (every 9 seconds)
- ✅ Changes from other sources reflected immediately
- ✅ Seamless threshold updates on all pages

## 🔧 Technical Implementation

### Backend Data Flow
```
Arduino Mega 
    ↓ (Serial @ 9600 baud)
ESP8266 (receives sensor data)
    ↓ (HTTP GET /status every 3s)
Node.js Backend Poller
    ↓ (MySQL INSERT)
Database (sensor_readings table)
    ↓ (REST API)
React Dashboard (polls every 3s)
    ↓
User sees updated data
```

### Auto-Polling Configuration

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK_DATA=false
VITE_POLL_INTERVAL=3000  # 3 seconds
```

#### Backend (.env)
```env
ESP8266_IP=192.168.x.x
ESP8266_POLL_INTERVAL=3000  # 3 seconds
```

### React Hooks Architecture

#### 1. **useSensorData Hook**
```javascript
// Automatically polls sensor data
- Fetches: /api/sensors/latest
- Interval: 3 seconds
- Returns: { data, loading, error, lastUpdated, refetch }
- AbortController: Prevents race conditions
```

#### 2. **useActuatorStatus Hook**
```javascript
// Automatically polls actuator states
- Fetches: /api/actuators/status
- Interval: 3 seconds
- Returns: { actuators, loading, error, controlling, sendCommand }
```

#### 3. **useSystemStatus Hook**
```javascript
// Monitors system health
- Fetches: /api/system/status
- Interval: 3 seconds
- Returns: { status, isOnline, isArduinoConnected, isEspConnected }
```

#### 4. **useSettings Hook**
```javascript
// Syncs automation settings
- Fetches: /api/settings
- Interval: 9 seconds (3x sensor interval)
- Returns: { settings, loading, saving, saveSettings }
```

## 📊 Data Update Indicators

### Live Indicator Component
Dashboard-e green pulsing indicator dekhabe:
- 🟢 **Live** - Data is updating
- ⚪ **Updates paused** - Connection lost

```jsx
<DataUpdateIndicator 
  lastUpdated={lastUpdated}
  isLive={!loading && !error}
  label="Auto-updating"
/>
```

## 🎯 Pages with Auto-Update

| Page | Update Frequency | Data Types |
|------|------------------|------------|
| **Dashboard** | 3s | Sensors, Actuators, System Status, Settings |
| **Live Monitoring** | 3s | Sensors + Charts |
| **Device Control** | 3s | Actuator Status |
| **Automation** | 3s | Settings + Sensor Data |
| **Analytics** | 3s | Real-time analytics |
| **System Status** | 3s | All system components |

## 🚀 Performance Optimizations

### 1. **AbortController Pattern**
- Previous fetch requests are cancelled before new ones
- Prevents memory leaks
- Avoids race conditions

```javascript
const abortRef = useRef(null);

const fetchData = async () => {
  if (abortRef.current) abortRef.current.abort();
  abortRef.current = new AbortController();
  
  const result = await api(abortRef.current.signal);
  // ...
};
```

### 2. **Smart Loading States**
- Initial load: Show skeleton
- Subsequent updates: Keep showing data (no flicker)

```javascript
if (!data.length) setLoading(true); // Only first time
```

### 3. **Cleanup on Unmount**
```javascript
useEffect(() => {
  const interval = setInterval(fetchData, POLL_INTERVAL);
  
  return () => {
    clearInterval(interval);
    if (abortRef.current) abortRef.current.abort();
  };
}, [fetchData]);
```

## 🔍 Error Handling

### Auto-Recovery Features
1. **Network Errors**: Retry on next interval
2. **404 Errors**: Show empty state (no data yet)
3. **500 Errors**: Show error message with retry button
4. **Timeout**: Auto-retry after interval
5. **Connection Lost**: Visual indicator + auto-reconnect

### Error States
```javascript
// 404 - No data yet (not an error)
if (err.message.includes('No sensor readings')) {
  setData(null);
  setError(null);
}

// Real errors
else {
  setError(err.message);
  setStatus(prev => ({ ...prev, backend_status: 'offline' }));
}
```

## 📱 User Experience

### Visual Feedback
1. ✅ **Live indicator** - Shows active updates
2. ✅ **Timestamp** - Last update time
3. ✅ **Smooth transitions** - No flickering
4. ✅ **Toast notifications** - Success/error messages
5. ✅ **Status badges** - Color-coded states

### Network Status
- 🟢 **Online** - All systems connected
- 🟡 **Warning** - Partial connectivity
- 🔴 **Offline** - Connection lost

## 🛠️ Troubleshooting

### Data Not Updating?

1. **Check Backend**
```bash
cd backend
npm start
# Should see: [Poller] Starting — polling http://ESP8266_IP/status
```

2. **Check ESP8266**
```bash
# Visit: http://ESP8266_IP/status
# Should return JSON with sensor data
```

3. **Check Browser Console**
```javascript
// Should see API calls every 3 seconds
// No CORS errors
// No 404s (except on first load if no data)
```

4. **Check Database**
```sql
-- Should have recent entries
SELECT * FROM sensor_readings 
ORDER BY created_at DESC 
LIMIT 10;
```

### Adjust Update Frequency

**Faster Updates (1 second):**
```env
# .env (frontend)
VITE_POLL_INTERVAL=1000

# .env (backend)
ESP8266_POLL_INTERVAL=1000
```

**Slower Updates (10 seconds):**
```env
VITE_POLL_INTERVAL=10000
ESP8266_POLL_INTERVAL=10000
```

## 📈 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      REAL-TIME DATA FLOW                     │
└─────────────────────────────────────────────────────────────┘

Hardware Layer:
┌──────────────┐         ┌──────────────┐
│ DHT22 Sensor │────────▶│ Arduino Mega │
│ Soil Sensor  │ Analog  │   (Master)   │
│ MQ135 Gas    │ Pins    │              │
└──────────────┘         └──────┬───────┘
                                │ Serial (9600)
                                ▼
Communication Layer:
                         ┌──────────────┐
                         │   ESP8266    │
                         │ (WiFi Bridge)│
                         └──────┬───────┘
                                │ HTTP GET every 3s
                                ▼
Backend Layer:
                         ┌──────────────┐
                         │  Node.js API │
                         │   + Poller   │
                         └──────┬───────┘
                                │ MySQL INSERT
                                ▼
Database Layer:
                         ┌──────────────┐
                         │    MySQL     │
                         │  sensor_db   │
                         └──────┬───────┘
                                │ REST API
                                ▼
Frontend Layer:
                         ┌──────────────┐
                         │ React Hooks  │
                         │ (Auto Poll)  │
                         └──────┬───────┘
                                │ Update State
                                ▼
UI Layer:
                         ┌──────────────┐
                         │  Dashboard   │
                         │  📊 Charts   │
                         │  🎛️ Controls │
                         └──────────────┘
                              ▲
                              │ User sees updates
                              │ every 3 seconds
                              └─────────────────┐
                                               🧑
```

## 🎉 Benefits

1. ✅ **Real-time monitoring** - See changes as they happen
2. ✅ **No manual refresh** - Data updates automatically
3. ✅ **Instant feedback** - Control commands reflect immediately
4. ✅ **Reliable** - Auto-recovery from connection issues
5. ✅ **Smooth UX** - No page reloads or flickering
6. ✅ **Scalable** - Can handle multiple concurrent users

## 📝 Summary

Apnar Smart Greenhouse Dashboard ekhon fully automated:
- 🔄 Data automatically refresh hoy har 3 second-e
- 📊 Charts real-time update hoy
- 🎛️ Device status instantly sync hoy
- ⚡ Fast and smooth user experience
- 🛡️ Error handling and auto-recovery

**Kono manual refresh button click korar dorkar nai! 🎊**
