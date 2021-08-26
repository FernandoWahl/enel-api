const settings  = require('../config/config');
const jwt       = require('jsonwebtoken');
const logger    = require('../config/logger');
const service   = require('../services/auth.service');

module.exports = {
    userAuthentication: (req, res) => {
        logger.debug("controller:userAuthentication:body", req.body);
        const email = req.body.email;
        const password = req.body.password;

        service.login(email, password)
        .then(result => {
            logger.debug("controller:userAuthentication:result", result);
            var token = jwt.sign({ result: result }, (process.env.secret || settings.jwt.secret), { expiresIn:  process.env.expiresIn || settings.jwt.expiresIn });
            res.status(200).send({token: token });
        })
        .catch(error => {
            logger.error("controller:userAuthentication:error", error);
            return res.status(400).send({message: 'Falha ao autenticar.'});
        });
    },

    userVerification: (req, res) => {
        var token = req.headers['authorization'];
        logger.debug("controller:userVerification:token", token);
        if (!token) {
            return res.status(401).send({ message: 'Nenhum token fornecido.' });
        } else {
            token = token.replace("Bearer ", "")
        }
        jwt.verify(token, (process.env.secret || settings.jwt.secret), function (err, decoded) {
            if (err) {
                logger.error("controller:userVerification:error", err);
                return res.status(401).send({ message: 'Falha ao autenticar o token.' });
            }
            logger.debug("controller:userVerification:result", decoded.result);
            global.token = decoded.result.token;
            return res.status(200).send(decoded.result);
        });
    },
};