require('dotenv').config()

const winston = require('winston');
const  expressWinston = require('express-winston');
const { combine, timestamp, printf, colorize, json } = winston.format;

function parseMessage(message, object) {
    if(object){
        if(object instanceof Error) {
            return  message + " - "  + object.stack;
        } else if(typeof object === 'object' && object !== null){
            return  message + " - " + JSON.stringify(object);
        } else {
            return  message + " - " + object;
        }
    } else {
        return message;
    }
}


/** @param { import('express').Express} app */
module.exports = app => {
    var winstonLogger = new winston.createLogger({
        level: process.env.APP_LOG_LEVEL,
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
                    printf(({ level, message, timestamp }) => {
                        return `${timestamp} -- ${level}: ${message}`;
                    })
                ),
            })
        ],
        exitOnError: false
    });

    this.log = function(level, message, object = null) {
        winstonLogger.log(level, parseMessage(message, object));
    }

    this.error = function(message, object = null) {
        winstonLogger.error(parseMessage(message, object));
    }

    this.warn = function(message, object = null) {
        winstonLogger.warn(parseMessage(message, object));
    }

    this.verbose = function(message, object = null) {
        winstonLogger.verbose(parseMessage(message, object));
    }
    this.info = function(message, object = null) {
        winstonLogger.info(parseMessage(message, object));
    }

    this.debug = function(message, object = null) {
        winstonLogger.debug(parseMessage(message, object));
    }

    this.silly = function(message, object = null) {
        winstonLogger.silly(parseMessage(message, object));
    }

    app.use(expressWinston.logger({
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
            printf(({ level, message, meta, timestamp }) => {
                return `${timestamp} -- ${level}: ${message} ${meta.res.statusCode} ${meta.responseTime} ms`;
            }),
        ),
    }))

    return this
}