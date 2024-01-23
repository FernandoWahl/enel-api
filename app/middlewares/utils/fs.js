const fs = require('fs').promises;

/** @param { import('express').Express } app */
module.exports = app => {
    const FILENAME = "properties.json";
    const logger = app.middlewares.log.logger;

    async function load() {
        try {
            const data = await fs.readFile(FILENAME);
            return JSON.parse(data);
        } catch (err) {
            logger.error(`fs:load`, err?.message || err);
            throw err;
        }
    }

    async function save(obj) {
        try {
            await fs.writeFile(FILENAME, JSON.stringify(obj));
        } catch (err) {
            logger.error(`fs:save`, err?.message || err);
            throw err;
        }
    }

    this.saveProperties = async (name, value) => {
        try {
            let obj = await load();
            obj[name] = value;
            await save(obj);
        } catch (err) {
            logger.error(`fs:saveProperties`, err?.message || err);
            throw err;
        }
    };


    this.removeProperties = async (name) => {
        try {
            let obj = await load();
            delete obj[name]
            await save(obj);
        } catch (err) {
            logger.error(`fs:saveProperties`, err?.message || err);
            throw err;
        }
    };

    this.loadProperties = async (name) => {
        const obj = await load();
        return obj[name];
    };

    return this;
};