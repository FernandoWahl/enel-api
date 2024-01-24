const capitalize = require('capitalize')
const axios = require('axios');

/** @param { import('express').Express } app */
module.exports = app => {
    let logger = app.middlewares.log.logger;

    let enelUtil = this;

    async function loadProperties(name) {
        try {
            let fs = app.middlewares.utils.fs;
            return fs.loadProperties(name)
        } catch (error) {
            return null
        }
    }

    this.firebaseLogin = (payload) => new Promise(async (resolve, reject) => {
        let token = await loadProperties("firebaseToken")
        if (token) {
            logger.debug("service:firebaseLogin:fromFile")
            resolve({ token });
        } else {
            axios.post("https://portalhome.eneldistribuicaosp.com.br/api/firebase/login", payload)
                .then(async function (response) {
                    if (response.data.token) {
                        let fs = app.middlewares.utils.fs;
                        await fs.saveProperties("firebaseToken", response.data.token)
                        resolve(response.data);
                    } else if (response.data.E_USER_NOT_FOUND) {
                        reject({ message: "E-mail não encontrado!" })
                    } else if (response.data.code) {
                        reject({ message: "Senha incorreta!" })
                    } else if (response.data.includes("Request unsuccessful")) {
                        let data = response.data;
                        reject({ message: "Possível erro de reCAPTCHA por multiplas tentativas! Url: https://portalhome.eneldistribuicaosp.com.br" + data.substring(data.indexOf('id="main-iframe" src="') + 22, data.indexOf('" frameborder=0')) })
                    }
                })
                .catch(function (error) {
                    logger.error("service:firebaseLogin:error", error?.message || error);
                    reject(error?.message || error)
                })
        }
    })

    this.customToken = (firebaseLoginResponse) => {
        return new Promise((resolve, reject) => {
            let payload = {
                token: firebaseLoginResponse.token,
                returnSecureToken: true
            }
            axios.post("https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=AIzaSyAz4JxNF3rij5N0Y2gsATBV8amYMtC3Mzk", payload)
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(async function (error) {
                    let fs = app.middlewares.utils.fs;
                    await fs.removeProperties("firebaseToken")
                    logger.error("service:customToken:error", error?.message || error);
                    reject(error?.message || error)
                });
        });
    };

    this.getloginv2 = (customTokenResponse) => {
        return new Promise((resolve, reject) => {
            let payload = {
                "I_CANAL": "ZINT",
                "I_COBRADORA": "",
                "I_CPF": "",
                "I_CNPJ": "",
                "I_ANLAGE": "",
                "I_COD_SERV": "TC",
                "I_LISTA_INST": "X",
                "I_BANDEIRA": "X",
                "I_FBIDTOKEN": customTokenResponse.idToken,
                "I_VERTRAG": "",
                "I_PARTNER": "",
                "I_RESPOSTA_01": "",
                "I_RESPOSTA_02": "",
                "I_EXEC_LOGIN": "X",
                "I_AMBIENTE": "PRD"
            }
            axios.post("https://portalhome.eneldistribuicaosp.com.br/api/sap/getloginv2", payload)
                .then(function (response) {
                    resolve(enelUtil.getloginv2Parser(response.data, response.headers.authorization));
                })
                .catch(function (error) {
                    logger.error("service:getloginv2:error", error?.message || error);
                    reject(error?.message || error)
                });
        });
    }

    this.getloginv2Parser = (data, token) => {
        let returnData = {
            token: token,
            email: data.E_EMAIL,
            flag: data.E_BANDEIRA.toLowerCase(),
            name: capitalize.words(data.E_NOME),
            lastName: capitalize.words(data.E_SOBRENOME),
            dueDate: capitalize.words(data.E_VENCIMENTO),
            installations: []
        }
        data.ET_INST.forEach(value => {
            returnData.installations.push({
                address: capitalize.words(value.ENDERECO),
                anlage: value.ANLAGE,
                vertrag: value.VERTRAG,
                einzdat: value.EINZDAT,
                auszdat: value.AUSZDAT,

            })
        });
        return returnData;
    }

    return this
};

