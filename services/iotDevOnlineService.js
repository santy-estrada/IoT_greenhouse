const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function iotDevOnlineService(iot_dev_id, data) {
  const { online_status } = data;

  try {
    await prisma.iotDev.update({
      where: { id: iot_dev_id },
      data: { online_status },
    });
    console.log(`✅ IoT Device with ID ${iot_dev_id} updated. Online status: ${online_status}`);
  } catch (err) {
    console.error(`❌ Failed to update online status for IoT Device with ID ${iot_dev_id}:`, err.message);
    throw err;
  }
}

module.exports = { iotDevOnlineService };