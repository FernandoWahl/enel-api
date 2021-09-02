require('dotenv').config()
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express")

/** @param { import('express').Express} app */
module.exports = app => {
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


    const specs = swaggerJsdoc(options);

    app.use("/api-doc",
      swaggerUi.serve,
      swaggerUi.setup(specs)
    );
}