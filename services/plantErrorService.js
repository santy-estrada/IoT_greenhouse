const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function plantErrorService(plant_id, data) {
  const { error } = data;

  try {
    await prisma.plant.update({
      where: { id: plant_id },
      data: { error },
    });
    console.log(`✅ Plant with ID ${plant_id} updated. Error status: ${error}`);
  } catch (err) {
    console.error(`❌ Failed to update error status for plant with ID ${plant_id}:`, err.message);
    throw err;
  }
}

module.exports = { plantErrorService };