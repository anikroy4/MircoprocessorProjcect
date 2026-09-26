/*
 * ============================================================
 *  Smart Greenhouse — Arduino Mega 2560
 *  CSE 4326 — IoT-Based Smart Greenhouse Automation
 * ============================================================
 *  Sensors:    DHT22 (Digital Pin 2), Soil Moisture (Analog A0), MQ135 (Analog A1)
 *  Actuators:  Water Pump (Pin 22), Fan (Pin 23), Alert LED (Pin 24), Light (Pin 25)
 *  Display:    I2C LCD 16x2 at address 0x27 (SDA Pin 20, SCL Pin 21)
 *  ESP8266:    Serial1 — TX1 Pin 18 (to ESP8266 RX/D7) / RX1 Pin 19 (from ESP8266 TX/D8) — 9600 baud
 * ============================================================
 */

#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// ── Pin Configuration ────────────────────────────────────────
const int moistureSensorPin = A0;   // Soil moisture sensor (Analog A0)
const int mq135Pin          = A1;   // MQ135 gas/air quality sensor (Analog A1)
const int pumpRelayPin      = 22;   // Water pump relay (Digital 22)
const int fanRelayPin       = 23;   // Cooling/ventilation fan relay (Digital 23)
const int redLedPin         = 24;   // Alert red LED (Digital 24)
const int lightRelayPin     = 25;   // Growth light / heater relay (Digital 25)

#define DHTPIN   2                  // DHT22 data pin (Digital 2)
#define DHTTYPE  DHT22              // Change to DHT11 if using DHT11

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

#define RELAY_ON  LOW               // Active-LOW relay: LOW = ON
#define RELAY_OFF HIGH              // Active-LOW relay: HIGH = OFF

// ── Automation Thresholds (Updated live by Dashboard Settings) ───────────────
float soilMinThreshold    = 30.0;   // Soil % < 30% → pump ON
float soilMaxThreshold    = 70.0;   // Soil % > 70% → pump OFF
float lowTempThreshold    = 25.0;   // Temp < 25°C → cold → light ON
float highTempThreshold   = 35.0;   // Temp > 35°C → hot → cooling fan ON
int   airQualityThreshold = 70;     // Air > 70 AQI → poor air → fan ON + alert LED

// ── Device Mode & State ──────────────────────────────────────
bool pumpManualMode  = false;       // false = AUTO, true = MANUAL
bool fanManualMode   = false;
bool lightManualMode = false;
bool pumpState       = false;
bool fanState        = false;
bool lightState      = false;
bool ledState        = false;

// ── Sensor Data Cache ────────────────────────────────────────
float lastTemperature = 25.0;
float lastHumidity    = 60.0;
int   lastMoistureRaw = 650;
float lastSoilPercent = 50.0;
int   lastAirQuality  = 45;
String lastAirStatus  = "Good";

// ── Timers ───────────────────────────────────────────────────
unsigned long lastSensorSendTime = 0;
const unsigned long SENSOR_SEND_INTERVAL = 3000;  // Telemetry every 3 seconds
unsigned long lastLcdSwitchTime = 0;
int lcdScreenIndex = 0;

// Non-blocking serial command buffer
String megaRxBuffer = "";

// ── Handle incoming command / settings from Dashboard (via ESP8266 → Serial1) ───
void handleIncomingCommand(const String& jsonStr) {
  StaticJsonDocument<384> doc;
  DeserializationError err = deserializeJson(doc, jsonStr);
  if (err) return;

  // 1. Actuator Manual Override Command
  if (doc.containsKey("device")) {
    const char* device = doc["device"];
    const char* action = doc["action"];
    const char* mode   = doc["mode"] | "MANUAL";
    bool isAuto = (mode != NULL && strcmp(mode, "AUTO") == 0);

    if (device != NULL) {
      if (strcmp(device, "water_pump") == 0 || strcmp(device, "pump") == 0) {
        pumpManualMode = !isAuto;
        if (!isAuto && action != NULL) {
          pumpState = (strcmp(action, "ON") == 0);
          digitalWrite(pumpRelayPin, pumpState ? RELAY_ON : RELAY_OFF);
        }
      }
      else if (strcmp(device, "cooling_fan") == 0 ||
               strcmp(device, "ventilation_fan") == 0 ||
               strcmp(device, "fan") == 0) {
        fanManualMode = !isAuto;
        if (!isAuto && action != NULL) {
          fanState = (strcmp(action, "ON") == 0);
          digitalWrite(fanRelayPin, fanState ? RELAY_ON : RELAY_OFF);
        }
      }
      else if (strcmp(device, "light") == 0 || strcmp(device, "heater") == 0) {
        lightManualMode = !isAuto;
        if (!isAuto && action != NULL) {
          lightState = (strcmp(action, "ON") == 0);
          digitalWrite(lightRelayPin, lightState ? RELAY_ON : RELAY_OFF);
        }
      }
    }
  }

  // 2. Settings & Threshold Updates from Dashboard
  if (doc.containsKey("soil_min")) {
    soilMinThreshold = doc["soil_min"].as<float>();
  }
  if (doc.containsKey("soil_max")) {
    soilMaxThreshold = doc["soil_max"].as<float>();
  }
  if (doc.containsKey("temperature_low")) {
    lowTempThreshold = doc["temperature_low"].as<float>();
  }
  if (doc.containsKey("temperature_high")) {
    highTempThreshold = doc["temperature_high"].as<float>();
  }
  if (doc.containsKey("air_quality_threshold")) {
    airQualityThreshold = doc["air_quality_threshold"].as<int>();
  }

  Serial.println("[Mega Settings] Updated from ESP8266.");
}

void checkIncomingSerial() {
  while (Serial1.available() > 0) {
    char c = (char)Serial1.read();
    if (c == '\n') {
      megaRxBuffer.trim();
      if (megaRxBuffer.length() > 2) {
        handleIncomingCommand(megaRxBuffer);
      }
      megaRxBuffer = "";
    } else if (c != '\r') {
      megaRxBuffer += c;
      if (megaRxBuffer.length() > 500) {
        megaRxBuffer = "";
      }
    }
  }
}

// ── Read Sensors + Apply Autonomous Rules with Settings ─────────
void readSensorsAndApplyAutomation() {
  int rawMoist = analogRead(moistureSensorPin);
  if (rawMoist > 0) lastMoistureRaw = rawMoist;

  int rawAir = analogRead(mq135Pin);
  if (rawAir > 0) lastAirQuality = rawAir;

  bool airBad = (lastAirQuality > airQualityThreshold);
  lastAirStatus = airBad ? "BAD!" : "Good";

  // Calibrated Soil Moisture Percentage (0 - 100%)
  lastSoilPercent = (float)map(constrain(lastMoistureRaw, 300, 1023), 1023, 300, 0, 100);

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) lastTemperature = t;
  if (!isnan(h)) lastHumidity    = h;

  // ── Automation 1: Soil Moisture Control (with Hysteresis) ──
  if (!pumpManualMode) {
    if (lastSoilPercent < soilMinThreshold) {
      pumpState = true;  // Soil dry → pump ON
    } else if (lastSoilPercent > soilMaxThreshold) {
      pumpState = false; // Soil hydrated → pump OFF
    }
    digitalWrite(pumpRelayPin, pumpState ? RELAY_ON : RELAY_OFF);
  }

  // ── Automation 2 & 3: Temperature & Climate Control ────────
  if (!isnan(lastTemperature)) {
    if (lastTemperature > highTempThreshold) {
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

  // ── Alert LED ───────────────────────────────────────────────
  ledState = airBad || (!isnan(lastTemperature) && lastTemperature < lowTempThreshold);
  digitalWrite(redLedPin, ledState ? HIGH : LOW);
}

// ── Send JSON to ESP8266 via Serial1 ────────────────────────
void sendTelemetryToESP8266() {
  String json = "{";
  json += "\"temperature\":"   + String(lastTemperature, 1) + ",";
  json += "\"humidity\":"      + String(lastHumidity, 1)    + ",";
  json += "\"soil_moisture\":" + String(lastSoilPercent, 1) + ",";
  json += "\"air_quality\":"   + String(lastAirQuality)     + ",";
  json += "\"pumpStatus\":"    + String(pumpState  ? "true" : "false") + ",";
  json += "\"fanStatus\":"     + String(fanState   ? "true" : "false") + ",";
  json += "\"lightStatus\":"   + String(lightState ? "true" : "false");
  json += "}";

  Serial1.println(json);    // Transmit to ESP8266 via TX1 (Pin 18)
  Serial.println(json);     // Debug echo to USB Serial Monitor
}

// ── LCD Display (Cycles between 2 status screens) ─────────────
void updateLcdDisplay() {
  if (millis() - lastLcdSwitchTime > 2500) {
    lastLcdSwitchTime = millis();
    lcdScreenIndex = (lcdScreenIndex + 1) % 2;
    lcd.clear();

    if (lcdScreenIndex == 0) {
      lcd.setCursor(0, 0);
      lcd.print("T:");
      lcd.print(lastTemperature, 1);
      lcd.print("C H:");
      lcd.print(lastHumidity, 0);
      lcd.print("%");
      lcd.setCursor(0, 1);
      lcd.print("Fan:");
      lcd.print(fanState  ? "ON " : "OFF");
      lcd.print(" Pmp:");
      lcd.print(pumpState ? "ON" : "OFF");
    } else {
      lcd.setCursor(0, 0);
      lcd.print("Soil:");
      lcd.print(lastSoilPercent, 0);
      lcd.print("%");
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
  Serial.begin(9600);      // USB Serial Monitor (9600 baud)
  Serial1.begin(9600);     // Hardware Serial1 to ESP8266 (Pin 18 TX1 / Pin 19 RX1)

  dht.begin();
  Wire.begin();
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Greenhouse Smart");
  lcd.setCursor(0, 1);
  lcd.print("System Loading..");
  delay(1000);

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
  delay(500);
  Serial.println("[Mega] System Ready — broadcasting JSON every 3s via Serial1.");
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

