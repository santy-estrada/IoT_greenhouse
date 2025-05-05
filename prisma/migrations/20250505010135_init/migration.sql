-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "entry_creation_time" TIMESTAMP(3) NOT NULL,
    "entry_store_time" TIMESTAMP(3) NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "luminosity_state" DOUBLE PRECISION NOT NULL,
    "humidity_state" DOUBLE PRECISION NOT NULL,
    "luminosity_event" DOUBLE PRECISION NOT NULL,
    "humidity_event" DOUBLE PRECISION NOT NULL,
    "plant_id" INTEGER NOT NULL,
    "valve_state" BOOLEAN NOT NULL,
    "pump_state" BOOLEAN NOT NULL,
    "led_intensity_state" INTEGER NOT NULL,
    "valve_event" BOOLEAN NOT NULL,
    "pump_event" BOOLEAN NOT NULL,
    "led_intensity_event" INTEGER NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantState" (
    "id" SERIAL NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "luminosity_state" DOUBLE PRECISION NOT NULL,
    "humidity_state" DOUBLE PRECISION NOT NULL,
    "valve_state" BOOLEAN NOT NULL,
    "led_intensity_state" INTEGER NOT NULL,

    CONSTRAINT "PlantState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantEvent" (
    "id" SERIAL NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "luminosity_event" DOUBLE PRECISION NOT NULL,
    "humidity_event" DOUBLE PRECISION NOT NULL,
    "valve_event" BOOLEAN NOT NULL,
    "led_intensity_event" INTEGER NOT NULL,

    CONSTRAINT "PlantEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" SERIAL NOT NULL,
    "error" BOOLEAN NOT NULL,
    "plant_state_id" INTEGER NOT NULL,
    "plant_event_id" INTEGER NOT NULL,
    "iot_dev_id" INTEGER NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IotDev" (
    "id" SERIAL NOT NULL,
    "online_status" BOOLEAN NOT NULL,
    "dev_state_id" INTEGER NOT NULL,
    "dev_event_id" INTEGER NOT NULL,
    "pump_event" BOOLEAN NOT NULL,

    CONSTRAINT "IotDev_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IotDevState" (
    "id" SERIAL NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "pump_state" BOOLEAN NOT NULL,

    CONSTRAINT "IotDevState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IotDevEvent" (
    "id" SERIAL NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "pump_event" BOOLEAN NOT NULL,

    CONSTRAINT "IotDevEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_plant_state_id_fkey" FOREIGN KEY ("plant_state_id") REFERENCES "PlantState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_plant_event_id_fkey" FOREIGN KEY ("plant_event_id") REFERENCES "PlantEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_iot_dev_id_fkey" FOREIGN KEY ("iot_dev_id") REFERENCES "IotDev"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IotDev" ADD CONSTRAINT "IotDev_dev_state_id_fkey" FOREIGN KEY ("dev_state_id") REFERENCES "IotDevState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IotDev" ADD CONSTRAINT "IotDev_dev_event_id_fkey" FOREIGN KEY ("dev_event_id") REFERENCES "IotDevEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
