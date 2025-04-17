const mqtt = require('mqtt');
const express = require('express');
const bodyparser = require('body-parser');

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
  host: "localhost",
  user: "root",
  password: "root",
  database: "greenhouse_v1"
});

sqlcon.connect(function(err) {
  if (err) {
    console.log("Unable to connect to SQL:", err.message);
    return;
  }
  console.log("Connected! SQL");
  db = true;
  console.log("Connected to DB: " + db);
});

///mqtt

const host = 'localhost';
const port = '1883';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const connectUrl = `mqtt://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
});

const test = false;
const topic = test ? 'dataBaseTest' : 'realDeal';
const topics = ["dataBaseTest", "realDeal"];

client.on('connect', () => {
  console.log('Connected');

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
        INSERT INTO plantdata_v1 
        (entryCreation_time, luminosity, humidity, temperature, plant_id) 
        VALUES (?, ?, ?, ?, ?)
      `;

      sqlcon.query(sql, [entryTime, luminosity, humidity, temperature, plant_id], (err, result) => {
        if (err) {
          console.error("Error inserting into database:", err.message);
          return;
        }
        console.log("✅ 1 record inserted successfully via DatabaseTest.");
      });
      
    } catch (err) {
      console.error("❌ Failed to parse MQTT payload:", err.message);
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
        INSERT INTO plantdata_v1 
        (entryCreation_time, luminosity, humidity, temperature, plant_id) 
        VALUES (?, ?, ?, ?, ?)
      `;

      sqlcon.query(sql, [entryTime, luminosity, humidity, temperature, plant_id], (err, result) => {
        if (err) {
          console.error("Error inserting into database:", err.message);
          return;
        }
        console.log("✅ 1 record inserted successfully via realDeal.");
      });
      
    } catch (err) {
      console.error("❌ Failed to parse MQTT payload:", err.message);
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
    SELECT * FROM plantdata_v1
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
      console.error("Error querying the database:", err.message);
      callback(err, null);
      return;
    }
    callback(null, results);
  });
}

// Example get query
getPlantData(
  { limit: 10, startDate: '2025-04-17 6:10:00', endDate: '2025-04-17 6:40:00', plantId: 1 },
  (err, results) => {
    if (err) {
      console.error("Failed to fetch data:", err.message);
    } else {
      console.log("Fetched data:", results);
    }
  }
);



let readline = require('readline');
const exp = require('constants');

readline.emitKeypressEvents(process.stdin);

process.stdin.on('keypress', (ch, key) => {
  console.log('got "keypress"', ch, key);
  if (key && key.ctrl && key.name == 'c') {
    process.exit(0);
  }
});

process.stdin.setRawMode(true);
