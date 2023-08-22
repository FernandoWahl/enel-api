/** @param { import('express').Express } app */
module.exports = app => {
    let options = app.hassio.config.options;
    let mqttClient = app.hassio.connections.mqtt;
    const deviceIdPrefix = `enel_${options.instalation}_`

    const haDevice = {
        identifiers: [
            options.email
        ],
        manufacturer: 'Enel Api',
        model: 'Enel Api Node',
        name: `Enel Api`,

    }

    const getEntityTopic = (component, objectId, action) => `homeassistant/${component}/${deviceIdPrefix}${objectId}/${action}`
    const createEntity = (component, objectId, config) => {
        const extendedConfig = {
            ...config,
            object_id: `${deviceIdPrefix}${objectId}`,
            state_topic: getEntityTopic(component, objectId, 'state'),
            unique_id: `${deviceIdPrefix}${objectId}`,
            json_attributes_topic: getEntityTopic(component, objectId, 'attributes'),
            availability: {
                payload_available: 'online',
                payload_not_available: 'offline',
                topic: getEntityTopic(component, objectId, 'availability')
            },
            device: haDevice
        }

        if (options.instalation) {
            mqttClient.publish(getEntityTopic(component, objectId, 'config'), JSON.stringify(extendedConfig))
        }

        const updateAvailability = (isAvailable) => {
            mqttClient.publish(getEntityTopic(component, objectId, 'availability'), isAvailable ? 'online' : 'offline')
        }

        updateAvailability(true)

        const publishState = (state) => {
            mqttClient.publish(getEntityTopic(component, objectId, 'state'), String(state))
            updateAvailability(true)
        }

        const publishAttributes = (attributes) => {
            mqttClient.publish(getEntityTopic(component, objectId, 'attributes'), String(JSON.stringify(attributes)))
            updateAvailability(true)
        }

        return {
            updateAvailability,
            publishState,
            publishAttributes
        }
    }

    const monthAnalisys = createEntity('sensor', 'month_analisys', {
        icon: 'mdi:calendar-month',
        name: 'Valor do mês',
        device_class: 'monetary',
        state_class: 'total_increasing',
        unit_of_measurement: 'BRL',
    })

    const usageHistory = createEntity('sensor', 'usage_history', {
        icon: 'mdi:calendar-month',
        name: 'Histórico de Consumo (Meses)'
    })

    const whiteTariff = createEntity('binary_sensor', 'white_tariff', {
        icon: 'mdi:currency-usd-off',
        name: 'Tarifa Branca'
    })

    const invoiceStatus = createEntity('sensor', 'invoice_status', {
        icon: 'mdi:receipt-text',
        name: 'Status Fatura'
    })

    const valueTaxed = createEntity('sensor', 'value_taxed', {
        icon: 'mdi:calendar-alert',
        name: 'Valor total das taxas',
        device_class: 'monetary',
        state_class: 'total_increasing',
        unit_of_measurement: 'BRL',
    })


    const valueConsumption = createEntity('sensor', 'valueConsumption', {
        icon: 'mdi:calendar-month',
        name: 'Consumo de Energia (Por mês)',
        unit_of_measurement: 'kWh',
        device_class: 'energy',
        state_class: 'total_increasing'
    })

    const valueConsumptionDay = createEntity('sensor', 'valueConsumptionDay', {
        icon: 'mdi:calendar-month',
        name: 'Consumo de Energia (Por dia)',
        unit_of_measurement: 'kWh',
        device_class: 'energy',
        state_class: 'total_increasing'
    })

    return {
        monthAnalisys,
        usageHistory,
        whiteTariff,
        invoiceStatus,
        valueTaxed,
        valueConsumption,
        valueConsumptionDay
    }
}
