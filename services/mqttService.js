const { insertDataLog } = require('./logService');
const { updatePlantState } = require('./plantStateService');
const { updateIotDevState } = require('./iotDevStateService');
const { createMqttClient } = require('../utils/mqttClient');
const { setupPeriodicSync } = require('./syncService');
const { monitorEventChanges } = require('./eventChangeService');
const { PrismaClient } = require('@prisma/client');
const { plantErrorService } = require('./plantErrorService');
const { iotDevOnlineService } = require('./iotDevOnlineService');
const { getIotDevIdFromPlantId } = require('../utils/iotDevId_from_plantId');

const prisma = new PrismaClient();

function setupMqttClient() {
  const client = createMqttClient();

  client.on('message', async (topic, payload) => {
    console.log('Received Message:', topic, payload.toString());

    if (topic === process.env.MQTT_MESSAGE_TOPIC) {
      console.log('Message topic:', topic);
      console.log('Message payload:', payload.toString());
      return;

    } else if (topic === process.env.MQTT_TEST_TOPIC) {
      try {
        const data = JSON.parse(payload.toString());

        iot_dev_id = await getIotDevIdFromPlantId(data.plant_id); // Get iot_dev_id from plant_id
        
        // Insert into Log table
        await insertDataLog(data, topic);

        // Update PlantState table
        if (data.plant_id) {
          await updatePlantState(data.plant_id, data);
        }else{
          console.warn(`⚠️ No plant_id found in the message. Cannot update PlantState.`);
        }

        // Update IotDevState table
        if (iot_dev_id) {
          await updateIotDevState(iot_dev_id, data);
        }else{
          console.warn(`⚠️ No iot_dev_id found for plant_id ${data.plant_id}. Cannot update IotDevState.`);
        }
      } catch (err) {
        console.error('❌ Failed to process MQTT message:', err.message);
        console.log('❌ Payload:', payload.toString());
      }
    }else if (topic === process.env.MQTT_REAL_TOPIC) {
      try {
        const data = JSON.parse(payload.toString());
    
        // If plant_id is provided, update the error column
        if (data.plant_id) {
          await plantErrorService(data.plant_id, data);
        }
    
        // If iot_dev_id is provided, update the online_status column
        if (data.iot_dev_id) {
          await iotDevOnlineService(data.iot_dev_id);
        }
      } catch (err) {
        console.error('❌ Failed to process MQTT_REAL_TOPIC message:', err.message);
        console.log('❌ Payload:', payload.toString());
      }
    }
  });

  setupPeriodicSync(client);

  monitorEventChanges(client);



  return client;
}

module.exports = { setupMqttClient };