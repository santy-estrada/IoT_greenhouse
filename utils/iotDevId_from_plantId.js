const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getIotDevIdFromPlantId(plant_id) {
    // If plant_id is provided, ensure iot_dev_id is retrieved
    if (plant_id) {
        const plant = await prisma.plant.findUnique({
            where: { id: plant_id },
            select: { iot_dev_id: true },
        });

        if (plant && plant.iot_dev_id) {
            iot_dev_id = plant.iot_dev_id; // Add iot_dev_id to the data object
        } else {
            console.warn(`⚠️ No IoT device found for plant_id ${plant_id}`);
        }
    }

    return iot_dev_id;
}

module.exports = { getIotDevIdFromPlantId };