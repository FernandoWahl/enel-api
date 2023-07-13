const axios = require('axios');

/** @param { import('express').Express } app */
module.exports = app => {
    const axiosInstance = axios.create({});
    axiosInstance.interceptors.request.use(config => {
        return config;
    }, error => Promise.reject(error));

    axiosInstance.interceptors.response.use( response => {
        return response;
    }, error => Promise.reject(error));

    return axiosInstance
};