const mqtt = require('mqtt');
const express = require('express');
const bodyparser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();
console.log("PostgreSQL connection");

const webserver = express();
webserver.use(bodyparser.json());

webserver.post('/postmsg', function (req, res) {
  console.log(req.headers);
  console.log(req.body);
  const body = req.body.var1;
  console.log(`Mensaje por post '${body}'`);
  res.send('OK');
});

webserver.listen(8999, function (err) {
  if (err) throw err;
});
console.log('servidor en 8999');

/// PostgreSQL via Supabase
const pool = new Pool({
  connectionString: process.env.PG_URI,
});

const table = process.env.TABLE_NAME;

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Unable to connect to PostgreSQL:', err.stack);
  }
  console.log('✅ Connected to PostgreSQL database');
  release();
});

/// MQTT setup
const host = process.env.MQTT_HOST;
const port = process.env.MQTT_PORT;
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const connectUrl = `mqtt://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  reconnectPeriod: 1000,
});

const topics = [`${process.env.MQTT_TEST_TOPIC}`, `${process.env.MQTT_REAL_TOPIC}`];

client.on('connect', () => {
  console.log('MQTT connected');

  client.subscribe([`${process.env.MQTT_MESSAGE_TOPIC}`], () => {
    console.log(`Subscribe to topic '${process.env.MQTT_MESSAGE_TOPIC}'`);
    const message = 'nodejs mqtt test';
    client.publish(`${process.env.MQTT_MESSAGE_TOPIC}`, message, { qos: 0, retain: false }, (error) => {
      if (error) console.error(error);
    });
  });

  client.subscribe(topics, () => {
    topics.forEach((topic) => console.log(`Subscribed to topic: ${topic}`));
  });
});

function formatDateForPostgreSQL(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

function insertData(data, topic) {
  const { luminosity, humidity, temperature, plant_id, entryCreation_time } = data;
  const entryTime = entryCreation_time
    ? formatDateForPostgreSQL(new Date(entryCreation_time))
    : formatDateForPostgreSQL(new Date());

  const sql = `
    INSERT INTO ${table} (entrycreation_time, luminosity, humidity, temperature, plant_id) 
    VALUES ($1, $2, $3, $4, $5)
  `;

  const values = [entryTime, luminosity, humidity, temperature, plant_id];

  pool.query(sql, values)
    .then(() => {
      console.log(`✅ 1 record inserted successfully via ${topic}.`);
    })
    .catch(err => {
      console.error('❌ Error inserting into PostgreSQL:', err.message);
    });
}

client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString());

  if ([process.env.MQTT_TEST_TOPIC, process.env.MQTT_REAL_TOPIC].includes(topic)) {
    try {
      const data = JSON.parse(payload.toString());
      insertData(data, topic);
    } catch (err) {
      console.error('❌ Failed to parse MQTT payload:', err.message);
      console.log('❌ Payload:', payload.toString());
    }
  }
});

function getPlantData({ limit = 50, startDate, endDate, startTime = '00:00:00', endTime = '23:59:59', plantId } = {}, callback) {
  let sql = `SELECT * FROM ${table} WHERE 1=1`;
  const params = [];
  let paramIndex = 1;

  
  if (limit) {
    if (limit < 1 || limit > 1000) {
      console.log("❌ Invalid limit. Must be between 1 and 1000.");
      return callback(new Error("Invalid limit. Must be between 1 and 1000."), null);
    }
  }

  if (plantId) {
    if (plantId < 1 || plantId > 1000) {
      console.log("❌ Invalid plantId. Must be between 1 and 1000.");
      return callback(new Error("Invalid plantId. Must be between 1 and 1000."), null);
    }
  }

  if (startDate) {
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      console.log("❌ Invalid startDate format. Use YYYY-MM-DD.");
      return callback(new Error("Invalid startDate format. Use YYYY-MM-DD."), null);
    }
  }

  if (endDate) {
    const endDateObj = new Date(endDate);
    if (isNaN(endDateObj.getTime())) {
      console.log("❌ Invalid endDate format. Use YYYY-MM-DD.");
      return callback(new Error("Invalid endDate format. Use YYYY-MM-DD."), null);
    }
  }

  if (startTime) {
    const startTimeObj = new Date(`1970-01-01T${startTime}`);
    if (isNaN(startTimeObj.getTime())) {
      console.log("❌ Invalid startTime format. Use HH:MM:SS.");
      return callback(new Error("Invalid startTime format. Use HH:MM:SS."), null);
    }
  }

  if (endTime) {
    const endTimeObj = new Date(`1970-01-01T${endTime}`);
    if (isNaN(endTimeObj.getTime())) {
      console.log("❌ Invalid endTime format. Use HH:MM:SS.");
      return callback(new Error("Invalid endTime format. Use HH:MM:SS."), null);
    }
  }

  if (startDate && endDate) {
    if (startTime && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      if (startDateTime > endDateTime) {
        console.log("❌ Start date and time cannot be greater than end date and time.");
        return callback(new Error("Start date and time cannot be greater than end date and time."), null);
      }
    }else{
      const startDateTime = new Date(`${startDate}T00:00:00`);
      const endDateTime = new Date(`${endDate}T23:59:59`);
      if (startDateTime > endDateTime) {
        console.log("❌ Start date cannot be greater than end date.");
        return callback(new Error("Start date cannot be greater than end date."), null);
      }
    }
  }

  // Add filters based on the provided parameters
  if (startDate) {
    // Combine startDate and startTime
    const startDateTime = new Date(`${startDate}T${startTime}`);
    sql += ` AND entrycreation_time >= $${paramIndex++}`;
    params.push(formatDateForPostgreSQL(startDateTime));
  }
  if (endDate) {
    // Combine endDate and endTime
    const endDateTime = new Date(`${endDate}T${endTime}`);
    sql += ` AND entrycreation_time <= $${paramIndex++}`;
    params.push(formatDateForPostgreSQL(endDateTime));
  }
  
  if (plantId) {
    sql += ` AND plant_id = $${paramIndex++}`;
    params.push(plantId);
  }

  sql += ` ORDER BY entrycreation_time DESC LIMIT $${paramIndex}`;
  params.push(limit);

  // Execute the query
  pool.query(sql, params)
    .then(result => callback(null, result.rows))
    .catch(err => {
      console.error("Error querying the database:", err.message);
      callback(err, null);
    });
}



const devMode = process.env.DEVMODE === 'true';

if (devMode) {
  console.log("Dev mode enabled. Press ctl+c to exit.");
} else {
  console.log("Dev mode disabled. Press ctl+c to exit.");
  let readline = require('readline');

  readline.emitKeypressEvents(process.stdin);

  process.stdin.on('keypress', (ch, key) => {
    if (key && key.ctrl && key.name === 'c') {
      // Exit the process
      console.log("Exiting process...");
      process.exit(0);
    }

    if (key && key.name === 'm') {
      // Send an MQTT message
      console.log("Sending MQTT message...");
      const message = 'nodejs mqtt test through keypress';
      client.publish(`${process.env.MQTT_MESSAGE_TOPIC}`, message, { qos: 0, retain: false }, (error) => {
        if (error) console.error(error);
      });
    }

    if (key && key.name === 'g') {
      // Perform a get query
      console.log("Performing a get query... this might take a while...");
      getPlantData(
        {limit: 5, plantId: 2, endDate: '2025-04-24', startDate: '2025-04-24', startTime: '13:35:00', endTime: '20:00:00'},
        (err, results) => {
          if (err) {
            console.error("Failed to fetch data:", err.message);
          } else {
            console.log("Fetched data:", results);
          }
        }
      );
    }
  });

  try {
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(true);
    }
  } catch (err) {
    console.warn('⚠️ Could not set raw mode:', err.message);
  }
}