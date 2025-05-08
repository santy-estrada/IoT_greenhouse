const { getIotDevIdFromPlantId } = require('../utils/iotDevId_from_plantId');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function insertDataLog(data, topic) {
  const {
    luminosity_state,
    humidity_state,
    temperature,
    plant_id,
    entryCreation_time,
    valve_state,
    pump_state,
    led_intensity_state,
    mode_state
  } = data;

  const entry_creation_time = new Date(entryCreation_time);
  const tempDate = new Date();

  // Retrieve event variables from PlantEvent
  const plant_event_variables = await prisma.plant.findUnique({
    where: { id: plant_id },
    select: {
      plant_event: {
        select: { 
          valve_event: true,
          led_intensity_event: true,
          luminosity_event: true,
          humidity_event: true,
          mode: true,
        },
      },
    },
  });

  const valveEventValue = plant_event_variables.plant_event.valve_event;
  const ledEventValue = plant_event_variables.plant_event.led_intensity_event;
  const luminosityEventValue = plant_event_variables.plant_event.luminosity_event;
  const humidityEventValue = plant_event_variables.plant_event.humidity_event;
  const modeEventValue = plant_event_variables.plant_event.mode;

  console.log('modeValue:', modeEventValue);
  console.log('valveEventValue:', valveEventValue);
  console.log('ledEventValue:', ledEventValue);
  console.log('luminosityEventValue:', luminosityEventValue);
  console.log('humidityEventValue:', humidityEventValue);

  const iot_dev_id = await getIotDevIdFromPlantId(plant_id); // Get iot_dev_id from plant_id
  // Retrieve pump_event from IotDevEvent using iot_dev_id
  const pump_event = await prisma.iotDev.findUnique({
    where: { id: iot_dev_id },
    select: {
      dev_event: {
        select: { pump_event: true },
      },
    },
  });
  const pumpEventValue = pump_event.dev_event.pump_event;
  console.log('pumpEventValue:', pumpEventValue);


  try {
    await prisma.log.create({
      data: {
        entry_creation_time,
        temperature,
        luminosity_state,
        humidity_state,
        luminosity_event: luminosityEventValue,
        humidity_event: humidityEventValue,
        plant_id,
        valve_state,
        pump_state,
        led_intensity_state,
        valve_event: valveEventValue,
        pump_event: pumpEventValue,
        led_intensity_event: ledEventValue,
        mode_event: modeEventValue,
        mode_state,
      },
    });
    console.log(`✅ 1 record inserted into Log table successfully via ${topic} at ${tempDate}.`);
  } catch (err) {
    console.error('❌ Error inserting into Log table:', err.message);
    throw err;
  }
}

module.exports = { insertDataLog };