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

![GreenhouseDiagram](https://www.plantuml.com/plantuml/png/bLLDRzf04BtxLupQAoGAHoH78G6bgP8ggMbFI6YyEvXLx5rtTsr2Vtsr_W1x7K9wGzvvyzwRBswCHMsBB8LxJIItgZ0q5vXep0BpAcIE6ZE8w4z1aj4J6OC9pLAHo8oa1KRIaWwii2brCa2qDvQEE6XJ1h5wWoypPWkqIfilyFLH95jxcnOK003agArW8aTfuH2rpbEKzkfSm2GWoI5MRmrBHDASusXYJZ7qdZlvkp4FQhdcLFO_Fhqib-jOgrVIZPe5JwYLKXLgGFP3SVeUhGtfadJroj5YZAwSBuyy7W3kDMvGOeiug4DcbOPVnd5BPGbKITgpElAyJU5RaGakx7u4bhASDDf2qsWbKN98dMemDIAuX6DMlqcZGLUc4AcKf18SIanBCYF8rOuqF2xcfic_GqiQyYBBWo0C7wIm0bFn5wrGCWnTPIlplGh1-Bgk2qpXfvipOu4fAOavL1LVFu_7rnvo2ZFsAjKk9PwG3-fNzRzOFEX96f8y29gvSGITQNcVfXlWY5hiIOO-OkZ_7Gwlk0DPfvZ2S8uMOQbHcamOKxSiqQh8cnc3GK1Tjzv0GizMXTXebJL31rShkHDs2rPaP2nc-J35v4oAoI15rOTQQHKTMQKngQz4fpr-yVpC1fhCJ5CrifxAasFh-AZQSX3okErDDkDUkU_uKoDTfJIDcyhbSMDxk2dS3JJNrZYLWj75IaQU343EYKEyXph5vVpsebV5ty8KX-sjHBjJ1E_jHpk6bTwDqb0Ei1-jezM2oiPjBRefuRczZDojh61MjQ_GERm-wVYwzZ25kJ1vYliQh5pJp3PMg7bTvZ2yKrdcJjhYZLZHtA-p_ba3eXOK36qFLdWHBM7s_00CqzJvgC7K9Wi6OzVVv-SYJeNP7iAzYt5S92_GKM5xuxk3zRc_WkmWq426UuYfQdnp1DfVamjOoGMoBTI3fJP7JjYY0M4Dg9siF85LkM1ErqfgOYJA8yT5xz3w4bqPLQTcNMzmzG5oyY5o4WGt97cHfVy0)


## 📖 License

MIT © 2025 — Santiago Estrada Bernal

## 📬 Contact

For any inquiries, please contact [santiago.estrada6@eia.edu.co](mailto:santiago.estrada6@eia.edu.co).