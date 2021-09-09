const axios      = require('axios');
const capitalize = require('capitalize')

var payload = {
    "I_CANAL": "ZINT",
    "I_COD_SERV": "TC",
    "I_SSO_GUID": ""
};

/** @param { import('express').Express } app */
module.exports = app => {
    var logger = app.middlewares.globals.logger;

    this.usagehistory = (token) => {
        return new Promise((resolve, reject) => {
            logger.debug("service:usagehistory:token", token);

            axios.post("https://portalhome.eneldistribuicaosp.com.br/api/sap/usagehistory", payload, { headers: { 'Authorization': token } })
            .then(function (response) {
                console.log(response.data);
                var historicData = response.data.ET_HISTORICO
                var returnData = {
                    flag: response.data.E_MSG_BAND, 
                    consumption: response.data.E_MSG_CONSUMO, 
                    amount: response.data.E_MSG_TOTAL, 
                    historic: []
                }
                historicData.forEach(value => {
                    returnData.historic.push({
                        "month": capitalize(value.MES),
                        "year": value.ANO,
                        "amount": value.VALOR_TOTAL,
                        "amountDay": value.VALOR_TOTAL_DIA,
                        "valueConsumption": value.VALOR_CONSUMO,
                        "valueConsumptionDay": value.VALOR_CONSUMO_DIA,
                        "valueDays": value.VALOR_DIAS,
                        "valueDaysFat": value.VALOR_DIAS_FAT,
                        "valueICMS": value.VALOR_ICMS,
                        "valueICMSFat": value.VALOR_ICMS_FAT,
                        "valueStax": value.VALOR_STAX,
                        "valueTaxed": value.VALOR_IMPO,
                        "dueDate": value.VENCIMENTO,
                        "billingPeriod": value.BILLING_PERIOD,
                        "barcode": value.COD_BARRAS,
                        "status": value.STATUS,
                        "statusColor": value.COR,
                    });
                });
                resolve(returnData);
            })
            .catch(function (error) {
                logger.error("service:usagehistory:error", error);
                reject({ message: 'Falha ao autenticar o token.' })
            });
        });
    }

    this.bills = (token) => {
        return new Promise((resolve, reject) => {
            logger.debug("service:portalinfo:token", token);

            axios.post("https://portalhome.eneldistribuicaosp.com.br/api/sap/portalinfo", payload, { headers: { 'Authorization': token } })
            .then(function (response) {
                console.log(response.data);
                var billsData = response.data.ET_CONTAS
                var returnData = {
                    bills: []
                }

                billsData.forEach(value => {
                    returnData.bills.push({
                        belnr: value.BELNR,
                        originDoc: value.ORIGEM_DOC,
                        status: value.SITUACAO,
                        dueDate: value.VENCIMENTO,
                        yearMonthRef: value.ANO_MES_REF,
                        amount: value.MONTANTE,
                        dateExtension: value.O_DT_PRORROG,
                        datePayment: value.O_DT_PAGTO,
                        barcode: value.O_COD_BARRAS,
                        color: value.COR,
                    });
                });
                resolve(returnData);
            })
            .catch(function (error) {
                logger.error("service:portalinfo:error", error);
                reject({ message: 'Falha ao autenticar o token.' })
            });
        });
    }

    return this;
};