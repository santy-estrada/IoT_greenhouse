const mqtt = require('mqtt');

function createMqttClient() {
  const host = process.env.MQTT_HOST;
  const port = process.env.MQTT_PORT;
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
  const connectUrl = `mqtt://${host}:${port}`;

  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
    reconnectPeriod: 1000,
  });

  client.on('connect', () => {
    console.log('MQTT connected');
    const topics = [`${process.env.MQTT_MESSAGE_TOPIC}`, `${process.env.MQTT_TEST_TOPIC}`, `${process.env.MQTT_REAL_TOPIC}`, `${process.env.MQTT_REAL_TOPIC}`];	
    client.subscribe(topics, () => {
        topics.forEach((topic) => console.log(`Subscribed to topic: ${topic}`));
        console.log('Synchronization set to: ', process.env.SYNC_INTERVAL/1000, 's' || '30s');
        console.log('Event check interval set to: ', process.env.EVENT_CHECK_INTERVAL/1000, 's' || '10s');
        console.log('IoT device online check interval set to: ', process.env.IOT_DEV_TIMEOUT/1000, 's' || '30s');
        const message = 'nodejs mqtt test';
        client.publish(`${topics[0]}`, message, { qos: 0, retain: false }, (error) => {
            if (error) console.error(error);
        });
    });
  });

  client.on('error', (err) => {
    console.error('MQTT connection error:', err.message);
  });

  return client;
}

module.exports = { createMqttClient };