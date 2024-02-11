/** @param { import('express').Express } app */
module.exports = app => {
    let options = app.hassio.config.options;
    let shareData = app.hassio.config.shareData;
    let logger = app.middlewares.log.logger;
    let mqttClient = app.hassio.connections.mqtt;
    let enelApi = app.hassio.enelApi;

    mqttClient.on("connect", async () => {
        logger.debug(`MQTT Connected success!`);

        if(options.temp_token){
            logger.debug("Set temp token:", options.temp_token)
            let fs = app.middlewares.utils.fs;
            await fs.saveProperties("token", options.temp_token)
        }
        const update = async (retries = 0) => {
            try {
                logger.debug(`hassio:update retries=${retries}`);
        
                const device = app.hassio.device;
                const loginResult = await enelApi.loginOrTokenAndInstalation();
                await shareData.setLogin(loginResult);
                
                const allDataResult = await enelApi.getAllData(loginResult);
                await shareData.setData(allDataResult);
                
                await device.updateParameters();
            } catch (error) {
                if (error?.instalation) {
                    logger.warn("-----------------------------------------------------------------------------------------------------------------");
                    logger.warn("Nenhuma instalação selecionada, escolha entre as seguintes opções:");
                    logger.warn("-----------------------------------------------------------------------------------------------------------------");
                    error.installations.forEach(installation => {
                        logger.warn(`${installation.anlage} - Endereço: ${installation.address}`);
                    });
                    logger.warn("-----------------------------------------------------------------------------------------------------------------");
                    return;
                }
                
                if (retries < 5) {
                    return setTimeout(() => update(retries + 1), 10000 * (retries + 1));
                } else {
                    app.hassio.device.updateDeviceState(false);
                }
            }
        };
        
        update()
        setInterval(update, options.update_interval * 1000 * 60 * 60)
    });
}