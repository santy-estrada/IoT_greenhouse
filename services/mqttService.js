const { insertDataLog } = require('./logService');
const { updatePlantState } = require('./plantStateService');
const { updateIotDevState } = require('./iotDevStateService');
const { createMqttClient } = require('../utils/mqttClient');
const { setupPeriodicSync } = require('./syncService');
const { monitorEventChanges } = require('./eventChangeService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function setupMqttClient() {
  const client = createMqttClient();

  client.on('message', async (topic, payload) => {
    console.log('Received Message:', topic, payload.toString());

    if (topic === process.env.MQTT_MESSAGE_TOPIC) {
      console.log('Message topic:', topic);
      console.log('Message payload:', payload.toString());
      return;
    } else if ([process.env.MQTT_TEST_TOPIC, process.env.MQTT_REAL_TOPIC].includes(topic)) {
      try {
        const data = JSON.parse(payload.toString());

        // If plant_id is provided, ensure iot_dev_id is retrieved
        if (data.plant_id) {
          const plant = await prisma.plant.findUnique({
            where: { id: data.plant_id },
            select: { iot_dev_id: true },
          });

          if (plant && plant.iot_dev_id) {
            data.iot_dev_id = plant.iot_dev_id; // Add iot_dev_id to the data object
          } else {
            console.warn(`⚠️ No IoT device found for plant_id ${data.plant_id}`);
          }
        }

        // Insert into Log table
        await insertDataLog(data, topic);

        // Update PlantState table
        if (data.plant_id) {
          await updatePlantState(data.plant_id, data);
        }

        // Update IotDevState table
        if (data.iot_dev_id) {
          await updateIotDevState(data.iot_dev_id, data);
        }
      } catch (err) {
        console.error('❌ Failed to process MQTT message:', err.message);
        console.log('❌ Payload:', payload.toString());
      }
    }
  });

  setupPeriodicSync(client);

  monitorEventChanges(client);



  return client;
}

module.exports = { setupMqttClient };