const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const deviceTimers = {}; // Store timers for each IoT device
const timeoutPeriod = process.env.IOT_DEV_TIMEOUT || 30000; // Default to 30 seconds

async function iotDevOnlineService(iot_dev_id) {

  try {
    // Update the online_status to true when a message is received
    await prisma.iotDev.update({
      where: { id: iot_dev_id },
      data: { online_status: true },
    });
    console.log(`✅ IoT Device with ID ${iot_dev_id} updated. Online status: true`);

    // Clear any existing timer for this device
    if (deviceTimers[iot_dev_id]) {
      clearTimeout(deviceTimers[iot_dev_id]);
    }

    // Set a new timer to mark the device as offline if no message is received within the timeout period
    deviceTimers[iot_dev_id] = setTimeout(async () => {
      try {
        await prisma.iotDev.update({
          where: { id: iot_dev_id },
          data: { online_status: false },
        });
        console.log(`⚠️ IoT Device with ID ${iot_dev_id} marked as offline due to inactivity.`);
      } catch (err) {
        console.error(`❌ Failed to update offline status for IoT Device with ID ${iot_dev_id}:`, err.message);
      }
    }, timeoutPeriod);
  } catch (err) {
    console.error(`❌ Failed to update online status for IoT Device with ID ${iot_dev_id}:`, err.message);
    throw err;
  }
}

module.exports = { iotDevOnlineService };