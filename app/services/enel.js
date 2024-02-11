const capitalize = require('capitalize');

const payload = {
    "I_CANAL": "ZINT",
    "I_COD_SERV": "TC",
    "I_SSO_GUID": ""
};

const fromTo = {
    "LEITURA_1": "Conventional",
    "LEITURA_2": "Peak",
    "LEITURA_3": "Intermediate",
    "LEITURA_4": "Off Peak"
};

const url = "https://portalhome.eneldistribuicaosp.com.br/api/sap";

/** @param { import('express').Express } app */
module.exports = app => {
    let logger = app.middlewares.log.logger;
    let axios = app.middlewares.globals.axios;
    const service = this;

    this.changeinstallation = async (dataToken, anlage, vertrag) => {
        try {
            const body = {
                "I_CANAL": "ZINT",
                "I_COBRADORA": "",
                "I_ANLAGE": anlage,
                "I_COD_SERV": "TC",
                "I_SERVICO": "A",
                "I_VERTRAG": vertrag,
                "I_BANDEIRA": "X",
                "I_AMBIENTE": "PRD"
            };

            const response = await axios.post(url + "/changeinstallation", body, {
                headers: {
                    'Authorization': dataToken.token
                }
            });

            return {
                "anlage": response.data.E_ANLAGE,
                "vertrag": response.data.E_VERTRAG,
                "flag": response.data.E_BANDEIRA,
                'closed': response.data.E_ENCERRADO === 'X',
                'address': response.data.E_ENDERECO,
            };
        } catch (error) {
            logger.error("service:changeinstallation:error", error?.message || error);
            throw error;
        }
    };

    this.usagehistory = async (dataToken) => {
        try {
            const [usagehistory, historyinfo] = await Promise.all([
                axios.post(url + "/usagehistory", payload, {
                    headers: {
                        'Authorization': dataToken.token
                    }
                }),
                service.historyinfo(dataToken)
            ]);

            const historyData = usagehistory.data;
            const infos = historyinfo;
            const historics = historyData.ET_HISTORICO;

            const returnData = {
                flag: historyData.E_MSG_BAND,
                consumption: historyData.E_MSG_CONSUMO,
                amount: historyData.E_MSG_TOTAL,
                icms: historyData.E_MSG_ICMS,
                tax: historyData.E_MSG_JURO,
                quantityMonths: historyData.E_QTD_MESES,
                historic: []
            };

            const historic = historics.map(value => {
                const ref = value.BILLING_PERIOD.split("/");
                const info = infos.find(i => i.yearMonthRef === ref[1] + "/" + ref[0]);

                return {
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
                };
            });

            historic.sort((a, b) => b.dueDate - a.dueDate);
            returnData.historic = historic;

            return returnData;
        } catch (error) {
            logger.error("service:usagehistory:error", error?.message || error);
            throw error;
        }
    };

    this.historyinfo = async (dataToken) => {
        try {
            const body = {
                "I_CANAL": "ZINT",
                "I_COD_SERV": "TC",
                "I_HIST_CONS": "X",
                "I_SOLIC": "X",
                "I_NOTIF": "X"
            };

            const response = await axios.post(url + "/portalhistoryinfo", body, {
                headers: {
                    'Authorization': dataToken.token
                }
            });

            const configs = response.data.ET_CONFIG.filter(b => b.GRAFICO === "M");
            const data = response.data.ET_HIST_REGISTR;

            return data.map(item => ({
                yearMonthRef: item.MESREF,
                whiteTariff: Object.entries(item).map(([k, v]) => k.includes("LEITURA_") && parseInt(k.replace("LEITURA_", "")) > 1 && v > 0).filter(i => i).length !== 0,
                consumes: configs.map(i => ({
                    type: fromTo[i.LEITURA],
                    description: i.DESC,
                    color: i.COR,
                    value: item[i.LEITURA]
                }))
            }));
        } catch (error) {
            logger.error("service:historyinfo:error", error?.message || error);
            throw error;
        }
    };

    this.getAccountInfo = async (dataToken) => {
        try {
            const accountInfo = await axios.post("https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=AIzaSyAz4JxNF3rij5N0Y2gsATBV8amYMtC3Mzk", {"idToken": dataToken.idToken });
            return accountInfo.data.users[0];
        } catch (error) {
            logger.error("service:bills:error", error?.message || error);
            throw error;
        }
    };

    this.bills = async (dataToken) => {
        try {
            const [portalInfo, historyinfo] = await Promise.all([
                axios.post(url + "/portalinfo", payload, {
                    headers: {
                        'Authorization': dataToken.token
                    }
                }),
                service.historyinfo(dataToken)
            ]);

            const billsData = portalInfo.data.ET_CONTAS.map(item => Object.assign({
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
            }, historyinfo.find(i => i.yearMonthRef === item.ANO_MES_REF)));

            return { bills: billsData };
        } catch (error) {
            logger.error("service:bills:error", error?.message || error);
            throw error;
        }
    };

    this.getBill = async (dataToken, id) => {
        try {
            logger.debug("service:getBill:id", id);

            const body = {
                "I_BELNR": id,
                "I_CANAL": "ZINT",
                "I_COD_SERV": "SV"
            };

            const response = await axios.post(url + "/getbilldetail", body, {
                headers: {
                    'Authorization': dataToken.token
                }
            });

            const billdetails = response.data.ET_COMP_FAT;
            const billItens = response.data.ET_ITENS_FAT;

            const returnData = {
                belnr: response.data.I_BELNR,
                detail: billdetails.map(bill => ({
                    id: parseInt(bill.CLASSIF),
                    name: bill.DESC_CLASSIF,
                    value: bill.VALOR,
                    itemDescribe: billItens
                        .filter(item => item.CLASSIF == bill.CLASSIF)
                        .map(item => ({
                            name: item.DESC_ITEM,
                            value: item.VALOR
                        }))
                }))
            };

            const result = await service.bills(dataToken);
            return Object.assign(result.bills.find(b => b.belnr === id), returnData);
        } catch (error) {
            logger.error("service:getBill:error", error?.message || error);
            throw error;
        }
    };

    this.monthAnalisys = async (dataToken) => {
        try {
            const response = await axios.post(url + "/monthAnalisys", payload, {
                headers: {
                    'Authorization': dataToken.token
                }
            });

            return {
                monthAnalisys: response.data.E_MESSAGE,
                start: response.data.E_ATUAL_INICIO,
                end: response.data.E_ATUAL_FIM,
                value: response.data.E_ATUAL_VALOR,
            };
        } catch (error) {
            logger.error("service:monthAnalisys:error", error?.message || error);
            throw error;
        }
    };

    return this;
};
