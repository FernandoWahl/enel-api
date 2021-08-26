const winston = require('winston');
const  expressWinston = require('express-winston');
const { combine, timestamp, label, printf, colorize, json } = winston.format;
const settings = require('./config');

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} -- ${level}: ${message}`;
});

const myRequestFormat = printf(({ level, message, meta, timestamp }) => {
    return `${timestamp} -- ${level}: ${message} ${meta.res.statusCode} ${meta.responseTime}ms`;
});

var winstonLogger = new winston.createLogger({
    level: (process.env.level || settings.logs.level),
    format: json(),
    transports: [
        new winston.transports.Console({
            format: combine(
                winston.format(info => {
                    info.level = info.level.toUpperCase()
                    return info;
                })(),
                colorize(),
                timestamp(),
                myFormat
            ),
        })
    ],
    exitOnError: false
});

function testeObject(object) {
    if(object instanceof Error) {
        return ' ' + object.stack;
    } else if(typeof object === 'object' && object !== null){
        return ' ' + JSON.stringify(object);
    } else {
        return ' ' + object;
    }
}

var logger = {
    log: function(level, message, object = null) {
        winstonLogger.log(level, message + (object ? testeObject(object) : ''));
    },
    error: function(message, object = null) {
        winstonLogger.error(message + (object ? ' ' + testeObject(object) : ''));
    },
    warn: function(message, object = null) {
        winstonLogger.warn(message + (object ? ' ' + testeObject(object) : ''));
    },
    verbose: function(message, object = null) {
        winstonLogger.verbose(message + (object ? ' ' + testeObject(object) : ''));
    },
    info: function(message, object = null) {
        winstonLogger.info(message + (object ? ' ' + testeObject(object) : ''));
    },
    debug: function(message, object = null) {
        winstonLogger.debug(message + (object ? ' ' + testeObject(object) : ''));
    },
    silly: function(message, object = null) {
        winstonLogger.silly(message + (object ? ' ' + testeObject(object) : ''));
    }
};

var loggerExpress = expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: combine(
        winston.format((info, opts) => {
            info.level = info.level.toUpperCase()
            return info;
        })(),
        colorize(),
        timestamp(),
        myRequestFormat
    ),

})

module.exports = logger;
module.exports.loggerExpress = loggerExpress;