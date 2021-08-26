const express = require('express');
const bodyParser = require('body-parser');
var load = require("express-load");
const cors = require('cors');

const urlPrefix = '/enel';


module.exports = function () {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json({limit: '50mb', extended: true}))
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

    load('routes', { cwd: '../app' })
        .into(app);

    app.urlPrefix = urlPrefix;

    return app;
}()
