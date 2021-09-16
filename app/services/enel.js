const axios = require('axios');
const capitalize = require('capitalize')
const bwipjs = require('bwip-js');

var payload = {
	"I_CANAL": "ZINT",
	"I_COD_SERV": "TC",
	"I_SSO_GUID": ""
};

/** @param { import('express').Express } app */
module.exports = app => {
	var logger = app.middlewares.globals.logger;

	var service = this


	this.getBarcode = (barcode) => {
		return new Promise((resolve, reject) => {
			bwipjs.toBuffer({
					bcid: 'interleaved2of5',
					text: barcode,
					includetext: false,
					textxalign: 'center',
				})
				.then(png => {
					resolve(`data:image/png;base64,${png.toString('base64')}`)
				}).catch(err => {
					reject(err)
				});
		});
	}

	this.usagehistory = (token) => {
		return new Promise((resolve, reject) => {
			logger.debug("service:usagehistory:token", token);

			axios.post("https://portalhome.eneldistribuicaosp.com.br/api/sap/usagehistory", payload, {
					headers: {
						'Authorization': token
					}
				})
				.then(async function (response) {
					var historicData = response.data.ET_HISTORICO
					var returnData = {
						flag: response.data.E_MSG_BAND,
						consumption: response.data.E_MSG_CONSUMO,
						amount: response.data.E_MSG_TOTAL,
						historic: []
					}
					var historic = [];
					for await (const value of historicData) {
						var barcodeImage = await service.getBarcode(value.COD_BARRAS);
						historic.push({
							month: capitalize(value.MES),
							year: value.ANO,
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
							billingPeriod: value.BILLING_PERIOD,
							barcode: value.COD_BARRAS,
							barcodeImg: barcodeImage,
							status: value.STATUS,
							statusColor: value.COR,
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

	this.bills = (token) => {
		return new Promise((resolve, reject) => {
			logger.debug("service:bills:token", token);

			axios.post("https://portalhome.eneldistribuicaosp.com.br/api/sap/portalinfo", payload, {
					headers: {
						'Authorization': token
					}
				})
				.then(function (response) {
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

			var body = {
				"I_BELNR": id,
				"I_CANAL": "ZINT",
				"I_COD_SERV": "SV"
			};

			axios.post("https://portalhome.eneldistribuicaosp.com.br/api/sap/getbilldetail", body, {
					headers: {
						'Authorization': token
					}
				})
				.then((response) => {
					var billdetails = response.data.ET_COMP_FAT
					var billItens = response.data.ET_ITENS_FAT
					var returnData = {
						belnr: response.data.I_BELNR,
						detail: []
					}

					billdetails.forEach(bill => {
						var itens = billItens
							.filter(item => item.CLASSIF == bill.CLASSIF)
							.map(item => {
								return {
									name: item.DESC_ITEM,
									value: item.VALOR
								}
							});
						returnData.detail.push({
							id: parseInt(bill.CLASSIF),
							name: bill.DESC_CLASSIF,
							value: bill.VALOR,
							itemDescribe: itens
						});
					});

					service.bills(token).then(result => {
						var billFilter = result.bills.find(b => b.belnr == id);
						bwipjs.toBuffer({
								bcid: 'interleaved2of5',
								text: billFilter.barcode.replaceAll(" ", ""),
								includetext: true,
								textxalign: 'center',
							})
							.then(png => {
								billFilter.barcodeImg = `data:image/png;base64,${png.toString('base64')}`;
								resolve(Object.assign(billFilter, returnData));
							}).catch(err => {
								logger.error("controller:getBill:error", err);
								reject({
									message: err
								})
							});
					}).catch(err => {
						logger.error("controller:getBill:error", err);
						reject({
							message: err
						})
					});
				})
				.catch(err => {
					logger.error("service:portalinfo:error", err);
					reject({
						message: err
					})
				});

		});
	}

	return this;
};
