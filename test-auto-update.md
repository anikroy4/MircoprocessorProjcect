# 🧪 Auto-Update System Test Checklist

## Pre-Flight Check

### ✅ Configuration Verification

**Backend .env**
```bash
# Check backend configuration
cat backend/.env | grep -E "ESP8266|POLL"
```
Expected output:
```
ESP8266_IP=10.10.206.138
ESP8266_POLL_INTERVAL=3000
```

**Frontend .env**
```bash
# Check frontend configuration
cat smart-greenhouse/.env | grep POLL
```
Expected output:
```
VITE_POLL_INTERVAL=3000
```

---

## Test Sequence

### 1️⃣ Backend Polling Test

**Start Backend:**
```bash
cd backend
npm start
```

**Expected Console Output:**
```
✓ MySQL connected: greenhouse_db
✓ Database initialized
[Poller] ✅ Starting — polling http://10.10.206.138/status every 3000ms
[Poller #1] T:28°C H:65% Soil:45% AQ:120 Pump:OFF Fan:ON
[Poller] Saved to DB → sensor_readings id=1234
[Poller #2] T:28°C H:66% Soil:44% AQ:118 Pump:OFF Fan:ON
...continues every 3 seconds...
```

**✅ Pass Criteria:**
- Poller starts successfully
- Data logged every 3 seconds
- "Saved to DB" messages appear
- No error messages

---

### 2️⃣ Database Verification Test

**Check Recent Data:**
```sql
SELECT 
    id,
    temperature,
    humidity,
    soil_moisture,
    air_quality,
    created_at
FROM sensor_readings 
ORDER BY created_at DESC 
LIMIT 10;
```

**✅ Pass Criteria:**
- Recent entries (within last 30 seconds)
- created_at timestamps 3 seconds apart
- Non-zero sensor values
- No NULL values (unless sensor disconnected)

---

### 3️⃣ Frontend Polling Test

**Start Frontend:**
```bash
cd smart-greenhouse
npm run dev
```

**Open Browser:**
```
http://localhost:5173
```

**Open Browser DevTools (F12):**
1. Go to **Network** tab
2. Filter: `XHR` or `Fetch`
3. Watch for repeating requests

**Expected Network Activity:**
```
GET /api/sensors/latest       200 OK (20ms)  [every 3s]
GET /api/actuators/status     200 OK (18ms)  [every 3s]
GET /api/system/status        200 OK (15ms)  [every 3s]
GET /api/settings             200 OK (12ms)  [every 9s]
```

**✅ Pass Criteria:**
- API calls repeat automatically
- No 404 errors (except initial if no data)
- No CORS errors
- Response times < 100ms

---

### 4️⃣ UI Auto-Update Test

**Dashboard Visual Check:**

1. **Live Indicator Present?**
   ```
   Look for: 🟢 Live • Auto-updating • 3:45:23 PM
   ```
   - Green pulsing dot visible?
   - Timestamp updating?

2. **Sensor Cards Updating?**
   - Temperature value changes?
   - Humidity value changes?
   - Soil moisture value changes?
   - Air quality value changes?
   - "Last updated" time changes?

3. **System Status Bar?**
   ```
   System: online ✓
   ESP8266: connected ✓
   Arduino Mega: connected ✓
   Database: connected ✓
   ```

**✅ Pass Criteria:**
- Live indicator shows green pulsing dot
- Sensor values update every 3 seconds
- No manual refresh needed
- Timestamp advances automatically

---

### 5️⃣ Live Monitoring Chart Test

**Navigate to:** Live Monitoring page

**Verify:**
1. ✅ Current reading cards auto-update
2. ✅ Charts show data
3. ✅ "Auto-refresh" indicator visible
4. ✅ Chart data points increase over time

**Test Chart Range Selection:**
1. Select "1 Hour" range
2. Wait 3 seconds
3. Select "6 Hours" range
4. Verify chart updates automatically

**✅ Pass Criteria:**
- Charts refresh without manual action
- Range selection doesn't break auto-refresh
- No flickering during updates

---

### 6️⃣ Device Control Test

**Navigate to:** Device Control page

**Test Sequence:**
1. Note current actuator status
2. Wait 3 seconds
3. Check if status syncs

**Turn ON Water Pump:**
1. Click "Turn ON" button
2. Confirm in modal
3. Wait 3 seconds
4. Verify status changes to "ON"
5. Check backend console for command

**✅ Pass Criteria:**
- Status updates automatically
- Control commands reflect immediately
- Toast notification appears
- Backend logs command execution

---

### 7️⃣ Error Recovery Test

**Test 1: Backend Disconnect**
1. Stop backend server (Ctrl+C)
2. Watch dashboard
3. Expected: 
   - Live indicator turns gray
   - Status shows "offline"
4. Restart backend
5. Expected:
   - Auto-reconnects within 3 seconds
   - Live indicator turns green

**Test 2: Network Timeout**
1. Simulate slow network (DevTools → Network → Slow 3G)
2. Watch for errors
3. Expected:
   - Retries automatically
   - No crashes
   - Recovers when network improves

**✅ Pass Criteria:**
- Auto-recovery works
- No manual refresh needed
- Error messages clear and helpful

---

### 8️⃣ Performance Test

**Open Performance Monitor:**
- DevTools → Performance tab
- Record for 30 seconds
- Stop recording

**Check:**
1. **Memory Usage:**
   - No memory leaks
   - Stable memory over time

2. **Network:**
   - Consistent request intervals
   - No request pileup

3. **CPU:**
   - Low CPU usage
   - No spikes on updates

**✅ Pass Criteria:**
- Memory stable (not increasing)
- CPU < 5% average
- Network requests evenly spaced

---

### 9️⃣ Multi-Tab Test

**Test Concurrent Updates:**
1. Open dashboard in 2 browser tabs
2. In Tab 1: Turn ON water pump
3. In Tab 2: Watch for automatic status update
4. Expected: Tab 2 reflects change within 3 seconds

**✅ Pass Criteria:**
- Changes propagate across tabs
- No conflicts
- Both tabs update independently

---

### 🔟 Settings Sync Test

**Navigate to:** Automation page

**Test Sequence:**
1. Note current threshold values
2. Click "Edit Thresholds"
3. Change "Soil Min" from 30 to 35
4. Save
5. Navigate to Dashboard
6. Expected: Automation alerts reflect new threshold
7. Wait 9 seconds
8. Refresh not needed

**✅ Pass Criteria:**
- Settings save successfully
- Other pages reflect changes automatically
- No page refresh needed

---

## Test Results Template

```markdown
## Test Results - [Date]

### Configuration ✅
- [ ] Backend .env configured (ESP8266_POLL_INTERVAL=3000)
- [ ] Frontend .env configured (VITE_POLL_INTERVAL=3000)

### Backend Tests ✅
- [ ] Poller starts successfully
- [ ] Data logged every 3 seconds
- [ ] Database saves work
- [ ] No error messages

### Frontend Tests ✅
- [ ] Dashboard auto-updates
- [ ] Live indicator visible
- [ ] Charts auto-refresh
- [ ] Device control syncs

### Error Recovery ✅
- [ ] Auto-reconnect works
- [ ] Network timeouts handled
- [ ] No manual refresh needed

### Performance ✅
- [ ] No memory leaks
- [ ] CPU usage normal
- [ ] Network timing consistent

### Overall Status: ✅ PASS / ❌ FAIL

Notes:
- 
```

---

## Troubleshooting Guide

### Issue: Data not updating

**Check 1: Backend running?**
```bash
# Should see poller messages
ps aux | grep node
```

**Check 2: ESP8266 accessible?**
```bash
curl http://10.10.206.138/status
```

**Check 3: Network tab shows requests?**
- F12 → Network
- Should see requests every 3s

**Check 4: Console errors?**
- F12 → Console
- Look for error messages

---

### Issue: Slow updates

**Check polling interval:**
```bash
# Frontend
cat smart-greenhouse/.env | grep POLL

# Backend
cat backend/.env | grep POLL
```

**Verify network speed:**
- DevTools → Network tab
- Check response times
- Should be < 100ms

---

### Issue: Memory leak

**Check cleanup:**
- Verify useEffect returns cleanup function
- AbortController is used
- Intervals are cleared

**Monitor:**
```javascript
// DevTools → Memory → Take heap snapshot
// Compare snapshots 30 seconds apart
```

---

## Success Criteria Summary

✅ **Backend:** Polls ESP8266 every 3s
✅ **Frontend:** Polls API every 3s
✅ **UI:** Shows live indicator
✅ **Updates:** Automatic, no manual refresh
✅ **Charts:** Auto-refresh
✅ **Errors:** Auto-recovery
✅ **Performance:** Stable memory, low CPU
✅ **Multi-tab:** Syncs across tabs

**If all criteria pass: System is working perfectly! 🎉**
