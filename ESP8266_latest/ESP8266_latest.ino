/*
 * ============================================================
 *  Smart Greenhouse — ESP8266 NodeMCU V3
 *  Gateway / Bridge: Arduino Mega 2560 ↔ Node.js Backend
 *  CSE 4326 — IoT-Based Smart Greenhouse Automation
 * ============================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>

// Option A: SoftwareSerial on D7 (GPIO13 RX) and D8 (GPIO15 TX) — leaves USB Serial open
#define WIRING_OPTION A

#if WIRING_OPTION == A
  SoftwareSerial megaSerial(13, 15);
  #define MEGA_SERIAL megaSerial
  #define DEBUG_SERIAL Serial
#else
  #define MEGA_SERIAL Serial
  #define DEBUG_SERIAL Serial
#endif

// ── Wi-Fi & Backend Configuration ────────────────────────────
const char* WIFI_SSID     = "Roy";
const char* WIFI_PASSWORD = "Blackdevil0007";
const char* BACKEND_HOST  = "192.168.68.106";
const int   BACKEND_PORT  = 5000;

ESP8266WebServer server(80);
WiFiClient wifiClient;

unsigned long lastHeartbeatTime = 0;
const unsigned long HEARTBEAT_INTERVAL = 15000;

float currentTemp       = 0.0;
float currentHumidity   = 0.0;
float currentSoil       = 0.0;
int   currentAirQuality = 0;
bool  pumpStatus        = false;
bool  fanStatus         = false;
bool  lightStatus       = false;
bool  dataReceived      = false;

void postSensorData(float temp, float hum, float soil, int airQ) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = "http://" + String(BACKEND_HOST) + ":" + String(BACKEND_PORT) + "/api/sensors";
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);

  String body = "{";
  body += "\"temperature\":"   + String(temp, 1) + ",";
  body += "\"humidity\":"      + String(hum, 1)  + ",";
  body += "\"soil_moisture\":" + String(soil, 1) + ",";
  body += "\"air_quality\":"   + String(airQ);
  body += "}";

  DEBUG_SERIAL.println("[POST] " + body);
  int code = http.POST(body);
  if (code == 200 || code == 201) {
    DEBUG_SERIAL.printf("[POST] ✅ Success (%d)\n", code);
  } else {
    DEBUG_SERIAL.printf("[POST] ❌ Failed (%s)\n", http.errorToString(code).c_str());
  }
  http.end();
}

void postActuatorStates() {
  if (WiFi.status() != WL_CONNECTED) return;

  struct { const char* device; bool state; } actuators[] = {
    {"water_pump",      pumpStatus},
    {"cooling_fan",     fanStatus},
    {"ventilation_fan", lightStatus},
  };

  for (auto& act : actuators) {
    HTTPClient http;
    String url = "http://" + String(BACKEND_HOST) + ":" + String(BACKEND_PORT) + "/api/actuators/esp-update";
    http.begin(wifiClient, url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(3000);
    String body = "{\"device\":\"" + String(act.device) + "\",\"status\":\"" + (act.state ? "ON" : "OFF") + "\",\"mode\":\"AUTO\"}";
    http.POST(body);
    http.end();
    delay(30);
  }
}

void postHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = "http://" + String(BACKEND_HOST) + ":" + String(BACKEND_PORT) + "/api/system/status";
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);

  StaticJsonDocument<256> doc;
  doc["arduino_status"] = dataReceived ? "connected" : "disconnected";
  doc["esp8266_status"] = "online";
  doc["wifi_status"]    = "connected";
  doc["esp8266_ip"]     = WiFi.localIP().toString();
  doc["wifi_signal"]    = WiFi.RSSI();
  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  DEBUG_SERIAL.printf("[Heartbeat] Code: %d\n", code);
  http.end();
}

void handlePing() {
  StaticJsonDocument<128> doc;
  doc["status"]        = "ok";
  doc["data_received"] = dataReceived;
  doc["uptime"]        = millis() / 1000;
  String r; serializeJson(doc, r);
  server.send(200, "application/json", r);
}

void handleStatus() {
  StaticJsonDocument<384> doc;
  doc["ip"]   = WiFi.localIP().toString();
  doc["rssi"] = WiFi.RSSI();
  doc["data_from_mega"] = dataReceived;
  JsonObject s = doc.createNestedObject("sensors");
  s["temperature"]   = currentTemp;
  s["humidity"]      = currentHumidity;
  s["soil_moisture"] = currentSoil;
  s["air_quality"]   = currentAirQuality;
  JsonObject a = doc.createNestedObject("actuators");
  a["water_pump"]      = pumpStatus  ? "ON" : "OFF";
  a["cooling_fan"]     = fanStatus   ? "ON" : "OFF";
  a["ventilation_fan"] = lightStatus ? "ON" : "OFF";
  String r; serializeJson(doc, r);
  server.send(200, "application/json", r);
}

void handleCommand() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"no body\"}");
    return;
  }
  String body = server.arg("plain");
  MEGA_SERIAL.println(body);
  DEBUG_SERIAL.println("[CMD→Mega] " + body);
  server.send(200, "application/json", "{\"success\":true}");
}

void handleSettings() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"no body\"}");
    return;
  }
  String body = server.arg("plain");
  MEGA_SERIAL.println(body);
  DEBUG_SERIAL.println("[SET→Mega] " + body);
  server.send(200, "application/json", "{\"success\":true}");
}

void processArduinoData(const String& line) {
  if (!line.startsWith("{") || !line.endsWith("}")) return;

  DEBUG_SERIAL.println("[Mega→] " + line);

  StaticJsonDocument<384> doc;
  if (deserializeJson(doc, line)) return;

  currentTemp       = doc["temperature"]   | currentTemp;
  currentHumidity   = doc["humidity"]      | currentHumidity;
  currentSoil       = doc["soil_moisture"] | currentSoil;
  currentAirQuality = doc["air_quality"]   | currentAirQuality;
  pumpStatus        = doc["pumpStatus"]    | pumpStatus;
  fanStatus         = doc["fanStatus"]     | fanStatus;
  lightStatus       = doc["lightStatus"]   | lightStatus;
  dataReceived      = true;

  postSensorData(currentTemp, currentHumidity, currentSoil, currentAirQuality);
  postActuatorStates();
}

void setup() {
  DEBUG_SERIAL.begin(115200);
  delay(200);
  DEBUG_SERIAL.println("\n[ESP8266] Smart Greenhouse Gateway Starting...");

#if WIRING_OPTION == A
  megaSerial.begin(9600);
#endif

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) {
    delay(500);
    DEBUG_SERIAL.print(".");
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    DEBUG_SERIAL.println("\n[WiFi] Connected! IP: " + WiFi.localIP().toString());
  }

  server.on("/ping",     HTTP_GET,  handlePing);
  server.on("/status",   HTTP_GET,  handleStatus);
  server.on("/command",  HTTP_POST, handleCommand);
  server.on("/settings", HTTP_POST, handleSettings);
  server.begin();
}

void loop() {
  server.handleClient();

  while (MEGA_SERIAL.available()) {
    String line = MEGA_SERIAL.readStringUntil('\n');
    line.trim();
    if (line.length() > 2) {
      processArduinoData(line);
    }
  }

  if (millis() - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
    lastHeartbeatTime = millis();
    postHeartbeat();
  }
}