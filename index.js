const app = require('./app/config/express');
const path = require('path');

const fileRouter = require('./app/routes/route');
const settings = require('./app/config/config');
const logger = require('./app/config/logger');
const httpContext = require('express-http-context');

const server = require('http').createServer(app);
const urlPrefix = app.urlPrefix;

global.appRoot = path.resolve(__dirname);

process.setMaxListeners(0);

app.use(httpContext.middleware);
app.use(logger.loggerExpress);
app.use(`${app.urlPrefix}`, fileRouter);
app.use((req, res, next) => { 
    res.status(404).send({ code: 404 });
    next();
})

app.use((error, req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        res.status(500).send('error/500');
        return;
    }
    next(error);
});

let port = process.env.port || settings.server.port;
server.listen(port, () => {
    logger.debug(`Server running on http://localhost:${port}`);
    logger.debug(`GET http://localhost:${port}${urlPrefix}`);
})