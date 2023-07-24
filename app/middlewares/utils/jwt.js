const jwt = require('jsonwebtoken');

/** @param { import('express').Express } app */
module.exports = app => {

    this.verifyJwt = (auth) => {
        return new Promise((resolve, reject) => {
            let token = auth.replace("Bearer ", "");
            jwt.verify(token, process.env.APP_JWT_SECRET, function (err, decoded) {
                if (err) {
                    logger.error("utils:verifyJwt:error", err);
                    reject({ message: 'Falha ao autenticar o token.' })
                }
                resolve(decoded.result.token);
            });
        });
    }

    return this
};

