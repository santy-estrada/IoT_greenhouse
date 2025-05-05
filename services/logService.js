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
  } = data;

  const entry_creation_time = new Date(entryCreation_time);
  const tempDate = new Date();

  // Retrieve valve_event from PlantEvent
  const valve_event = await prisma.plant.findUnique({
    where: { id: plant_id },
    select: {
      plant_event: {
        select: { valve_event: true },
      },
    },
  });
  const valveEventValue = valve_event.plant_event.valve_event;
  console.log('valveEventValue:', valveEventValue);

 // Retrieve led_intesity_event from PlantEvent
  const led_intensity_event = await prisma.plant.findUnique({
    where: { id: plant_id },
    select: {
      plant_event: {
        select: { led_intensity_event: true },
      },
    },
  });

  const ledEventValue = led_intensity_event.plant_event.led_intensity_event;
  console.log('ledEventValue:', ledEventValue);

  // Retrieve luminosity_event from PlantEvent
  const luminosity_event = await prisma.plant.findUnique({
    where: { id: plant_id },
    select: {
      plant_event: {
        select: { luminosity_event: true },
      },
    },
  });
  const luminosityEventValue = luminosity_event.plant_event.luminosity_event;
  console.log('luminosityEventValue:', luminosityEventValue);

  //Retrieve humidity_event from PlantEvent
  const humidity_event = await prisma.plant.findUnique({
    where: { id: plant_id },
    select: {
      plant_event: {
        select: { humidity_event: true },
      },
    },
  });
  const humidityEventValue = humidity_event.plant_event.humidity_event;
  console.log('humidityEventValue:', humidityEventValue);

  // Retrieve pump_event from IotDevEvent
  const pump_event = await prisma.plant.findUnique({
    where: { id: plant_id },
    select: {
      iot_dev: {
        select: {
          dev_event: {
            select: { pump_event: true },
          },
        },
      },
    },
  });
  const pumpEventValue = pump_event.iot_dev.dev_event.pump_event;
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
      },
    });
    console.log(`✅ 1 record inserted into Log table successfully via ${topic} at ${tempDate}.`);
  } catch (err) {
    console.error('❌ Error inserting into Log table:', err.message);
    throw err;
  }
}

module.exports = { insertDataLog };