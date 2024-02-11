const axios = require('axios');
const AxiosLogger = require('axios-logger');

/** @param { import('express').Express } app */
module.exports = app => {
    const axiosInstance = axios.create({});

    AxiosLogger.setGlobalConfig({
        headers: false,
        data: false
    })

    axiosInstance.interceptors.request.use((config) => config, AxiosLogger.errorLogger);
    axiosInstance.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);

    return axiosInstance
};