const mqtt = require("mqtt")

/** @param { import('express').Express} app */
module.exports = app => {
    let logger = app.middlewares.log.logger;

    let mqttClient = mqtt.connect({
        host: process.env.MQTT_HOST,
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASSWORD,
        resubscribe: true,
        keepalive: 10,
        clean: false,
        clientId: 'mqttjs__enel_' + Math.random().toString(16).substring(2, 8),
        reconnectPeriod: 1000 * 1
    })
    
    
    mqttClient.on("error", (error) => {
        logger.error("[MQTT] error", error)
    })

    return mqttClient
}