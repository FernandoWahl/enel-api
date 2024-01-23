/** @param { import('express').Express } app */
module.exports = app => {

    this.monthAnalisysParse = () => {
        let shareData = app.hassio.config.shareData;
        let data = shareData.getData();
        let state = data.monthAnalisys.value;
        
        let currentMonth = shareData.getData().bills[0]
        let monthAnalisys = Object.assign({}, data.monthAnalisys, currentMonth)
        delete monthAnalisys.value
        delete monthAnalisys.amount
        return {attr: monthAnalisys, state}
    }

    this.whiteTariffParse = () => {
        let shareData = app.hassio.config.shareData;
        let currentMonth = shareData.getData().bills[0]
        return {attr: {}, state: currentMonth.whiteTariff ? 'ON' : "OFF"}
    }

    this.valueTaxedParse = () => {
        let shareData = app.hassio.config.shareData;
        let historics =  shareData.getData().usagehistory.historic
        let currentMonth = historics[0]
        let barcode = shareData.getData().bills.find(b => b.belnr = currentMonth.belnr).barcode

        return {
            attr: {
                belnr: currentMonth.belnr,
                valueICMS: currentMonth.valueICMS,
                valueICMSFat: currentMonth.valueICMSFat,
                valueTaxed: currentMonth.valueTaxed,
                dueDate: currentMonth.dueDate,
                valueDays: currentMonth.valueDays,
                barcode: barcode
            }, 
            state: currentMonth.valueTaxed
        }
    }

    this.invoiceStatusParse = () => {
        let shareData = app.hassio.config.shareData;
        let historics =  shareData.getData().usagehistory.historic
        let currentMonth = historics[0]
        return {
            attr: {
                belnr: currentMonth.belnr,
                statusColor: currentMonth.statusColor,
                yearMonthRef: currentMonth.yearMonthRef,
                month: currentMonth.month,
                year: currentMonth.year,
                valueDays: currentMonth.valueDays,
                dueDate: currentMonth.dueDate,
            }, 
            state: currentMonth.status
        }
    }

    this.usageHistoryParse = () => {
        let shareData = app.hassio.config.shareData;
        let usagehistory =  shareData.getData().usagehistory

        return {
            attr: {
                flag: usagehistory.flag,
                consumption: usagehistory.consumption,
                amount: usagehistory.amount,
                icms: usagehistory.icms,
                tax: usagehistory.tax,
                historic: usagehistory.historic,
            }, 
            state: usagehistory.quantityMonths
        }

    }

    this.valueConsumptionParse = () => {
        let shareData = app.hassio.config.shareData;
        let historics =  shareData.getData().usagehistory.historic
        let currentMonth = historics[0]

        return {
            attr: {
                belnr: currentMonth.belnr,
                yearMonthRef: currentMonth.yearMonthRef,
                month: currentMonth.month,
                year: currentMonth.year,
                valueDays: currentMonth.valueDays,
                dueDate: currentMonth.dueDate
            }, 
            state: currentMonth.valueConsumptionDay
        }

    }

    this.valueConsumptionDayParse = () => {
        let shareData = app.hassio.config.shareData;
        let historics =  shareData.getData().usagehistory.historic
        let currentMonth = historics[0]

        return {
            attr: {
                belnr: currentMonth.belnr,
                yearMonthRef: currentMonth.yearMonthRef,
                month: currentMonth.month,
                year: currentMonth.year,
                valueDays: currentMonth.valueDays,
                dueDate: currentMonth.dueDate
            }, 
            state: currentMonth.valueConsumption
        }

    }
    
    return this
}