const util = require('util')
/** @param { import('express').Express } app */
module.exports = app => {

	let logger = app.middlewares.log.logger;

	this.updateDeviceState = (active) => {
		let entities = app.hassio.entities;
		entities.monthAnalisys.updateAvailability(active)
		entities.usageHistory.updateAvailability(active)
		entities.whiteTariff.updateAvailability(active)

		logger.debug(`device:updateDeviceState - active=${active}`);
	}

	this.updateParameters = () => {
		let entities = app.hassio.entities;
		let parser = app.hassio.parser;

		let shareData = app.hassio.config.shareData;
		let data = shareData.getData();

		if (data.bills.length > 0) {
			logger.debug(`device:updateParameters - Inicio da atualização`);
			logger.debug(`device:updateParameters:monthAnalisys - state=${parser.monthAnalisysParse().state}`);
			entities.monthAnalisys.publishState(parser.monthAnalisysParse().state)
			entities.monthAnalisys.publishAttributes(parser.monthAnalisysParse().attr)

			logger.debug(`device:updateParameters:whiteTariff - state=${parser.whiteTariffParse().state}`);
			entities.whiteTariff.publishState(parser.whiteTariffParse().state)

			logger.debug(`device:updateParameters:valueTaxed - state=${parser.valueTaxedParse().state}`);
			entities.valueTaxed.publishState(parser.valueTaxedParse().state)
			entities.valueTaxed.publishAttributes(parser.valueTaxedParse().attr)

			logger.debug(`device:updateParameters:invoiceStatus - state=${parser.invoiceStatusParse().state}`);
			entities.invoiceStatus.publishState(parser.invoiceStatusParse().state)
			entities.invoiceStatus.publishAttributes(parser.invoiceStatusParse().attr)

			logger.debug(`device:updateParameters:usageHistory - state=${parser.usageHistoryParse().state}`);
			entities.usageHistory.publishState(parser.usageHistoryParse().state)
			entities.usageHistory.publishAttributes(parser.usageHistoryParse().attr)

			logger.debug(`device:updateParameters:valueConsumption - state=${parser.valueConsumptionParse().state}`);
			entities.valueConsumption.publishState(parser.valueConsumptionParse().state)
			entities.valueConsumption.publishAttributes(parser.valueConsumptionParse().attr)

			logger.debug(`device:updateParameters:valueConsumptionDay - state=${parser.valueConsumptionDayParse().state}`);
			entities.valueConsumptionDay.publishState(parser.valueConsumptionDayParse().state)
			entities.valueConsumptionDay.publishAttributes(parser.valueConsumptionDayParse().attr)

			logger.debug(`device:updateParameters - Fim da atualização`);
		} else {
			logger.error(`device:updateParameters - Instalação selecionada não contem contas ativas`);
		}
	}

	return this
}
