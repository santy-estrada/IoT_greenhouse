# 🌿 IoT MQTT Plant Monitoring Server

This Node.js application connects to an MQTT broker to receive plant monitoring data from IoT sensors, then stores the readings in either a MySQL database (via `index.js`) or a PostgreSQL database on Supabase (via `indexSupabase.js`). It also includes an Express server for POST message testing and a simple dev-mode interface using keyboard shortcuts.

---

## 🚀 Features

- 🌐 MQTT Client (subscribe/publish)
- 🌱 Sensor Data Handling (luminosity, humidity, temperature, plant ID)
- 💾 Data Insertion into:
  - MySQL (local or remote)
  - Supabase PostgreSQL
- 🧪 HTTP POST Testing (`/postmsg`)
- ⌨️ Dev Mode for testing key events (`m`, `g`, `ctrl+c`)
- 🧹 Clean and modular structure

---

## 📁 Project Structure

```
.
├── index.js             # MySQL-based server
├── indexSupabase.js     # Supabase/PostgreSQL server
├── .env                 # Environment variables
├── package.json
```

---

## ⚙️ Environment Variables (`.env`)

Create a `.env` file in the root directory with the following:

### 🌐 MQTT & Common Settings

```env
MQTT_HOST=your.mqtt.broker.com
MQTT_PORT=1883
MQTT_USER=yourMqttUsername
MQTT_PASS=yourMqttPassword
MQTT_TEST_TOPIC=plants/test
MQTT_REAL_TOPIC=plants/real
MQTT_MESSAGE_TOPIC=plants/message
TABLE_NAME=yourTableName
DEVMODE=true
```

### 🐬 MySQL (`index.js`)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourPassword
DB_NAME=yourDatabaseName
```

### 🐘 PostgreSQL via Supabase (`indexSupabase.js`)

```env
PG_URI=postgresql://yourUser:yourPassword@yourHost:5432/yourDatabase
```

---

## 📦 Install Dependencies

```bash
npm install
```

---

## ▶️ Run the Server

### 🐬 MySQL (local or remote)

- **Start normally**:
  ```bash
  npm start
  ```

- **Start in dev mode with auto-restart (nodemon)**:
  ```bash
  npm run dev
  ```

---

### 🐘 Supabase/PostgreSQL

- **Start normally**:
  ```bash
  npm run startSup
  ```

- **Start in dev mode with auto-restart (nodemon)**:
  ```bash
  npm run devSup
  ```


---

## 🧪 Dev Mode Shortcuts

If `DEVMODE=true`, you can use (only for indexSupabase.js):

- `m` — Send test MQTT message
- `g` — Perform a sample query (in `indexSupabase.js`)
- `ctrl+c` — Exit the server

---

## 📬 Test

This project does not expose public HTTP endpoints. All communication is done over **MQTT** using predefined topics.

### 📤 Publish Test Payload via MQTT

You can test your system by publishing a message to the appropriate MQTT topic. Use an MQTT client such as:

- [MQTT Explorer](https://mqtt-explorer.com/)
- [Mosquitto CLI](https://mosquitto.org/)
- [HiveMQ Web Client](https://www.hivemq.com/demos/websocket-client/)

---

### 🧾 Payload Format

```json
{
  "entryCreation_time": "2025-04-22 07:40:00",
  "humidity": 82,
  "temperature": 5.6954,
  "luminosity": 2.25,
  "plant_id": 1
}
```

- `entryCreation_time` (optional): If omitted, the current server time will be used.
- `humidity`, `temperature`, `luminosity`: Float or integer values depending on your sensor precision.
- `plant_id`: Integer ID used to identify the plant/sensor source.

---

### 🚀 Example CLI Command (Using Mosquitto)

```bash
mosquitto_pub -h <broker_host> -p <broker_port> -u "<username>" -P "<password>" \
  -t "<your_topic>" \
  -m '{"entryCreation_time":"2025-04-22 07:40:00","humidity":82,"temperature":5.6954,"luminosity":2.25,"plant_id":1}'
```

Replace:

- `<broker_host>` → Your MQTT broker address (e.g., `broker.hivemq.com`)
- `<broker_port>` → Typically `1883`
- `<username>` and `<password>` → If your broker requires authentication
- `<your_topic>` → One of the topics defined in your `.env` file (e.g. `test/topic` or `real/topic`)

---

### ✅ Verifying Data Insertion

After sending the payload, check your terminal for:

```
✅ 1 record inserted successfully via <topic>.
```

This confirms that the message was successfully parsed and stored in the database.

---

## 📌 Notes

- MQTT topics should be properly configured to match your device’s publishing topic.
- Time filters (`startDate`, `endDate`, etc.) in Supabase are validated and formatted to PostgreSQL-compatible strings.
- The MySQL version expects a field named `entryStored_time`, while the PostgreSQL version uses `entrycreation_time`.

---

## 🧬 System Diagram

![GreenhouseDiagram](https://www.plantuml.com/plantuml/png/bLLDRziu4BthLmpQg-CYFXfmqBGssYpIHRjozsGW695ZYuX4QicH7E-lNv2IhAyupjuCSzwyz-PBdnsZvJBFu9ibqgaf7QqL7YpcaNjMka2BESJqJqbQq0zo3Wzqdwc3paap2D9CDcB56VKoG7noJ1qEsfHHObxWmxtW4jbOzm4-Fgf3ob-oaY80W08jAw4Ar0pdgASYGystrm8M4Ma9YNbfM6BIxXf74tE9OV3Soz-FUJ3R9qdLyCyVlxRRfyIQPxADceqyK2ib56f2zgUHz4VyvCXMPCEhHCO4VJb_FSfa0lXcSOyQMyHP7Ges5duxpwqD4vYAxCZgREHj2T_BN4d5fnamvGLPvDBIRATHIyYyQd0r8le4NTPnasQJhYmXDXbfeoHKc5NaPb2O8rbutAnTa_-8J1QACY-YQBLwq8eLPkfVP6NqQkKh6ymFAWGtTtLTO0b_-Jbp3C9eJSAZGdpzV7DpDq8kuLuyQtFCI1ve31fMzN-nZA0NQKZBA6hcnXFqfkLrcdw09sgn5nc6YAd_LpX6nPt8kiIqMgsH4ROMjSkLStNB3jQKHJDZC0cewpOOI1ZO2eYzDNapT72xqqV5AR3AoJ7cnJJ5uagAnIH5w4EjD4J7R2mUwYlHQy-uUEFC3fhCmb8OsP7AYsFh-IXiEIZTRNkJpVbNENRyhf4EALtZ9hZiDdQ0MyBNYURQcgHA2PhlT3oI0IWbIKXEKAVujFuo7rJnR-NAy_O6qVuKmMlxqOvXqBit5ge9zgrrPAkeQjpMefiINjlBsD_A06FJlaBly8v9R-vg3qjOArTaUAh1nZVDfOb1A-iohrPVJPxxaxPv8L4sz-kgVz60g0L5KzkJ5Tx4MxZ_-G02iypxgC7K9eikZjtlGc8N1uwHIzUVmFvNmsEMiAd8da2GPLGQC3UbPZ3xC1N0gP_Pcgwf8eYKnBCBJ-UvzWrkI5rFy3nwxvqUw2s3YwjdwsUPPCgbvwgC3cDtBqQ1NY2sdxB-_hplYvTJPpN74oIr_URMjRyMSzZf3OeKwlqn-uuJKdIWs84vwk09s1HAU5qxRKcGgZgE-U1xCfRefyNqHgFl3MxVG2xUH2wYw3DfMURPVm00 "GreenhouseDiagram")


## 📖 License

MIT © 2025 — Santiago Estrada Bernal

## 📬 Contact

For any inquiries, please contact [santiago.estrada6@eia.edu.co](mailto:santiago.estrada6@eia.edu.co).