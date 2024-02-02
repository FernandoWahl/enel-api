const axios = require('axios');
const AxiosLogger = require('axios-logger')

/** @param { import('express').Express } app */
module.exports = app => {
    const axiosInstance = axios.create({
        withCredentials: true
    });
    axiosInstance.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
    axiosInstance.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);
    return axiosInstance
};