const capitalize = require('capitalize')

let payload = {
    "I_CANAL": "ZINT",
    "I_COD_SERV": "TC",
    "I_SSO_GUID": ""
};

let fromTo = {
    "LEITURA_1": "Conventional",
    "LEITURA_2": "Peak",
    "LEITURA_3": "Intermediate",
    "LEITURA_4": "Off Peak"
}

let url = "https://portalhome.eneldistribuicaosp.com.br/api/sap"

/** @param { import('express').Express } app */
module.exports = app => {
    let logger = app.middlewares.log.logger;
    let axios = app.middlewares.globals.axios;
    let service = this

    this.changeinstallation = (token, anlage, vertrag) => {
        return new Promise((resolve, reject) => {
            let body = { 
                "I_CANAL": "ZINT", 
                "I_COBRADORA": "", 
                "I_ANLAGE": anlage, 
                "I_COD_SERV": "TC", 
                "I_SERVICO": "A", 
                "I_VERTRAG": vertrag, 
                "I_BANDEIRA": "X", 
                "I_AMBIENTE": "PRD" 
            };
            
            axios.post(url + "/changeinstallation", body, {
                headers: {
                    'Authorization': token
                }
            })
            .then(function (response) { 
                resolve({
                    "anlage": response.data.E_ANLAGE,
                    "vertrag": response.data.E_VERTRAG,
                    "flag": response.data.E_BANDEIRA,
                    'closed': response.data.E_ENCERRADO === 'X',
                    'address': response.data.E_ENDERECO,
                });
            })
            .catch(function (error) {
                logger.error("service:historyinfo:error", error);
                reject({
                    message: 'Falha ao autenticar o token.'
                })
            });
            
        });
    }
    
    this.usagehistory = (token) => {
        return new Promise((resolve, reject) => {
            let usagehistory = axios.post(url + "/usagehistory", payload, {
                headers: {
                    'Authorization': token
                }
            });
            
            let historyinfo = service.historyinfo(token);

            Promise.all([usagehistory, historyinfo]).then(values => {
                let historyData = values[0].data;
                let infos = values[1];
                let historics = historyData.ET_HISTORICO
                let returnData = {
                    flag: historyData.E_MSG_BAND,
                    consumption: historyData.E_MSG_CONSUMO,
                    amount: historyData.E_MSG_TOTAL,
                    icms: historyData.E_MSG_ICMS,
                    tax: historyData.E_MSG_JURO,
                    quantityMonths: historyData.E_QTD_MESES,
                    historic: []
                }
                let historic = [];
                for (const value of historics) {
                    let ref = value.BILLING_PERIOD.split("/");
                    let info = infos.find(i => i.yearMonthRef == ref[1] + "/" + ref[0]);
                    historic.push({
                        anlage: value.ANLAGE,
                        vertrag: value.VERTRAG,
                        belnr: value.BELNR,
                        month: capitalize(value.MES),
                        year: value.ANO,
                        yearMonthRef: info.yearMonthRef,
                        whiteTariff: info.whiteTariff,
                        amount: value.VALOR_TOTAL,
                        amountDay: value.VALOR_TOTAL_DIA,
                        valueConsumption: value.VALOR_CONSUMO,
                        valueConsumptionDay: value.VALOR_CONSUMO_DIA,
                        valueDays: value.VALOR_DIAS,
                        valueDaysFat: value.VALOR_DIAS_FAT,
                        valueICMS: value.VALOR_ICMS,
                        valueICMSFat: value.VALOR_ICMS_FAT,
                        valueStax: value.VALOR_STAX,
                        valueTaxed: value.VALOR_IMPO,
                        dueDate: parseInt(value.VENCIMENTO),
                        barcode: value.COD_BARRAS,
                        status: value.STATUS,
                        statusColor: value.COR,
                        consumes: info.consumes
                    });

                }
                historic.sort(function (a, b) {
                    if (a.dueDate < b.dueDate) {
                        return 1;
                    }
                    if (a.dueDate > b.dueDate) {
                        return -1;
                    }
                    return 0;
                });
                returnData.historic = historic;
                resolve(returnData);
            })
            .catch(function (error) {
                logger.error("service:usagehistory:error", error);
                reject({
                    message: 'Falha ao autenticar o token.'
                })
            });
        });
    }

    this.historyinfo = (token) => {
        return new Promise((resolve, reject) => {
            let body = {
                "I_CANAL": "ZINT",
                "I_COD_SERV": "TC",
                "I_HIST_CONS": "X",
                "I_SOLIC": "X",
                "I_NOTIF": "X"
            };
            axios.post(url + "/portalhistoryinfo", body, {
                    headers: {
                        'Authorization': token
                    }
                })
                .then(function (response) {
                    let configs = response.data.ET_CONFIG.filter(b => b.GRAFICO == "M");
                    let data = response.data.ET_HIST_REGISTR;
                    
                    resolve(
                        data.map(item => {
                            return {
                                yearMonthRef: item.MESREF,
                                whiteTariff: Object.entries(item).map(( [k, v] ) =>  k.includes("LEITURA_") && parseInt(k.replace("LEITURA_", "")) > 1 && v > 0).filter(i => i).length != 0,
                                consumes: configs.map(i => {
                                    return {
                                        type: fromTo[i.LEITURA],
                                        description: i.DESC,
                                        color: i.COR,
                                        value: item[i.LEITURA]
                                    };
                                })
                            }
                        })
                    );
                })
                .catch(function (error) {
                    logger.error("service:historyinfo:error", error);
                    reject({
                        message: 'Falha ao autenticar o token.'
                    })
                });
        });
    }

    this.bills = (token) => {
        return new Promise((resolve, reject) => {
            let portalInfo = axios.post(url + "/portalinfo", payload, {
                headers: {
                    'Authorization': token
                }
            });

            let historyinfo = service.historyinfo(token);

            Promise.all([portalInfo, historyinfo]).then(function (values) {
                let billsData = values[0].data.ET_CONTAS
                let infos = values[1];
                billsData = billsData.map(item => {
                    return Object.assign({
                        belnr: item.BELNR,
                        originDoc: item.ORIGEM_DOC,
                        status: item.SITUACAO,
                        dueDate: item.VENCIMENTO,
                        yearMonthRef: item.ANO_MES_REF,
                        amount: item.MONTANTE,
                        dateExtension: item.O_DT_PRORROG,
                        datePayment: item.O_DT_PAGTO,
                        barcode: item.O_COD_BARRAS,
                        color: item.COR,
                    }, infos.find(i => i.yearMonthRef == item.ANO_MES_REF))
                });

                resolve({bills: billsData});
            })
            .catch(function (error) {
                logger.error("service:bills:error", error);
                reject({
                    message: 'Falha ao autenticar o token.'
                })
            });
        });
    }

    this.getBill = (token, id) => {
        return new Promise((resolve, reject) => {
            logger.debug("service:getBill:id", id);

            let body = {
                "I_BELNR": id,
                "I_CANAL": "ZINT",
                "I_COD_SERV": "SV"
            };

            axios.post(url + "/getbilldetail", body, {
                    headers: {
                        'Authorization': token
                    }
                })
                .then((response) => {
                    let billdetails = response.data.ET_COMP_FAT
                    let billItens = response.data.ET_ITENS_FAT
                    let returnData = {
                        belnr: response.data.I_BELNR,
                        detail: []
                    }

                    billdetails.forEach(bill => {
                        returnData.detail.push({
                            id: parseInt(bill.CLASSIF),
                            name: bill.DESC_CLASSIF,
                            value: bill.VALOR,
                            itemDescribe: billItens
                                .filter(item => item.CLASSIF == bill.CLASSIF)
                                .map(item => {
                                    return {
                                        name: item.DESC_ITEM,
                                        value: item.VALOR
                                    }
                                })
                        });
                    });

                    service.bills(token)
                        .then(result => resolve(Object.assign(result.bills.find(b => b.belnr == id), returnData)))
                        .catch(error => reject(error?.message || error));
                }).catch(error => {
                    logger.error("service:getBill:error", error?.message || error);
                    reject({
                        message: 'Falha ao autenticar o token.'
                    })
                });

        });
    }

    this.monthAnalisys = (token) => {
        return new Promise((resolve, reject) => {
            axios.post(url + "/monthAnalisys", payload, {
                    headers: {
                        'Authorization': token
                    }
                })
                .then(response =>
                    resolve({
                        monthAnalisys: response.data.E_MESSAGE,
                        start: response.data.E_ATUAL_INICIO,
                        end: response.data.E_ATUAL_FIM,
                        value: response.data.E_ATUAL_VALOR,
                    })
                )
                .catch(function (error) {
                    logger.error("service:monthAnalisys:error", error);
                    reject({
                        message: 'Falha ao autenticar o token.'
                    })
                });
        });
    }

    return this;
};