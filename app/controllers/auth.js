const jwt = require('jsonwebtoken');

module.exports = app => {
    let logger = app.middlewares.log.logger;
    let service = app.services.auth;

    this.userAuthentication = (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        service.login(email, password)
            .then(result => {
                let token = jwt.sign({ result: result }, process.env.APP_JWT_SECRET, { expiresIn: "48h" });
                let dataReturn = result;
                dataReturn.token = token;
                res.status(200).send(dataReturn)
            })
            .catch(error => {
                res.status(400).send({message: 'Falha ao autenticar.'})
            });
    }

    this.userVerification = (req, res) => {
        let token = req.headers['authorization'];
        logger.debug("controller:userVerification:token", token);
        if (!token) {
            return res.status(401).send({ message: 'Nenhum token fornecido.' });
        } else {
            token = token.replace("Bearer ", "")
        }
        jwt.verify(token, process.env.APP_JWT_SECRET, function (err, decoded) {
            if (err) {
                logger.error("controller:userVerification:error", err);
                return res.status(401).send({ message: 'Falha ao autenticar o token.' });
            }
            logger.debug("controller:userVerification:result", decoded.result);
            global.token = decoded.result.token;
            return res.status(200).send(decoded.result);
        });
    }

    return this
};