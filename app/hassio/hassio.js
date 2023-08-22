/** @param { import('express').Express } app */
module.exports = app => {
    let options = app.hassio.config.options;
    let shareData = app.hassio.config.shareData;
    let logger = app.middlewares.log.logger;
    let mqttClient = app.hassio.connections.mqtt;
    let enelApi = app.hassio.enelApi;

    mqttClient.on("connect", () => {
        logger.debug(`MQTT Connected success!`);

        const update = (retries = 0) => {
            logger.debug(`hassio:update retries=${retries}`)
            let device = app.hassio.device;
            enelApi.loginAndInstalation()
                .then(result => shareData.setLogin(result))
                .then(result => enelApi.getAllData(result.token))
                .then(result => shareData.setData(result))
                .then(() => device.updateParameters())
                .catch(error => {
                    if (error?.instalation) {
                        console.log("")
                        console.log("-----------------------------------------------------------------------------------------------------------------")
                        console.log(`Nenhuma instalação selecionada, escolha entre a seguintes opções:`)
                        console.log("-----------------------------------------------------------------------------------------------------------------")
                        error.installations.forEach(installation => {
                            console.log(`${installation.anlage} - Endereço: ${installation.address}`)
                        });
                        console.log("-----------------------------------------------------------------------------------------------------------------")
                        return;
                    }
                    if (retries < 5) {
                        return setTimeout(() => {
                            update(retries + 1)
                        }, 10000 * (retries + 1))
                    } else {
                        device.updateDeviceState(false)
                    }
                });

        }
        update()
        setInterval(update, options.update_interval * 1000 * 60 * 60)
    });
}