#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <MFRC522.h>
#include <SPI.h>

// WiFi credentials
const char* ssid = "your_SSID"; // Replace with your WiFi SSID
const char* password = "your_PASSWORD"; // Replace with your WiFi password

// Server details
const char* serverHost = ""; // Replace with your server IP
const int serverPort = ; // HTTPS port
const char* apiKey = "API-KEY-fd049672fxxxxxxx"; // Replace with your actual API key
const char* deviceId = ""; // Replace with your actual device ID

// RFID pins for ESP8266 (NodeMCU)
#define SS_PIN   D2  // SDA pin (GPIO4)
#define RST_PIN  D1  // RST pin (GPIO5)

// Initialize RFID
MFRC522 rfid(SS_PIN, RST_PIN);

// Debounce settings
unsigned long lastTagRead = 0;
const unsigned long debounceDelay = 2000; // 2 seconds between reads

// Sync settings
unsigned long lastSyncTime = 0;
const unsigned long syncInterval = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);

  // Initialize SPI and RFID
  SPI.begin();
  rfid.PCD_Init();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  // Perform initial device sync
  updateDeviceSync();
}

void loop() {
  // Perform periodic device sync
  if (millis() - lastSyncTime >= syncInterval) {
    updateDeviceSync();
    lastSyncTime = millis();
  }

  // Check for new RFID tags
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  // Debounce check
  if (millis() - lastTagRead < debounceDelay) {
    return;
  }

  // Get tag ID
  String tagID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    tagID += String(rfid.uid.uidByte[i], HEX); // Use HEX to match standard RFID format
  }
  Serial.println("Scanned Tag: " + tagID);

  // Send tag to server
  sendTagToServer(tagID);

  // Update last read time
  lastTagRead = millis();

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

void sendTagToServer(String tagID) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Use this for testing purposes if no certificate is available

    HTTPClient http;
    String serverUrl = "http://" + String(serverHost) + ":" + String(serverPort) + "/createitemx";
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(apiKey)); // Add API key for authentication
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["tag"] = tagID;
    doc["performedBy"] = "RFID Device";

    String jsonString;
    serializeJson(doc, jsonString);

    // Send POST request
    int httpCode = http.POST(jsonString);
    
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response: " + response);
    } else {
      Serial.println("HTTP Error: " + http.errorToString(httpCode));
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected. Cannot send data.");
  }
}

void updateDeviceSync() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Use this for testing purposes if no certificate is available

    HTTPClient http;
    String serverUrl = "http://" + String(serverHost) + "/updatesync/" + String(deviceId);
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(apiKey)); // Add API key for authentication

    // Send POST request
    int httpCode = http.POST("");

    if (httpCode > 0) {
      if (httpCode == HTTP_CODE_OK) {
        Serial.println("Sync updated successfully");
      } else {
        Serial.printf("HTTP error! status: %d\n", httpCode);
      }
    } else {
      Serial.println("Error updating device sync: " + http.errorToString(httpCode));
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected. Cannot update device sync.");
  }
}
