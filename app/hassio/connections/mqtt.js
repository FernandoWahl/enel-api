const mqtt = require("mqtt")

/** @param { import('express').Express} app */
module.exports = app => {
    let logger = app.middlewares.log.logger;
    let options = app.hassio.config.options;

    let mqttClient = mqtt.connect({
        host: options.mqtt.host,
        username: options.mqtt.user,
        password: options.mqtt.password,
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