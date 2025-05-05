const { setupMqttClient } = require('./services/mqttService');
const mqtt = require('mqtt');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log("Starting application...");

// Initialize the MQTT client
setupMqttClient();


async function getPlantData({ limit = 50, startDate, endDate, startTime = '00:00:00', endTime = '23:59:59', plantId } = {}, callback) {
  try {
    const filters = {
      where: {},
      take: limit,
      orderBy: { entry_creation_time: 'desc' },
    };

    if (plantId) {
      filters.where.plant_id = plantId;
    }

    if (startDate && endDate) {
      filters.where.entry_creation_time = {
        gte: new Date(`${startDate}T${startTime}`),
        lte: new Date(`${endDate}T${endTime}`),
      };
    }

    const results = await prisma.log.findMany(filters);
    callback(null, results);
  } catch (err) {
    console.error("Error querying the database:", err.message);
    callback(err, null);
  }
}