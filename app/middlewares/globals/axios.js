const axios = require("axios");
const AxiosLogger = require("axios-logger");

/** @param { import('express').Express } app */
module.exports = (app) => {
  const axiosInstance = axios.create({
    withCredentials: true,
  });

  const request = function (config) {
    return config;
  };

  const response = function (response) {
    return response;
  };

  axiosInstance.interceptors.request.use(request, AxiosLogger.errorLogger);
  axiosInstance.interceptors.response.use(response, AxiosLogger.errorLogger);
  return axiosInstance;
};
