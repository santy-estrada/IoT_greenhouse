const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateIotDevState(iot_dev_id, data) {
  const { pump_state } = data;
  const tempDate = new Date();

  try {
    await prisma.iotDevState.update({
      where: { id: iot_dev_id },
      data: {
        pump_state,
        last_updated: tempDate,
      },
    });
    console.log(`✅ IotDevState updated for device ${iot_dev_id} at ${tempDate}`);
  } catch (err) {
    console.error('❌ Error updating IotDevState:', err.message);
    throw err;
  }
}

module.exports = { updateIotDevState };