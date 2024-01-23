const fs = require("fs");
const isProduction = process.env.NODE_ENV === "production"
const rawOptions = fs.readFileSync(isProduction ? '/data/options.json' : './options-mock.json', 'utf8');

/** @param { import('express').Express } app */
module.exports = app => {
    const optionsFromfile = JSON.parse(rawOptions)
    let options = {
        email: optionsFromfile.email,
        password: optionsFromfile.password,
        mqtt_host: optionsFromfile.mqtt_host,
        mqtt_user: optionsFromfile.mqtt_user,
        mqtt_password: optionsFromfile.mqtt_password,
        instalation: optionsFromfile.instalation,
        update_interval: optionsFromfile.update_interval,
        server_only: false
    }
    return options
};