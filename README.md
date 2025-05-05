# 🌿 IoT MQTT Plant Monitoring Server

This Node.js application connects to an MQTT broker to receive plant monitoring data from IoT sensors, stores the readings in a PostgreSQL database (via Supabase), and synchronizes states and events. It also publishes commands to the MQTT broker when events change.

---

## 🚀 Features

- 🌐 MQTT Client (subscribe/publish)
- 🌱 Sensor Data Handling (luminosity, humidity, temperature, plant ID)
- 💾 Data Insertion into PostgreSQL (via Supabase)
- 🔄 Periodic Synchronization of States and Events
- 📡 Event Change Detection and Command Publishing
- 🧹 Clean and modular structure

---

## 📁 Project Structure

```
.
├── indexSupabase.js       # Main entry point for the Supabase/PostgreSQL server
├── .env                   # Environment variables
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma      # Database schema
├── services/              # Business logic and database operations
│   ├── logService.js      # Handles Log table operations
│   ├── plantStateService.js # Handles PlantState table operations
│   ├── iotDevStateService.js # Handles IotDevState table operations
│   ├── syncService.js     # Periodic synchronization of states and events
│   └── eventChangeService.js # Monitors event changes and publishes commands
├── utils/                 # Utility functions
│   └── mqttClient.js      # MQTT client setup
├── package.json           # Node.js dependencies
└── README.md              # Project documentation
```

---

## ⚙️ Environment Variables (`.env`)

Create a `.env` file in the root directory with the following:

### 🌐 MQTT & Common Settings

```
MQTT_HOST=your.mqtt.broker.com
MQTT_PORT=1883
MQTT_USER=yourMqttUsername
MQTT_PASS=yourMqttPassword
MQTT_TEST_TOPIC=plants/test
MQTT_REAL_TOPIC=plants/real
MQTT_MESSAGE_TOPIC=plants/message
MQTT_COMMAND_TOPIC=plants/command
MQTT_SYNC_TOPIC=plants/sync
SYNC_INTERVAL=30000          # Sync interval in milliseconds (default: 30 seconds)
EVENT_CHECK_INTERVAL=10000   # Event check interval in milliseconds (default: 10 seconds)
```

### 🐘 PostgreSQL via Supabase

```
DATABASE_URL=postgresql://yourUser:yourPassword@yourHost:5432/yourDatabase
```

---

## 📦 Install Dependencies

```
npm install
```

---

## ▶️ Run the Server

### 🐘 Supabase/PostgreSQL

- **Start normally**:
  ```
  npm startSup
  ```

- **Start in dev mode with auto-restart (nodemon)**:
  ```
  npm run devSup
  ```

---

## 📬 Test

This project communicates exclusively over **MQTT** using predefined topics.

### 📤 Publish Test Payload via MQTT

You can test your system by publishing a message to the appropriate MQTT topic. Use an MQTT client such as:

- [MQTT Explorer](https://mqtt-explorer.com/)
- [Mosquitto CLI](https://mosquitto.org/)
- [HiveMQ Web Client](https://www.hivemq.com/demos/websocket-client/)

---

### 🧾 Payload Format For Log (This is sent by the STM32)

```json
{
  "luminosity_state": 75.5,
  "humidity_state": 60.2,
  "temperature": 22.5,
  "plant_id": 1,
  "entryCreation_time": "2025-05-04T15:30:00Z",
  "valve_state": true,
  "pump_state": true,
  "led_intensity_state": 80
}
```

- `entryCreation_time` (mandatory).
- `humidity`, `temperature`, `luminosity`: Float or integer values depending on your sensor precision.
- `plant_id`: Integer ID used to identify the plant/sensor source.

---

### 🧾 Payload Format to Update Error/Online_status (This is sent by the STM32)

#### Option 1: Update IoT_dev_online_status
```json
{
  "iot_dev_id": 1,
  "online_status": true
}
```

#### Option 2: Update error from Plant table
```json
{
  "plant_id": 1,
  "error": false
}
```

### 🚀 Example CLI Command (Using Mosquitto)

```
mosquitto_pub -h <broker_host> -p <broker_port> -u "<username>" -P "<password>" \
  -t "<your_topic>" \
  -m '{"entryCreation_time":"2025-04-22 07:40:00","humidity":82,"temperature":5.6954,"luminosity":2.25,"plant_id":1}'
```

Replace:

- `<broker_host>` → Your MQTT broker address (e.g., `broker.hivemq.com`)
- `<broker_port>` → Typically `1883`
- `<username>` and `<password>` → If your broker requires authentication
- `<your_topic>` → One of the topics defined in your `.env` file (e.g., `plants/test` or `plants/real`)

---

## 🔄 Synchronization

The server periodically synchronizes the states and events of plants and IoT devices and publishes them to the `MQTT_SYNC_TOPIC`.

### Example Synchronization Message

```json
{
  "plantStates": [
    {
      "id": 1,
      "last_updated": "2025-05-04T14:30:00Z",
      "luminosity_state": 75.5,
      "humidity_state": 60.2,
      "valve_state": true,
      "led_intensity_state": 80
    }
  ],
  "plantEvents": [
    {
      "id": 1,
      "last_updated": "2025-05-04T14:30:00Z",
      "luminosity_event": 10.5,
      "humidity_event": 5.2,
      "valve_event": true,
      "led_intensity_event": 50
    }
  ],
  "iotDevStates": [
    {
      "id": 1,
      "last_updated": "2025-05-04T14:30:00Z",
      "pump_state": true
    }
  ],
  "iotDevEvents": [
    {
      "id": 1,
      "last_updated": "2025-05-04T14:30:00Z",
      "pump_event": false
    }
  ]
}
```

---

## 📡 Event Change Detection

The server monitors changes in events and publishes them to the `MQTT_COMMAND_TOPIC`.

### Example Event Change Message

#### Plant Event Change:
```json
{
  "type": "plantEvent",
  "id": 1,
  "changes": {
    "luminosity_event": 10.5,
    "humidity_event": 5.2
  }
}
```

#### IoT Device Event Change:
```json
{
  "type": "iotDevEvent",
  "id": 1,
  "changes": {
    "pump_event": true
  }
}
```

---

## ✅ Verifying Data Insertion

After sending the payload, check your terminal for:

```
✅ 1 record inserted into Log table successfully via <topic>.
```

This confirms that the message was successfully parsed and stored in the database.

---

## 📌 Notes

- MQTT topics should be properly configured to match your device’s publishing topic.
- Time filters (`startDate`, `endDate`, etc.) in Supabase are validated and formatted to PostgreSQL-compatible strings.

---

## 🧬 System Diagram

![GreenhouseDiagram](https://www.plantuml.com/plantuml/png/bLLDRziu4BthLmpQg-CYFXfmqBGssYpIHRjozsGW695ZYuX4QicH7E-lNv2IhAyupjuCSzwyz-PBdnsZvJBFu9ibqgaf7QqL7YpcaNjMka2BESJqJqbQq0zo3Wzqdwc3paap2D9CDcB56VKoG7noJ1qEsfHHObxWmxtW4jbOzm4-Fgf3ob-oaY80W08jAw4Ar0pdgASYGystrm8M4Ma9YNbfM6BIxXf74tE9OV3Soz-FUJ3R9qdLyCyVlxRRfyIQPxADceqyK2ib56f2zgUHz4VyvCXMPCEhHCO4VJb_FSfa0lXcSOyQMyHP7Ges5duxpwqD4vYAxCZgREHj2T_BN4d5fnamvGLPvDBIRATHIyYyQd0r8le4NTPnasQJhYmXDXbfeoHKc5NaPb2O8rbutAnTa_-8J1QACY-YQBLwq8eLPkfVP6NqQkKh6ymFAWGtTtLTO0b_-Jbp3C9eJSAZGdpzV7DpDq8kuLuyQtFCI1ve31fMzN-nZA0NQKZBA6hcnXFqfkLrcdw09sgn5nc6YAd_LpX6nPt8kiIqMgsH4ROMjSkLStNB3jQKHJDZC0cewpOOI1ZO2eYzDNapT72xqqV5AR3AoJ7cnJJ5uagAnIH5w4EjD4J7R2mUwYlHQy-uUEFC3fhCmb8OsP7AYsFh-IXiEIZTRNkJpVbNENRyhf4EALtZ9hZiDdQ0MyBNYURQcgHA2PhlT3oI0IWbIKXEKAVujFuo7rJnR-NAy_O6qVuKmMlxqOvXqBit5ge9zgrrPAkeQjpMefiINjlBsD_A06FJlaBly8v9R-vg3qjOArTaUAh1nZVDfOb1A-iohrPVJPxxaxPv8L4sz-kgVz60g0L5KzkJ5Tx4MxZ_-G02iypxgC7K9eikZjtlGc8N1uwHIzUVmFvNmsEMiAd8da2GPLGQC3UbPZ3xC1N0gP_Pcgwf8eYKnBCBJ-UvzWrkI5rFy3nwxvqUw2s3YwjdwsUPPCgbvwgC3cDtBqQ1NY2sdxB-_hplYvTJPpN74oIr_URMjRyMSzZf3OeKwlqn-uuJKdIWs84vwk09s1HAU5qxRKcGgZgE-U1xCfRefyNqHgFl3MxVG2xUH2wYw3DfMURPVm00 "GreenhouseDiagram")

## 📖 License

MIT © 2025 — Santiago Estrada Bernal

## 📬 Contact

For any inquiries, please contact [santiago.estrada6@eia.edu.co](mailto:santiago.estrada6@eia.edu.co).