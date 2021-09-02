const express = require('express');
const consign = require('consign');
const load = require("express-load");
const settings = require('./config');
const cors = require('cors');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const compression = require('compression')


const urlPrefix = settings.server.urlPrefix;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API Enel",
      version: "0.1.0",
      description: "API to obtain data from the Enel website in a simplified way. https://www.enel.com.br/",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Fernando Wahl",
        email: "fernando@fwahl.org",
      },
    },
    tags: [
      { name: "Login" },
      { name: "Data" }
    ],
    servers: [
      {
        url: "http://localhost:40002/enel/",
      },
    ],
  },
  apis: ["./app/routes/route.js"],
};

module.exports = function () {
    const app = express();
    const specs = swaggerJsdoc(options);

    app.disable('x-powered-by')
    app.use(cors());
    app.use(compression())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true}))
    app.use("/api-doc",
      swaggerUi.serve,
      swaggerUi.setup(specs)
    );
    
    load('routes', { cwd: '../app' })
        .into(app);

    app.urlPrefix = urlPrefix;
    return app;
}()
