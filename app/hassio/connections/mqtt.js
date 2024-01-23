const mqtt = require("mqtt")

/** @param { import('express').Express} app */
module.exports = app => {
    let logger = app.middlewares.log.logger;
    let options = app.hassio.config.options;
    
    let mqttClient = mqtt.connect({
        host: options.mqtt_host,
        username: options.mqtt_user,
        password: options.mqtt_password,
        resubscribe: true,
        keepalive: 10,
        clean: false,
        clientId: 'mqttjs_enel_' + Math.random().toString(16).substring(2, 8),
        reconnectPeriod: 1000 * 1
    })

    mqttClient.on("error", (error) => {
        logger.error("[MQTT] error", error)
    })

    return mqttClient
}