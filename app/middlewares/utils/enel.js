const axios      = require('axios');
const capitalize = require('capitalize')

/** @param { import('express').Express } app */
module.exports = app => {
    var logger = app.middlewares.globals.logger;
    var enelUtil = this;
    
    this.firebaseLogin = (payload) => {
        return new Promise((resolve, reject) => {
            axios.post("https://portalhome.eneldistribuicaosp.com.br/api/firebase/login", payload)
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    logger.error("service:firebaseLogin:error", error);
                    reject(error)
                });
        });
    };
    
    this.customToken = (firebaseLoginResponse) => {
        return new Promise((resolve, reject) => {
            var payload = {
                token: firebaseLoginResponse.token,
                returnSecureToken: true
            }
            axios.post("https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=AIzaSyAz4JxNF3rij5N0Y2gsATBV8amYMtC3Mzk", payload)
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    logger.error("service:customToken:error", error);
                    reject(error)
                });
        });
    };
    
    this.getloginv2 = (customTokenResponse) => {
        return new Promise((resolve, reject) => {
            var payload = {
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
                    logger.error("service:getloginv2:error", error);
                    reject(error)
                });
        });
    }
    
    this.getloginv2Parser = (data, token) => {
        var returnData = {
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
               id: value.ANLAGE,
            })
        });
        return returnData;
    }

    return this
};

