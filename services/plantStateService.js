const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePlantState(plant_id, data) {
  const { luminosity_state, humidity_state, valve_state, led_intensity_state, mode_state } = data;
  const tempDate = new Date();
  try {
    await prisma.plantState.update({
      where: { id: plant_id },
      data: {
        luminosity_state,
        humidity_state,
        valve_state,
        led_intensity_state,
        last_updated: tempDate,
        mode: mode_state,
      },
    });
    console.log(`✅ PlantState updated for plant ${plant_id} at ${tempDate}`);
  } catch (err) {
    console.error('❌ Error updating PlantState:', err.message);
    throw err;
  }
}

module.exports = { updatePlantState };