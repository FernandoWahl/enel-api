/** @param { import('express').Express } app */
module.exports = app => {
    let options = app.hassio.config.options;
    let device = app.hassio.device;
    let shareData = app.hassio.config.shareData;
    let logger = app.middlewares.log.logger;
    let mqttClient = app.hassio.connections.mqtt;
    let enelApi = app.hassio.enelApi;

    mqttClient.on("connect", () => {
        logger.debug(`MQTT Connected success!`);

        const update = (retries = 0) => {
            try {
                logger.debug(`hassio:update retries=${retries}`)
                enelApi.loginAndInstalation()
                    .then(result => shareData.setLogin(result))
                    .then(result => enelApi.getAllData(result.token))
                    .then(result => shareData.setData(result))
                    .then(() => device.updateParameters())
                    .catch(error => {
                        throw error;
                    });
            } catch (error) {
                logger.error(`hassio:update:error`, error?.message || error)
                if (retries < 5){
                    return setTimeout(() => {
                        update(retries + 1)
                    }, 1000 * (retries + 1))
                } else {
                    device.updateDeviceState(false)
                }
            }
        }
        update()
        setInterval(update, options.update_interval * 1000 * 60 * 60)
    });
}