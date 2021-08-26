const settings  = require('../config/config');
const jwt       = require('jsonwebtoken');
const logger    = require('../config/logger');
const service   = require('../services/enel.service');

module.exports = {
    usagehistory: (req, res) => {
        var token = req.headers['authorization'];
        logger.debug("controller:usagehistory:body", token);
        verifyJwt(token)
            .then(result => service.usagehistory(result))
            .then(result => {
                logger.debug("controller:userAuthentication:result", result);
                res.status(200).send(result);
            })
            .catch(err => {
                logger.error("controller:usagehistory:error", err);
                return res.status(401).send(err);
            });
    },
    portalinfo: (req, res) => {
        var token = req.headers['authorization'];
        logger.debug("controller:portalinfo:body", token);
        verifyJwt(token)
            .then(result => service.portalinfo(result))
            .then(result => {
                logger.debug("controller:userAuthentication:result", result);
                res.status(200).send(result);
            })
            .catch(err => {
                logger.error("controller:portalinfo:error", err);
                return res.status(401).send(err);
            });
    }
};


var verifyJwt = (auth) => {
    return new Promise((resolve, reject) => {
        var token = auth.replace("Bearer ", "");
        jwt.verify(token, (process.env.secret || settings.jwt.secret), function (err, decoded) {
            if (err) {
                logger.error("controller:verifyJwt:error", err);
                reject({ message: 'Falha ao autenticar o token.' })
            }
            resolve(decoded.result.token);
        });
    });
}