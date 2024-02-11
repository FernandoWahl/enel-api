const capitalize = require('capitalize');

/** @param { import('express').Express } app */
module.exports = app => {
    let axios = app.middlewares.globals.axios
    const logger = app.middlewares.log.logger;

    async function loadProperties(name) {
        try {
            let fs = app.middlewares.utils.fs;
            return fs.loadProperties(name)
        } catch (error) {
            return null
        }
    }

    const firebaseLogin = (payload) => new Promise(async (resolve, reject) => {
        let token = await loadProperties("token")
        if (token) {
            logger.debug("service:firebaseLogin:fromFile")
            resolve({ token });
        } else {
            axios.post("https://portalhome.eneldistribuicaosp.com.br/api/firebase/login", payload)
                .then(async function (response) {
                    if (response.data.token) {
                        let fs = app.middlewares.utils.fs;
                        await fs.saveProperties("token", response.data.token)
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

    const customToken = async (firebaseLoginResponse) => {
        try {
            const payload = {
                token: firebaseLoginResponse.token,
                returnSecureToken: true
            };
    
            const response = await axios.post("https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=AIzaSyAz4JxNF3rij5N0Y2gsATBV8amYMtC3Mzk", payload);
            return response.data;
        } catch (error) {
            try {
                const fs = app.middlewares.utils.fs;
                await fs.removeProperties("token");
            } catch (fsError) {}
    
            const errorMessage = error?.message || error;
            logger.error("service:customToken:error", errorMessage);
            throw error;
        }
    };

    const refreshToken = async (refreshToken) => {
        try {
            const payload = {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            };
    
            const response = await axios.post("https://securetoken.googleapis.com/v1/token?key=AIzaSyAz4JxNF3rij5N0Y2gsATBV8amYMtC3Mzk", payload);
            return response.data;
        } catch (error) {
            try {
                const fs = app.middlewares.utils.fs;
                await fs.removeProperties("token");
            } catch (fsError) {
                // Handle fs error if needed
            }
    
            const errorMessage = error?.message || error;
            logger.error("service:refreshToken:error", errorMessage);
            throw new Error(errorMessage);
        }
    };
    

    const getloginv2 = async (customTokenResponse) => {
        try {
            const payload = {
                "I_CANAL": "ZINT",
                "I_COBRADORA": "",
                "I_CPF": "",
                "I_CNPJ": "",
                "I_ANLAGE": "",
                "I_COD_SERV": "TC",
                "I_LISTA_INST": "X",
                "I_BANDEIRA": "X",
                "I_FBIDTOKEN": customTokenResponse.id_token,
                "I_VERTRAG": "",
                "I_PARTNER": "",
                "I_RESPOSTA_01": "",
                "I_RESPOSTA_02": "",
                "I_EXEC_LOGIN": "X",
                "I_AMBIENTE": "PRD"
            };
    
            const response = await axios.post("https://portalhome.eneldistribuicaosp.com.br/api/sap/getloginv2", payload);
            return getloginv2Parser(customTokenResponse, response.data, response.headers.authorization);
        } catch (error) {
            logger.error("service:getloginv2:error", error?.message || error);
            throw error;
        }
    };

    const getloginv2Parser = async (customToken, data, token) => {
        let returnData = {
            token: token,
            idToken: customToken.id_token,
            refreshToken: customToken.refresh_token,
            email: data.E_EMAIL,
            flag: data.E_BANDEIRA.toLowerCase(),
            name: capitalize.words(data.E_NOME),
            lastName: capitalize.words(data.E_SOBRENOME),
            dueDate: capitalize.words(data.E_VENCIMENTO),
            installations: []
        }

        let fs = app.middlewares.utils.fs;
        await fs.saveProperties("loginToken", returnData)

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

    this.login = async (email, password) => {
        try {
            logger.debug("service:login:email", email);
            const payload = {
                "I_CANAL": "ZINT",
                "I_EMAIL": email,
                "I_PASSWORD": password
            };

            const firebaseResponse = await firebaseLogin(payload);
            const customTokenResponse = await customToken(firebaseResponse);
            const token = await refreshToken(customTokenResponse.refreshToken);
            const loginv2Response = await getloginv2(token);

            return loginv2Response;
        } catch (error) {
            throw error;
        }
    };

    this.token = async (t) => {
        try {
            const token = await refreshToken(t);
            const loginv2Response = await getloginv2(token);
            return loginv2Response;
        } catch (error) {
            throw error;
        }
    };

    return this;
};
