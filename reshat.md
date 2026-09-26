# Smart Greenhouse — Complete Hardware to Dashboard Setup Guide
## Arduino Mega 2560 + ESP8266 NodeMCU V3 → React Live Dashboard
### CSE 4326 — IoT-Based Smart Greenhouse Automation

---

## YOUR SYSTEM AT A GLANCE

| Item | Value |
|------|-------|
| Wi-Fi Name | `UIU-Faculty-Staff` |
| Wi-Fi Password | `UIU#9876` |
| Laptop Wi-Fi IP | `10.10.205.116` |
| Backend Port | `5000` |
| Arduino Mega ↔ ESP8266 Baud Rate | `9600` (SoftwareSerial on D7/D8) |
| Arduino Serial Monitor Baud | `9600` |
| ESP8266 Serial Monitor Baud | `115200` |
| Data Send Interval | Every **3 seconds** |

---

## HOW THE WHOLE SYSTEM WORKS

```
DHT22 Sensor ─────────────────────→ Arduino Mega (Digital Pin 2)
Soil Moisture Sensor ─────────────→ Arduino Mega (Analog A0)
MQ135 Gas Sensor ─────────────────→ Arduino Mega (Analog A1)
                                             │
                                   Every 3 seconds
                                   Arduino builds JSON
                                   sends via Serial1 TX1→RX
                                             │
                                             ▼
                                   ESP8266 NodeMCU V3
                                   (Wi-Fi bridge)
                                             │
                                         Wi-Fi POST
                                             │
                                             ▼
                             http://10.10.205.116:5000/api/sensors
                                             │
                                   Node.js Backend saves to MySQL
                                             │
                                   greenhouse_db.sensor_readings
                                             │
                                   React polls every 5 seconds
                                             │
                                             ▼
                                   http://localhost:5173/
                             ┌───────────────────────────────┐
                             │  Temperature  |  Humidity     │
                             │  Soil Moisture | Air Quality  │
                             └───────────────────────────────┘
```

**Control flow — Dashboard sends command to hardware:**
```
React Dashboard
    → POST /api/actuators/control
    → Node.js Backend
    → POST http://ESP8266_IP/command
    → ESP8266
    → Serial.println(json) to Arduino Mega
    → Arduino sets relay pin
    → Water Pump / Fan / Light ON or OFF
```

---

## PART A — HARDWARE CONNECTIONS

### A1 — Sensors and Actuators → Arduino Mega

| Component | Arduino Mega Pin | Notes |
|-----------|-----------------|-------|
| **DHT22** DATA | Digital **2** | Temperature & Humidity sensor |
| DHT22 VCC | **5V** | Power |
| DHT22 GND | **GND** | Ground |
| **Soil Moisture** signal | Analog **A0** | Raw value 300–1023 |
| Soil Moisture VCC | **5V** | |
| Soil Moisture GND | **GND** | |
| **MQ135 Gas** analog out | Analog **A1** | Air quality value 0–1023 |
| MQ135 VCC | **5V** | |
| MQ135 GND | **GND** | |
| **Water Pump** relay IN | Digital **22** | Active-LOW relay |
| **Fan** relay IN | Digital **23** | Active-LOW relay |
| **Alert LED** (red) | Digital **24** | Lights up on alert |
| **Growth Light** relay IN | Digital **25** | Active-LOW relay |
| **LCD** SDA | **Pin 20 (SDA)** | I2C address 0x27 |
| **LCD** SCL | **Pin 21 (SCL)** | I2C 16×2 display |
| LCD VCC | **5V** | |
| LCD GND | **GND** | |
| **ESP8266 TX** | **RX1 — Pin 19** | Serial1 receive |
| **ESP8266 RX** | **TX1 — Pin 18** | Serial1 transmit |
| **ESP8266 GND** | **GND** | Shared ground — REQUIRED |

> ⚠️ **Always connect GND of Arduino Mega to GND of ESP8266.**
> Without shared ground, Serial communication will not work.

### A2 — Serial Communication Wiring (Arduino Mega ↔ ESP8266)

> ⚠️ **USE THIS WIRING — SoftwareSerial on ESP8266 D7/D8**
> This avoids the USB port conflict (ESP8266's hardware Serial GPIO1/GPIO3
> is the same as the USB port — using it breaks Serial Monitor).

```
Arduino Mega 2560              ESP8266 NodeMCU V3
┌──────────────┐               ┌──────────────────┐
│ TX1 (Pin 18) │ ───────────→  │ D7  (GPIO13) RX  │
│ RX1 (Pin 19) │ ←───────────  │ D8  (GPIO15) TX  │
│ GND          │ ───────────→  │ GND              │
│ 5V           │               │ VIN (or USB)     │
└──────────────┘               └──────────────────┘
```

| From | To | Purpose |
|------|----|----|
| Arduino Mega **TX1 (Pin 18)** | ESP8266 **D7 (GPIO13)** | Arduino → ESP8266 data |
| Arduino Mega **RX1 (Pin 19)** | ESP8266 **D8 (GPIO15)** | ESP8266 → Arduino commands |
| Arduino Mega **GND** | ESP8266 **GND** | Shared ground — REQUIRED |

### A3 — Relay Wiring

All relays are **Active-LOW** — sending `LOW` turns the relay ON:

| Relay IN Wire | Arduino Mega Pin | Controls |
|--------------|-----------------|---------|
| Pump relay | Digital **22** | Water pump |
| Fan relay | Digital **23** | Cooling / ventilation fan |
| Light relay | Digital **25** | Growth light / heater |

Each relay module also needs:
- **VCC** → Arduino 5V
- **GND** → Arduino GND

### A4 — ESP8266 NodeMCU V3 Connections Summary

| ESP8266 Pin | Connect To | Purpose |
|------------|-----------|---------|
| **RX** | Arduino Mega TX1 (Pin 18) | Receives JSON from Mega |
| **TX** | Arduino Mega RX1 (Pin 19) | Sends commands to Mega |
| **GND** | Arduino Mega GND | Shared ground |
| **USB** | Laptop | Code upload and power |

> ⚠️ ESP8266 is **3.3V logic**. Arduino Mega is **5V logic**.
> For best results use a **voltage divider** (1kΩ + 2kΩ) on the
> Arduino TX1 → ESP8266 RX line to step down 5V to 3.3V.
> Many NodeMCU boards tolerate 5V on RX — test carefully.

---

## PART B — ARDUINO IDE SETUP

### B1 — Install Arduino IDE

1. Go to: **https://www.arduino.cc/en/software**
2. Download **Arduino IDE 2.x** for Windows
3. Install it (Next → Next → Finish)

### B2 — Add ESP8266 Board Package

1. Open Arduino IDE
2. Click **File** → **Preferences**
3. Find **"Additional boards manager URLs"** and paste:
   ```
   https://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
4. Click **OK**
5. Click **Tools** → **Board** → **Boards Manager**
6. Search: `esp8266`
7. Install **"esp8266 by ESP8266 Community"**
8. Wait 3–5 minutes

### B3 — Install Required Libraries

Click **Tools** → **Manage Libraries** and install these:

| Library Name | Search For | Publisher | Used By |
|-------------|-----------|-----------|---------|
| DHT sensor library | `DHT sensor library` | Adafruit | Arduino Mega |
| Adafruit Unified Sensor | auto-installed with DHT | Adafruit | Arduino Mega |
| LiquidCrystal I2C | `LiquidCrystal I2C` | Frank de Brabander | Arduino Mega |
| ArduinoJson | `ArduinoJson` | Benoit Blanchon | Both boards |

> When installing DHT sensor library, click **"Install All"** when asked about dependencies.

**ESP8266 built-in libraries (no install needed):**

| Library | Notes |
|---------|-------|
| ESP8266WiFi | Included with ESP8266 board package |
| ESP8266WebServer | Included with ESP8266 board package |
| ESP8266HTTPClient | Included with ESP8266 board package |
| WiFiClient | Included with ESP8266 board package |

---

## PART C — ARDUINO MEGA CODE

### C1 — How to Upload

1. Open Arduino IDE
2. Click **File** → **New Sketch**
3. Delete all existing code
4. Paste the full code below
5. Select **Tools** → **Board** → **Arduino Mega or Mega 2560**
6. Select **Tools** → **Processor** → **ATmega2560**
7. Select correct **COM port** for Arduino Mega
8. Click **→ Upload**
9. Wait for **"Done uploading."**

### C2 — Complete Arduino Mega Sketch

```cpp
/*
 * ============================================================
 *  Smart Greenhouse — Arduino Mega 2560
 *  CSE 4326 — IoT-Based Smart Greenhouse Automation
 * ============================================================
 *  Sensors:    DHT22 (pin 2), Soil Moisture (A0), MQ135 (A1)
 *  Actuators:  Water Pump (22), Fan (23), LED (24), Light (25)
 *  Display:    I2C LCD 16x2 at address 0x27
 *  ESP8266:    Serial1 — TX1 pin18 / RX1 pin19 — 9600 baud
 * ============================================================
 *  Libraries required:
 *    DHT sensor library  (Adafruit)
 *    LiquidCrystal I2C   (Frank de Brabander)
 *    ArduinoJson         (Benoit Blanchon)
 * ============================================================
 */

#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// ── Pin Configuration ────────────────────────────────────────
const int moistureSensorPin = A0;   // Soil moisture sensor
const int mq135Pin          = A1;   // MQ135 gas/air quality sensor
const int pumpRelayPin      = 22;   // Water pump relay
const int fanRelayPin       = 23;   // Cooling/ventilation fan relay
const int redLedPin         = 24;   // Alert red LED
const int lightRelayPin     = 25;   // Growth light / heater relay

#define DHTPIN   2                  // DHT22 data pin
#define DHTTYPE  DHT22              // Change to DHT11 if using DHT11

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

#define RELAY_ON  LOW               // Active-LOW relay: LOW = ON
#define RELAY_OFF HIGH

// ── Automation Thresholds (updated by dashboard) ─────────────
int   dryThreshold        = 600;    // Soil raw > 600 → pump ON
float lowTempThreshold    = 25.0;   // Temp < 25°C → light ON
float highTempThreshold   = 52.0;   // Temp > 52°C → fan ON
int   airQualityThreshold = 100;    // Air > 100 → fan ON + alert

// ── Device Mode & State ──────────────────────────────────────
bool pumpManualMode  = false;       // false = AUTO, true = MANUAL
bool fanManualMode   = false;
bool lightManualMode = false;
bool pumpState       = false;
bool fanState        = false;
bool lightState      = false;
bool ledState        = false;

// ── Sensor Data Cache ────────────────────────────────────────
float lastTemperature = 0.0;
float lastHumidity    = 0.0;
int   lastMoisture    = 0;
int   lastAirQuality  = 0;
String lastAirStatus  = "Good";

// ── Timers ───────────────────────────────────────────────────
unsigned long lastSensorSendTime = 0;
const unsigned long SENSOR_SEND_INTERVAL = 3000;  // 3 seconds
unsigned long lastLcdSwitchTime = 0;
int lcdScreenIndex = 0;

// ── Handle commands from Dashboard (via ESP8266 → Serial1) ───
void handleIncomingCommand(const String& jsonStr) {
  StaticJsonDocument<256> doc;
  if (deserializeJson(doc, jsonStr)) return;

  const char* device = doc["device"];
  const char* action = doc["action"];
  const char* mode   = doc["mode"] | "MANUAL";
  bool isAuto = (strcmp(mode, "AUTO") == 0);

  // Water pump control
  if (strcmp(device, "water_pump") == 0 || strcmp(device, "pump") == 0) {
    pumpManualMode = !isAuto;
    if (!isAuto) {
      pumpState = (strcmp(action, "ON") == 0);
      digitalWrite(pumpRelayPin, pumpState ? RELAY_ON : RELAY_OFF);
    }
  }
  // Fan control
  else if (strcmp(device, "cooling_fan") == 0 ||
           strcmp(device, "ventilation_fan") == 0 ||
           strcmp(device, "fan") == 0) {
    fanManualMode = !isAuto;
    if (!isAuto) {
      fanState = (strcmp(action, "ON") == 0);
      digitalWrite(fanRelayPin, fanState ? RELAY_ON : RELAY_OFF);
    }
  }
  // Light / heater control
  else if (strcmp(device, "light") == 0 || strcmp(device, "heater") == 0) {
    lightManualMode = !isAuto;
    if (!isAuto) {
      lightState = (strcmp(action, "ON") == 0);
      digitalWrite(lightRelayPin, lightState ? RELAY_ON : RELAY_OFF);
    }
  }

  // Settings update from dashboard
  if (doc.containsKey("soil_min"))              dryThreshold        = doc["soil_min"];
  if (doc.containsKey("dry_threshold"))         dryThreshold        = doc["dry_threshold"];
  if (doc.containsKey("temperature_low"))       lowTempThreshold    = doc["temperature_low"];
  if (doc.containsKey("temperature_high"))      highTempThreshold   = doc["temperature_high"];
  if (doc.containsKey("air_quality_threshold")) airQualityThreshold = doc["air_quality_threshold"];
}

void checkIncomingSerial() {
  while (Serial1.available() > 0) {
    String line = Serial1.readStringUntil('\n');
    line.trim();
    if (line.length() > 0) handleIncomingCommand(line);
  }
}

// ── Read Sensors + Apply Automation ─────────────────────────
void readSensorsAndApplyAutomation() {
  // Read sensors
  lastMoisture   = analogRead(moistureSensorPin);
  lastAirQuality = analogRead(mq135Pin);
  bool airBad    = (lastAirQuality > airQualityThreshold);
  lastAirStatus  = airBad ? "BAD!" : "Good";

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) lastTemperature = t;
  if (!isnan(h)) lastHumidity    = h;

  // Automation Rule 1: Soil moisture → water pump
  if (!pumpManualMode) {
    pumpState = (lastMoisture > dryThreshold);
    digitalWrite(pumpRelayPin, pumpState ? RELAY_ON : RELAY_OFF);
  }

  // Automation Rules 2 & 3: Temperature → fan and light
  if (!isnan(lastTemperature)) {
    if (lastTemperature > highTempThreshold) {
      // Too hot: fan ON, light OFF
      if (!fanManualMode) {
        fanState = true;
        digitalWrite(fanRelayPin, RELAY_ON);
      }
      if (!lightManualMode) {
        lightState = false;
        digitalWrite(lightRelayPin, RELAY_OFF);
      }
    }
    else if (lastTemperature < lowTempThreshold) {
      // Too cold: light ON, fan OFF (unless air is bad)
      if (!lightManualMode) {
        lightState = true;
        digitalWrite(lightRelayPin, RELAY_ON);
      }
      if (!fanManualMode) {
        fanState = airBad;
        digitalWrite(fanRelayPin, airBad ? RELAY_ON : RELAY_OFF);
      }
    }
    else {
      // Normal range: light OFF, fan only if air is bad
      if (!lightManualMode) {
        lightState = false;
        digitalWrite(lightRelayPin, RELAY_OFF);
      }
      if (!fanManualMode) {
        fanState = airBad;
        digitalWrite(fanRelayPin, airBad ? RELAY_ON : RELAY_OFF);
      }
    }
  }

  // Alert LED: ON if air bad or temperature too low
  ledState = airBad || (!isnan(lastTemperature) && lastTemperature < lowTempThreshold);
  digitalWrite(redLedPin, ledState ? HIGH : LOW);
}

// ── Send JSON to ESP8266 via Serial1 ────────────────────────
void sendTelemetryToESP8266() {
  // Convert raw soil reading to percentage (0–100%)
  float soilPercent = map(constrain(lastMoisture, 300, 1023), 1023, 300, 0, 100);

  String json = "{";
  json += "\"temperature\":"   + String(lastTemperature, 1) + ",";
  json += "\"humidity\":"      + String(lastHumidity, 1)    + ",";
  json += "\"soil_moisture\":" + String(soilPercent, 1)     + ",";
  json += "\"air_quality\":"   + String(lastAirQuality)     + ",";
  json += "\"pumpStatus\":"    + String(pumpState  ? "true" : "false") + ",";
  json += "\"fanStatus\":"     + String(fanState   ? "true" : "false") + ",";
  json += "\"lightStatus\":"   + String(lightState ? "true" : "false");
  json += "}";

  Serial1.println(json);    // Send to ESP8266
  Serial.println(json);     // Print in Serial Monitor for debugging
}

// ── LCD Display (switches between 2 screens) ────────────────
void updateLcdDisplay() {
  if (millis() - lastLcdSwitchTime > 2500) {
    lastLcdSwitchTime = millis();
    lcdScreenIndex = (lcdScreenIndex + 1) % 2;
    lcd.clear();

    if (lcdScreenIndex == 0) {
      // Screen 1: Temperature, Humidity, Fan status
      lcd.setCursor(0, 0);
      lcd.print("T:");
      lcd.print(lastTemperature, 1);
      lcd.print("C H:");
      lcd.print(lastHumidity, 0);
      lcd.print("%");
      lcd.setCursor(0, 1);
      lcd.print("Fan:");
      lcd.print(fanState  ? "ON " : "OFF");
      lcd.print(" Pump:");
      lcd.print(pumpState ? "ON" : "OFF");
    } else {
      // Screen 2: Soil moisture, Air quality
      lcd.setCursor(0, 0);
      lcd.print("Soil:");
      lcd.print(lastMoisture);
      lcd.print(pumpState ? " P:ON" : " P:OFF");
      lcd.setCursor(0, 1);
      lcd.print("Air:");
      lcd.print(lastAirQuality);
      lcd.print(" ");
      lcd.print(lastAirStatus);
    }
  }
}

// ── Setup ────────────────────────────────────────────────────
void setup() {
  Serial.begin(9600);      // USB debug Serial Monitor
  Serial1.begin(9600);     // Serial1 to ESP8266

  dht.begin();
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Greenhouse Smart");
  lcd.setCursor(0, 1);
  lcd.print("System Loading..");
  delay(1500);

  pinMode(pumpRelayPin,  OUTPUT);
  pinMode(fanRelayPin,   OUTPUT);
  pinMode(lightRelayPin, OUTPUT);
  pinMode(redLedPin,     OUTPUT);

  digitalWrite(pumpRelayPin,  RELAY_OFF);
  digitalWrite(fanRelayPin,   RELAY_OFF);
  digitalWrite(lightRelayPin, RELAY_OFF);
  digitalWrite(redLedPin,     LOW);

  lcd.clear();
  lcd.print("System Ready!");
  delay(1000);
  Serial.println("[Mega] Ready — sending data every 3s via Serial1.");
}

// ── Main Loop ────────────────────────────────────────────────
void loop() {
  checkIncomingSerial();
  readSensorsAndApplyAutomation();

  if (millis() - lastSensorSendTime >= SENSOR_SEND_INTERVAL) {
    lastSensorSendTime = millis();
    sendTelemetryToESP8266();
  }

  updateLcdDisplay();
}
```

### C3 — Expected Serial Monitor Output (9600 baud)

After uploading to Arduino Mega, open **Tools → Serial Monitor** at **9600 baud**.
You should see JSON lines every 3 seconds:

```
[Mega] Ready — sending data every 3s via Serial1.
{"temperature":28.5,"humidity":65.2,"soil_moisture":45.0,"air_quality":82,"pumpStatus":false,"fanStatus":false,"lightStatus":false}
{"temperature":28.6,"humidity":65.1,"soil_moisture":44.8,"air_quality":83,"pumpStatus":false,"fanStatus":false,"lightStatus":false}
```

---

## PART D — ESP8266 CODE

### D1 — How to Upload

1. Open Arduino IDE
2. Click **File** → **New Sketch**
3. Delete all existing code
4. Paste the full code below
5. Select **Tools** → **Board** → **esp8266** → **NodeMCU 1.0 (ESP-12E Module)**
6. Select **Tools** → **Upload Speed** → **115200**
7. Select correct **COM port** for ESP8266
8. Click **→ Upload**
9. Wait for **"Done uploading."**

### D2 — Complete ESP8266 Sketch

```cpp
/*
 * ============================================================
 *  Smart Greenhouse — ESP8266 NodeMCU V3
 *  Wi-Fi Gateway: Arduino Mega 2560 ↔ Node.js Backend
 *  CSE 4326 — IoT-Based Smart Greenhouse Automation
 * ============================================================
 *  Board:           NodeMCU 1.0 (ESP-12E Module)
 *  Upload Speed:    115200
 *  Serial to Mega:  9600 baud
 *
 *  Library required (install via Manage Libraries):
 *    ArduinoJson by Benoit Blanchon
 *  Built-in (no install needed):
 *    ESP8266WiFi, ESP8266WebServer, ESP8266HTTPClient, WiFiClient
 * ============================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// ── Configuration ─────────────────────────────────────────────
const char* WIFI_SSID     = "UIU-Faculty-Staff";
const char* WIFI_PASSWORD = "UIU#9876";
const char* BACKEND_HOST  = "10.10.205.116";
const int   BACKEND_PORT  = 5000;
const char* SENSOR_ENDPOINT = "/api/sensors";
const char* SYSTEM_ENDPOINT = "/api/system/status";

// ── Globals ───────────────────────────────────────────────────
ESP8266WebServer server(80);
WiFiClient wifiClient;

unsigned long lastHeartbeatTime    = 0;
const unsigned long HEARTBEAT_INTERVAL = 15000;

// Cached values from Arduino Mega (no LDR)
float currentTemp       = 0.0;
float currentHumidity   = 0.0;
float currentSoil       = 0.0;
int   currentAirQuality = 0;
bool  pumpStatus        = false;
bool  fanStatus         = false;
bool  lightStatus       = false;

// ── POST sensor JSON to backend ───────────────────────────────
void postSensorDataToBackend(const String& jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  String url = "http://" + String(BACKEND_HOST) + ":" +
               String(BACKEND_PORT) + SENSOR_ENDPOINT;
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);
  int code = http.POST(jsonPayload);
  if (code > 0) {
    Serial.printf("[HTTP POST] Code: %d\n", code);
  } else {
    Serial.printf("[HTTP POST] Failed: %s\n", http.errorToString(code).c_str());
  }
  http.end();
}

// ── POST heartbeat to backend ─────────────────────────────────
void postHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  String url = "http://" + String(BACKEND_HOST) + ":" +
               String(BACKEND_PORT) + SYSTEM_ENDPOINT;
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");
  StaticJsonDocument<256> doc;
  doc["arduino_status"] = "connected";
  doc["esp8266_status"] = "online";
  doc["wifi_status"]    = "connected";
  doc["esp8266_ip"]     = WiFi.localIP().toString();
  doc["wifi_signal"]    = WiFi.RSSI();
  String body; serializeJson(doc, body);
  int code = http.POST(body);
  Serial.printf("[Heartbeat] Code: %d\n", code);
  http.end();
}

// ── Local web server handlers ─────────────────────────────────
void handlePing() {
  StaticJsonDocument<128> doc;
  doc["status"] = "ok";
  doc["device"] = "esp8266_bridge";
  doc["uptime"] = millis() / 1000;
  String r; serializeJson(doc, r);
  server.send(200, "application/json", r);
}

void handleStatus() {
  StaticJsonDocument<384> doc;
  doc["device"] = "greenhouse_controller";
  doc["ip"]     = WiFi.localIP().toString();
  doc["rssi"]   = WiFi.RSSI();
  JsonObject s = doc.createNestedObject("sensors");
  s["temperature"]   = currentTemp;
  s["humidity"]      = currentHumidity;
  s["soil_moisture"] = currentSoil;
  s["air_quality"]   = currentAirQuality;
  JsonObject a = doc.createNestedObject("actuators");
  a["water_pump"]  = pumpStatus  ? "ON" : "OFF";
  a["cooling_fan"] = fanStatus   ? "ON" : "OFF";
  a["light"]       = lightStatus ? "ON" : "OFF";
  String r; serializeJson(doc, r);
  server.send(200, "application/json", r);
}

// Forward actuator command from backend to Arduino Mega
void handleCommand() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"Missing body\"}");
    return;
  }
  String body = server.arg("plain");
  StaticJsonDocument<256> doc;
  if (deserializeJson(doc, body)) {
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }
  Serial.println(body);  // Forward to Arduino Mega via Serial
  server.send(200, "application/json",
              "{\"success\":true,\"forwarded_to\":\"arduino_mega\"}");
}

// Forward settings update from backend to Arduino Mega
void handleSettings() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"Missing body\"}");
    return;
  }
  Serial.println(server.arg("plain"));  // Forward to Mega
  server.send(200, "application/json",
              "{\"success\":true,\"message\":\"Settings forwarded to Mega\"}");
}

// ── Setup ─────────────────────────────────────────────────────
void setup() {
  Serial.begin(9600);   // UART to Arduino Mega at 9600 baud
  delay(500);
  Serial.println("\n[ESP8266] Smart Greenhouse Gateway Starting...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WiFi] Connecting to ");
  Serial.print(WIFI_SSID);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 40) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected!");
    Serial.print("[WiFi] ESP8266 IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n[WiFi] FAILED — running offline.");
  }

  server.on("/ping",     HTTP_GET,  handlePing);
  server.on("/status",   HTTP_GET,  handleStatus);
  server.on("/command",  HTTP_POST, handleCommand);
  server.on("/settings", HTTP_POST, handleSettings);
  server.begin();

  Serial.println("[HTTP] Web server active on port 80");
  Serial.print("[HTTP] Test URL: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/status");
}

// ── Main Loop ─────────────────────────────────────────────────
void loop() {
  server.handleClient();

  // Read JSON line from Arduino Mega via Serial
  if (Serial.available()) {
    String incoming = Serial.readStringUntil('\n');
    incoming.trim();
    if (incoming.startsWith("{") && incoming.endsWith("}")) {
      StaticJsonDocument<384> doc;
      if (!deserializeJson(doc, incoming)) {
        currentTemp       = doc["temperature"]   | currentTemp;
        currentHumidity   = doc["humidity"]      | currentHumidity;
        currentSoil       = doc["soil_moisture"] | currentSoil;
        currentAirQuality = doc["air_quality"]   | currentAirQuality;
        pumpStatus        = doc["pumpStatus"]    | pumpStatus;
        fanStatus         = doc["fanStatus"]     | fanStatus;
        lightStatus       = doc["lightStatus"]   | lightStatus;
        postSensorDataToBackend(incoming);  // POST to backend immediately
      }
    }
  }

  // Heartbeat every 15 seconds
  if (millis() - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
    lastHeartbeatTime = millis();
    postHeartbeat();
  }
}
```

### D3 — Expected Serial Monitor Output (9600 baud)

After uploading to ESP8266, open **Tools → Serial Monitor** at **9600 baud**:

```
[ESP8266] Smart Greenhouse Gateway Starting...
[WiFi] Connecting to UIU-Faculty-Staff........
[WiFi] Connected!
[WiFi] ESP8266 IP: 10.10.205.XXX
[WiFi] Signal: -58 dBm
[HTTP] Web server active on port 80
[HTTP] Test URL: http://10.10.205.XXX/status
[HTTP POST] Code: 201
[HTTP POST] Code: 201
[Heartbeat] Code: 200
```

> 📌 Write down `10.10.205.XXX` — this is the ESP8266's IP.
> You need it to test the ESP8266 locally in the browser.

---

## PART E — STEP-BY-STEP: FROM USB TO LIVE DASHBOARD

Follow these steps **in this exact order**:

---

### STEP 1 — Start XAMPP MySQL

1. Open **XAMPP Control Panel**
2. Click **Start** next to **MySQL**
3. Wait until the indicator turns **green**

---

### STEP 2 — Start Node.js Backend

Open **Terminal 1** (Command Prompt):

```bash
cd C:\xampp\htdocs\react-dashboard-micro\backend
node server.js
```

Expected output:
```
[DB] ✅ Connected to greenhouse_db successfully.
[DB] Tables initialized successfully.
[Server] ✅ Running at http://localhost:5000
```

> If you see `[DB] ❌ Could not connect` → MySQL is not running. Go back to Step 1.

---

### STEP 3 — Start React Dashboard

Open **Terminal 2** (a second Command Prompt):

```bash
cd C:\xampp\htdocs\react-dashboard-micro\smart-greenhouse
npm run dev
```

Expected output:
```
VITE v8.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

### STEP 4 — Upload Code to Arduino Mega

1. Connect **Arduino Mega** to laptop via USB
2. Open Arduino IDE
3. New sketch → delete existing code → paste **Part C code**
4. **Tools → Board → Arduino Mega or Mega 2560**
5. **Tools → Processor → ATmega2560**
6. **Tools → Port** → select Arduino Mega COM port
7. Click **→ Upload**
8. Wait for **"Done uploading."**
9. Open **Tools → Serial Monitor** at **9600 baud**
10. Confirm JSON lines appear every 3 seconds:
    ```
    {"temperature":28.5,"humidity":65.2,"soil_moisture":45.0,"air_quality":82,...}
    ```

---

### STEP 5 — Upload Code to ESP8266

1. Disconnect Arduino Mega USB (avoids COM port confusion)
2. Connect **ESP8266** to laptop via USB
3. Open Arduino IDE → New sketch → paste **Part D code**
4. Confirm these 3 lines are correct:
   ```cpp
   const char* WIFI_SSID     = "UIU-Faculty-Staff";
   const char* WIFI_PASSWORD = "UIU#9876";
   const char* BACKEND_HOST  = "10.10.205.116";
   ```
5. **Tools → Board → NodeMCU 1.0 (ESP-12E Module)**
6. **Tools → Upload Speed → 115200**
7. **Tools → Port** → select ESP8266 COM port
8. Click **→ Upload**
9. Wait for **"Done uploading."**
10. Open **Tools → Serial Monitor** at **9600 baud**
11. Confirm:
    ```
    [WiFi] Connected!
    [WiFi] ESP8266 IP: 10.10.205.XXX
    [HTTP] Web server active on port 80
    ```

> 📌 Write down the ESP8266 IP address shown on screen.

---

### STEP 6 — Wire Arduino Mega and ESP8266 Together

With both boards **not connected to USB**, wire them:

| From | To |
|------|----|
| Arduino Mega **TX1 (Pin 18)** | ESP8266 **RX** |
| Arduino Mega **RX1 (Pin 19)** | ESP8266 **TX** |
| Arduino Mega **GND** | ESP8266 **GND** |

Then power both:
- Arduino Mega → USB to laptop
- ESP8266 → USB to laptop (or power from Mega's 5V pin if supported)

After powering on, Arduino sends JSON every 3 seconds → ESP8266 receives and POSTs to backend.

---

### STEP 7 — Verify Everything is Working

**Test 1 — Backend received data:**
Open browser → `http://localhost:5000/api/sensors/latest`

Expected:
```json
{
  "id": 1,
  "temperature": 28.5,
  "humidity": 65.2,
  "soil_moisture": 45.0,
  "air_quality": 82,
  "created_at": "2024-xx-xxTxx:xx:xx.000Z"
}
```
Refresh the page — `created_at` should update every 3 seconds. ✅

**Test 2 — ESP8266 local status:**
Open browser → `http://10.10.205.XXX/status`

Expected:
```json
{
  "device": "greenhouse_controller",
  "sensors": { "temperature": 28.5, "humidity": 65.2, ... },
  "actuators": { "water_pump": "OFF", "cooling_fan": "OFF", "light": "OFF" }
}
```

**Test 3 — React Dashboard:**
Open browser → `http://localhost:5173/`

Expected — all 4 sensor cards show live values:
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Temperature  │  │   Humidity   │  │ Soil Moisture│  │  Air Quality │
│   28.5 °C    │  │   65.2 %     │  │   45.0 %     │  │   82 AQI     │
│   Normal ✅  │  │   Normal ✅  │  │   Normal ✅  │  │   Good ✅    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

Values **auto-update every 5 seconds** without refreshing the page. ✅

---

## PART F — COMPLETE DATA FLOW DIAGRAM

```
┌────────────────────────────────────────────────────────────────────┐
│  SENSORS (connected to Arduino Mega)                               │
│                                                                    │
│  DHT22      → pin 2 (temperature + humidity)                      │
│  Soil sensor → A0  (moisture %)                                   │
│  MQ135      → A1  (air quality AQI)                               │
└──────────────────────────────┬─────────────────────────────────────┘
                               │  every 3 seconds
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│  ARDUINO MEGA 2560                                                 │
│  • reads DHT22, soil moisture, MQ135                              │
│  • applies automation rules automatically                         │
│  • builds JSON and sends via Serial1 TX1 (pin 18) at 9600 baud   │
│                                                                    │
│  JSON sent:                                                        │
│  { "temperature":28.5, "humidity":65.2, "soil_moisture":45.0,    │
│    "air_quality":82, "pumpStatus":false, "fanStatus":false,       │
│    "lightStatus":false }                                          │
└──────────────────────────────┬─────────────────────────────────────┘
                               │  UART  TX1(pin18) → ESP8266 RX
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│  ESP8266 NodeMCU V3                                                │
│  • receives JSON from Mega via Serial (9600 baud)                 │
│  • parses and stores sensor values                                │
│  • POSTs JSON to backend immediately                              │
│  • sends heartbeat to backend every 15 seconds                   │
│  • hosts local HTTP server on port 80                             │
└──────────────────────────────┬─────────────────────────────────────┘
                               │  Wi-Fi POST
                               │  http://10.10.205.116:5000/api/sensors
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│  YOUR LAPTOP  (10.10.205.116)                                     │
│                                                                    │
│  Node.js Backend (port 5000)                                       │
│  └─ receives POST → validates → saves to MySQL                    │
│                                                                    │
│  MySQL  greenhouse_db.sensor_readings                              │
│  └─ temperature, humidity, soil_moisture, air_quality, timestamp  │
│                                                                    │
│  React Dashboard (port 5173)                                       │
│  └─ polls GET /api/sensors/latest every 5 seconds                 │
│  └─ updates all sensor cards on screen                           │
└────────────────────────────────────────────────────────────────────┘

━━━ CONTROL DIRECTION (Dashboard → Actuators) ━━━━━━━━━━━━━━━━━━━━━━
React Dashboard
→ POST http://localhost:5000/api/actuators/control
→ Node.js Backend
→ POST http://10.10.205.XXX/command
→ ESP8266
→ Serial.println(json) to Arduino Mega via Serial
→ Arduino Mega reads command
→ Sets relay pin HIGH or LOW
→ Water Pump / Fan / Growth Light turns ON or OFF
```

---

## PART G — AUTOMATION RULES (Arduino Mega auto-logic)

These rules run automatically on the Arduino Mega without any user action:

| Sensor Condition | Arduino Action | Can be overridden? |
|-----------------|---------------|-------------------|
| Soil raw > 600 | Water pump **ON** | Yes — from dashboard (MANUAL mode) |
| Soil raw ≤ 600 | Water pump **OFF** | Yes |
| Temperature > 52°C | Fan **ON**, Light **OFF** | Yes |
| Temperature < 25°C | Light **ON**, Fan **OFF** | Yes |
| Temperature 25–52°C | Fan **OFF**, Light **OFF** | Yes |
| Air quality > 100 | Fan **ON** (regardless of temp) | Yes |
| Air bad OR temp < 25°C | Alert LED **ON** | No (always auto) |

> Thresholds can be changed from the **Automation page** on the dashboard.
> New settings are sent: React → Backend → ESP8266 → Arduino Mega.

---

## PART H — ALL URLS QUICK REFERENCE

| What to check | URL |
|--------------|-----|
| React Dashboard | http://localhost:5173/ |
| Backend health | http://localhost:5000/health |
| Latest sensor reading | http://localhost:5000/api/sensors/latest |
| Actuator status | http://localhost:5000/api/actuators/status |
| System status | http://localhost:5000/api/system/status |
| ESP8266 status | http://10.10.205.XXX/status |
| ESP8266 ping | http://10.10.205.XXX/ping |

---

## PART I — RUN COMMANDS

Open **two separate terminal windows**:

**Terminal 1 — Backend (keep running):**
```bash
cd C:\xampp\htdocs\react-dashboard-micro\backend
node server.js
```

**Terminal 2 — React Dashboard (keep running):**
```bash
cd C:\xampp\htdocs\react-dashboard-micro\smart-greenhouse
npm run dev
```

Then open: **http://localhost:5173/**

---

## PART J — TROUBLESHOOTING

### ❌ Serial Monitor shows garbage / random characters
- Set baud rate to **9600** for Arduino Mega
- Set baud rate to **9600** for ESP8266

### ❌ ESP8266 receives nothing from Arduino Mega
- Check wiring: Mega **TX1 pin 18** → ESP8266 **RX**
- Check wiring: Mega **RX1 pin 19** → ESP8266 **TX**
- Check: Mega **GND** → ESP8266 **GND** (shared ground is required)
- Both boards must use **9600 baud**

### ❌ ESP8266 Serial Monitor shows `[HTTP POST] Failed`
- Is backend running? Check Terminal 1 shows `Running at http://localhost:5000`
- Is XAMPP MySQL running?
- Has your laptop IP changed? Run `ipconfig` → check Wi-Fi IPv4 Address
- If IP changed from `10.10.205.116`, update `BACKEND_HOST` and re-upload

### ❌ Temperature shows NaN or 0
- DHT22 must be on Arduino Mega **Digital pin 2** (not analog)
- DHT22 VCC → **5V**, GND → **GND**, DATA → **pin 2**
- If using DHT11, change `#define DHTTYPE DHT22` to `#define DHTTYPE DHT11`
- DHT22 needs 2 seconds warmup — first reading may be 0, next will be correct

### ❌ Soil moisture shows wrong values
- Dry soil = higher raw value (around 800–900)
- Wet soil = lower raw value (around 300–400)
- The code converts raw → percent: 1023 = 0%, 300 = 100%

### ❌ Wi-Fi not connecting (dots keep printing)
- SSID: `UIU-Faculty-Staff` — exact spelling, case-sensitive
- Password: `UIU#9876` — check capitals
- ESP8266 only supports **2.4 GHz** — will not work on 5 GHz

### ❌ Dashboard shows `—` for all values
1. Is backend running? → `node server.js`
2. Is XAMPP MySQL running?
3. Is ESP8266 sending? → check Serial Monitor for `[HTTP POST] Code: 201`
4. Check `smart-greenhouse/.env` → must have `VITE_USE_MOCK_DATA=false`
5. Restart React after changing `.env`

### ❌ Upload fails on ESP8266 with "espcomm_upload_mem failed"
- Hold **FLASH/BOOT** button on ESP8266
- While holding: click **→ Upload** in Arduino IDE
- Release button when you see **"Connecting..."** in the output

### ❌ No COM port visible for ESP8266
- Install CH340 driver: **https://sparks.gogo.co.nz/ch340.html**
- Restart Arduino IDE

### ❌ Relays not switching
- Check relay signal wire to correct pin (22, 23, 25)
- These are **Active-LOW** relays — LOW = ON, HIGH = OFF
- Verify relay VCC connected to 5V and GND connected to GND

---

## FINAL CHECKLIST

```
── HARDWARE ──────────────────────────────────────────────────────
[ ] DHT22 DATA → Arduino Mega Digital Pin 2
[ ] DHT22 VCC  → 5V
[ ] DHT22 GND  → GND
[ ] Soil Moisture signal → A0
[ ] MQ135 Gas signal → A1
[ ] Water Pump relay IN → pin 22
[ ] Fan relay IN → pin 23
[ ] Alert LED → pin 24
[ ] Light relay IN → pin 25
[ ] LCD SDA → pin 20 (SDA)
[ ] LCD SCL → pin 21 (SCL)
[ ] Arduino Mega TX1 (pin 18) → ESP8266 RX
[ ] Arduino Mega RX1 (pin 19) → ESP8266 TX
[ ] Arduino Mega GND → ESP8266 GND  (shared ground)

── LIBRARIES ─────────────────────────────────────────────────────
[ ] DHT sensor library by Adafruit installed
[ ] Adafruit Unified Sensor installed
[ ] LiquidCrystal I2C by Frank de Brabander installed
[ ] ArduinoJson by Benoit Blanchon installed
[ ] ESP8266 board package installed

── ARDUINO MEGA ──────────────────────────────────────────────────
[ ] Board: Arduino Mega or Mega 2560
[ ] Processor: ATmega2560
[ ] Correct COM port selected
[ ] Code from Part C uploaded — "Done uploading."
[ ] Serial Monitor at 9600 baud shows JSON every 3 seconds

── ESP8266 ───────────────────────────────────────────────────────
[ ] WIFI_SSID     = "UIU-Faculty-Staff"                 ✅ set
[ ] WIFI_PASSWORD = "UIU#9876"      ✅ set
[ ] BACKEND_HOST  = "10.10.205.116"      ✅ set
[ ] Board: NodeMCU 1.0 (ESP-12E Module)
[ ] Upload Speed: 115200
[ ] Correct COM port selected
[ ] Code from Part D uploaded — "Done uploading."
[ ] Serial Monitor at 9600 baud shows:
    [WiFi] Connected!
    ESP8266 IP: 10.10.205.XXX
    [HTTP POST] Code: 201  (every 3 seconds)

── LAPTOP ────────────────────────────────────────────────────────
[ ] XAMPP MySQL running (green in control panel)
[ ] node server.js running → [DB] Connected to greenhouse_db
[ ] npm run dev running → http://localhost:5173/
[ ] http://localhost:5000/api/sensors/latest returns real JSON
[ ] http://localhost:5173/ shows live sensor values
[ ] Temperature, Humidity, Soil Moisture, Air Quality all update
[ ] Values change every 5 seconds without page refresh
[ ] smart-greenhouse/.env → VITE_USE_MOCK_DATA=false
```

---

*File: `reshat.md` | Project: Smart Greenhouse CSE 4326*
*Hardware: Arduino Mega 2560 + ESP8266 NodeMCU V3 + DHT22 + Soil Moisture + MQ135*
