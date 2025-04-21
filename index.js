const mqtt = require('mqtt');
const express = require('express');
const bodyparser = require('body-parser');
require('dotenv').config();

const webserver = express();
//webserver.use(bodyparser.json);
//webserver.use(bodyparser.urlencoded({ extended: false }));
webserver.use(bodyparser.json());

//webserver.use(express.json);
//webserver.use(express.urlencoded);

webserver.post('/postmsg', function(req, res) {
  console.log(req.headers);
  console.log(req.body);
  console.log(req.bodyparser);
  const body = req.body.var1;
  console.log(`Mensaje por post '${body}'`);
  res.send('OK');
});

webserver.listen(8999, function(err) {
  if (err) {
    throw err;
  }
});

console.log('servidor en 8999');

/////SQL

var mysql = require('mysql');
var db = false;

var sqlcon = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const table = process.env.TABLE_NAME;

sqlcon.connect(function(err) {
  if (err) {
    console.log("Unable to connect to SQL:", err.message || "No connection to DB");
    db = false;
    return;
  }
  console.log("Connected! SQL");
  db = true;
  console.log("Connected to DB: " + db);
});

///mqtt

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


const test = false;
const topic = test ? 'dataBaseTest' : 'realDeal';
const topics = ["dataBaseTest", "realDeal"];

client.on('connect', () => {
  console.log(db ? 'Connected': "No connection to DB");

  client.subscribe(['santy/'], () => {
    console.log(`Subscribe to topic {'santy/'}'`);
    const message = 'nodejs mqtt test';
    client.publish("santy/", message, { qos: 0, retain: false }, (error) => {
      if (error) {
        console.error(error);
      }
    });
  });

  client.subscribe(topics, () => {
    topics.forEach((topic) => {
      console.log(`Subscribed to topic: ${topic}`);
    });
  });
});

// Helper function to format a JavaScript Date object into MySQL DATETIME format
function formatDateForMySQL(date) {
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString());

  if (topic === "dataBaseTest") {
    try {
      const data = JSON.parse(payload.toString());
      const { luminosity, humidity, temperature, plant_id, entryCreation_time } = data;

      const entryTime = entryCreation_time
      ? formatDateForMySQL(new Date(entryCreation_time)) //entryCreation_time is sent in the format "2024-04-17 05:58:05.0"
      : formatDateForMySQL(new Date());

      console.log("Entry time:", entryTime);
      
      const sql = `
        INSERT INTO ${table}
        (entryCreation_time, luminosity, humidity, temperature, plant_id) 
        VALUES (?, ?, ?, ?, ?)
      `;

      sqlcon.query(sql, [entryTime, luminosity, humidity, temperature, plant_id], (err, result) => {
        if (err) {
          console.error("Error inserting into database:", err.message || "No connection to DB");
          return;
        }
        console.log("✅ 1 record inserted successfully via DatabaseTest.");
      });
      
    } catch (err) {
      console.error("❌ Failed to parse MQTT payload:", err.message || "No connection to DB");
      console.log("❌ Payload:", payload.toString());
    }
  }

  if (topic === "realDeal") {
    try {
      const data = JSON.parse(payload.toString());
      const { luminosity, humidity, temperature, plant_id, entryCreation_time } = data;

      const entryTime = entryCreation_time
      ? formatDateForMySQL(new Date(entryCreation_time)) //entryCreation_time is sent in the format "2024-04-17 05:58:05.0"
      : formatDateForMySQL(new Date());

      console.log("Entry time:", entryTime);
      
      const sql = `
        INSERT INTO ${table} 
        (entryCreation_time, luminosity, humidity, temperature, plant_id) 
        VALUES (?, ?, ?, ?, ?)
      `;

      sqlcon.query(sql, [entryTime, luminosity, humidity, temperature, plant_id], (err, result) => {
        if (err) {
          console.error("Error inserting into database:", err.message || "No connection to DB");
          return;
        }
        console.log("✅ 1 record inserted successfully via realDeal.");
      });
      
    } catch (err) {
      console.error("❌ Failed to parse MQTT payload:", err.message || "No connection to DB");
      console.log("❌ Payload:", payload.toString());
    }
  }
});

// Function to query the database
function getPlantData({ limit = 50, startDate, endDate, plantId } = {}, callback) {
  const sDate = new Date(startDate);
  const eDate = new Date(endDate);

  if (startDate && endDate && sDate > eDate) {
    console.error("Start date cannot be greater than end date.");
    callback(new Error("Invalid date range"), null);
    return;
  }

  if (plantId < 0) {
    console.error("Invalid plant ID.");
    callback(new Error("Invalid plant ID"), null);
    return;
  }
  
  let sql = `
    SELECT * FROM ${table}
    WHERE 1=1
  `;

  const params = [];

  // Add filters based on the provided parameters
  if (startDate) {
    sql += ` AND entryStored_time >= ?`;
    params.push(formatDateForMySQL(sDate));
  }

  if (endDate) {
    sql += ` AND entryStored_time <= ?`;
    params.push(formatDateForMySQL(eDate));
  }

  if (plantId) {
    sql += ` AND plant_id = ?`;
    params.push(plantId);
  }

  sql += ` ORDER BY entryStored_time DESC LIMIT ?`;
  params.push(limit);

  // Execute the query
  sqlcon.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error querying the database:", err.message || "No connection to DB");
      callback(err, null);
      return;
    }
    callback(null, results);
  });
}

// Example get query
// getPlantData(
//   { limit: 10, startDate: '2025-04-17 6:10:00', endDate: '2025-04-17 6:40:00', plantId: 1 },
//   (err, results) => {
//     if (err) {
//       console.error("Failed to fetch data:", err.message || "No connection to DB");
//     } else {
//       console.log("Fetched data:", results);
//     }
//   }
// );

const devMode = process.env.DEVMODE === 'true';

if (devMode) {
  console.log("Dev mode enabled. Press ctl+c to exit.");
} else {
  console.log("Dev mode disabled. Press ctl+c to exit.");
  let readline = require('readline');
  const exp = require('constants');

  readline.emitKeypressEvents(process.stdin);

  process.stdin.on('keypress', (ch, key) => {
    console.log('got "keypress"', ch, key);
    if (key && key.ctrl && key.name == 'c') {
      process.exit(0);
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



