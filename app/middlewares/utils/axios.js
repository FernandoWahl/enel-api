const axios = require('axios');

/** @param { import('express').Express } app */
module.exports = app => {
    axios.interceptors.request.use(config => {
        return config;
    }, error => {
        return Promise.reject(error);
    });

    axios.interceptors.response.use( response => {
        return response;
    }, error => {
        return Promise.reject(error);
    });

    return this
};