const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let lastKnownEvents = {
  plantEvents: {},
  iotDevEvents: {},
};

async function monitorEventChanges(client) {
  const checkInterval = process.env.EVENT_CHECK_INTERVAL || 10000; // Default to 10 seconds

  setInterval(async () => {
    try {
      console.log(`[${new Date().toISOString()}] 🔄 Checking for event changes...`);

      // Fetch current events from the database
      const currentPlantEvents = await prisma.plantEvent.findMany();
      const currentIotDevEvents = await prisma.iotDevEvent.findMany();

      // Check for changes in PlantEvents
      for (const event of currentPlantEvents) {
        const lastEvent = lastKnownEvents.plantEvents[event.id] || {};
        const changes = {};

        // Compare each field and add to changes if it has changed
        if (event.luminosity_event !== lastEvent.luminosity_event) {
          changes.luminosity_event = event.luminosity_event;
        }
        if (event.humidity_event !== lastEvent.humidity_event) {
          changes.humidity_event = event.humidity_event;
        }
        if (event.valve_event !== lastEvent.valve_event) {
          changes.valve_event = event.valve_event;
        }
        if (event.led_intensity_event !== lastEvent.led_intensity_event) {
          changes.led_intensity_event = event.led_intensity_event;
        }

        // Publish only if there are changes
        if (Object.keys(changes).length > 0) {
          const message = {
            type: 'plantEvent',
            id: event.id,
            changes,
          };
          client.publish(process.env.MQTT_COMMAND_TOPIC, JSON.stringify(message), { qos: 0, retain: false });
          console.log(`✅ Published plant event change: ${JSON.stringify(message)}`);
        }

        // Update the last known state
        lastKnownEvents.plantEvents[event.id] = event;
      }

      // Check for changes in IotDevEvents
      for (const event of currentIotDevEvents) {
        const lastEvent = lastKnownEvents.iotDevEvents[event.id] || {};
        const changes = {};

        // Compare each field and add to changes if it has changed
        if (event.pump_event !== lastEvent.pump_event) {
          changes.pump_event = event.pump_event;
        }

        // Publish only if there are changes
        if (Object.keys(changes).length > 0) {
          const message = {
            type: 'iotDevEvent',
            id: event.id,
            changes,
          };
          client.publish(process.env.MQTT_COMMAND_TOPIC, JSON.stringify(message), { qos: 0, retain: false });
          console.log(`✅ Published IoT device event change: ${JSON.stringify(message)}`);
        }

        // Update the last known state
        lastKnownEvents.iotDevEvents[event.id] = event;
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Error checking for event changes:`, err.message);
    }
  }, checkInterval);
}

module.exports = { monitorEventChanges };