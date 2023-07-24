/** @param { import('express').Express } app */
module.exports = app => {
    let logger = app.middlewares.log.logger;
    let options = app.hassio.config.options;
    let serviceAuth = app.services.auth;
    let serviceEnel = app.services.enel;

    this.loginAndInstalation = () => {
        return new Promise((resolve, reject) => {
            serviceAuth.login(options.email, options.password)
                .then(result => {
                    let isFind = false
                    logger.debug(`enelApi:loginAndInstalation - ${result.name} ${result.lastName}`)
                    result.installations.forEach(installation => {
                        if (installation.anlage == options.instalation) {
                            isFind = true;
                            serviceEnel.changeinstallation(result.token, installation.anlage, installation.vertrag)
                                .then(resultInstalation => {
                                    logger.debug(`enelApi:loginAndInstalation - Instalação encontrada - ${installation.address}`)
                                    resolve(Object.assign({}, result, {
                                        currentInstalation: resultInstalation
                                    }));
                                }).catch(error => {
                                    logger.error(`enelApi:loginAndInstalation:error - ${options.email}`, error?.message || error)
                                    reject(error?.message || error)
                                });
                        }
                    });
                    if (!isFind) {
                        logger.error(`enelApi:loginAndInstalation:error - Instalação não encontrada`)
                        reject("Instalação não encontrada!");
                    }
                })
                .catch(error => {
                    logger.error(`enelApi:loginAndInstalation - ${options.email}`, error?.message || error)
                    reject(error?.message || error)
                });
        })
    }

    this.getAllData = (token) => {
        return new Promise((resolve, reject) => {
            let usagehistory = serviceEnel.usagehistory(token);
            let bills = serviceEnel.bills(token);
            let monthAnalisys = serviceEnel.monthAnalisys(token);
            logger.debug(`enelApi:getAllData - Inicio da busca de dados `)
            Promise.all([usagehistory, bills, monthAnalisys]).then(values => {
                logger.debug(`enelApi:getAllData - Dados obtidos com sucesso`)
                resolve({ usagehistory: values[0], bills: values[1].bills, monthAnalisys: values[2]})
            }).catch(function (error) {
                logger.error("enel:getAllData:error", error);
                reject(error?.message || error)
            });;
        })
    }
    return this
}