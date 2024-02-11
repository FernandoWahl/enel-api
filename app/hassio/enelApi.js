/** @param { import('express').Express } app */
module.exports = app => {
    let logger = app.middlewares.log.logger;
    let options = app.hassio.config.options;
    let serviceAuth = app.services.auth;
    let serviceEnel = app.services.enel;

    async function loadProperties(name) {
        try {
            let fs = app.middlewares.utils.fs;
            return fs.loadProperties(name)
        } catch (error) {
            return null
        }
    }

    const executeLogin = async (result) => {
        logger.debug(`enelApi:executeLogin - ${result.name} ${result.lastName}`);
        if (options.instalation) {
            const installation = result.installations.find(installation => installation.anlage === options.instalation);
    
            if (installation) {
                try {
                    logger.debug(`enelApi:executeLogin - Instalação encontrada - ${installation.address}`);
                    const resultInstalation = await serviceEnel.changeinstallation(result, installation.anlage, installation.vertrag);
                    return { ...result, currentInstalation: resultInstalation };
                } catch (error) {
                    throw error;
                }
            } else {
                throw new Error("Instalação não encontrada!");
            }
        } else {
            let error = new Error("Instalação não informada!"); 
            error.instalation = true
            error.installations = result.installations
            throw error;
        }
    };
    

    this.loginOrTokenAndInstalation = async () => {
        try {
            const loginToken = await loadProperties("loginToken");
            let promise = null;
            if (loginToken) {
                promise = serviceAuth.token(loginToken.refreshToken);
            } else {
                promise = serviceAuth.login(options.email, options.password);
            }
            const result = await promise;
            return await executeLogin(result);
        } catch (error) {
            logger.error(`enelApi:loginOrTokenAndInstalation - ${options.email}`, error?.message || error);
            throw error
        }
    };


    this.getAllData = (token) => {
        return new Promise((resolve, reject) => {
            let usagehistory = serviceEnel.usagehistory(token);
            let bills = serviceEnel.bills(token);
            let monthAnalisys = serviceEnel.monthAnalisys(token);
            logger.debug(`enelApi:getAllData - Inicio da busca de dados `)
            Promise.all([usagehistory, bills, monthAnalisys]).then(values => {
                logger.debug(`enelApi:getAllData - Dados obtidos com sucesso`)
                resolve({ usagehistory: values[0], bills: values[1].bills, monthAnalisys: values[2] })
            }).catch(function (error) {
                logger.error("enel:getAllData:error", error);
                reject(error?.message || error)
            });;
        })
    }
    return this
}