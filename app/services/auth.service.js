const settings   = require('../config/config');
const logger     = require('../config/logger');
const axios      = require('axios');
const capitalize = require('capitalize')

module.exports = {
    login: (email, password) => {
        return new Promise((resolve, reject) => {
            logger.debug("service:login:email", email);
            var payload = {
                "I_CANAL":"ZINT",
                "I_EMAIL": email,
                "I_PASSWORD": password
            };

            firebaseLogin(payload)
            .then(response => customToken(response))
            .then(response => getloginv2(response))
            .then(response => {
                resolve(response)
            }).catch(error => {
                reject(error);
            })
        });
    }
};

var firebaseLogin = (payload) => {
    return new Promise((resolve, reject) => {
        axios.post(settings.enel.url+settings.enel.firebase, payload)
            .then(function (response) {
                resolve(response.data);
            })
            .catch(function (error) {
                logger.error("service:firebaseLogin:error", error);
                reject(error)
            });
    });
};

var customToken = (firebaseLoginResponse) => {
    return new Promise((resolve, reject) => {
        var payload = {
            token: firebaseLoginResponse.token,
            returnSecureToken: true
        }
        axios.post(settings.googleapi.url, payload)
            .then(function (response) {
                resolve(response.data);
            })
            .catch(function (error) {
                logger.error("service:customToken:error", error);
                reject(error)
            });
    });
};

var getloginv2 = (customTokenResponse) => {
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
        axios.post(settings.enel.url+settings.enel.getloginv2, payload)
            .then(function (response) {
                resolve(getloginv2Parser(response.data, response.headers.authorization));
            })
            .catch(function (error) {
                logger.error("service:getloginv2:error", error);
                reject(error)
            });
    });
}

var getloginv2Parser = (data, token) => {
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