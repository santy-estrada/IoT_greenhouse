const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function setupPeriodicSync(client) {
  const syncInterval = process.env.SYNC_INTERVAL || 30000; // Default to 30 seconds

  setInterval(async () => {
    try {
      console.log(`[${new Date().toISOString()}] 🔄 Synchronizing states and events...`);

      const plantStates = await prisma.plantState.findMany();
      const plantEvents = await prisma.plantEvent.findMany();
      const iotDevStates = await prisma.iotDevState.findMany();
      const iotDevEvents = await prisma.iotDevEvent.findMany();

      const syncMessage = {
        plantStates,
        plantEvents,
        iotDevStates,
        iotDevEvents,
      };

      client.publish(
        process.env.MQTT_SYNC_TOPIC,
        JSON.stringify(syncMessage),
        { qos: 0, retain: false },
        (error) => {
          if (error) {
            console.error('❌ Failed to publish synchronization message:', error.message);
          } else {
            console.log('✅ Synchronization message published to SYNC topic.');
          }
        }
      );
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Error during synchronization:`, err.message);
    }
  }, syncInterval);
}

module.exports = { setupPeriodicSync };