const jwt = require('jsonwebtoken');

module.exports = app => {
    var logger = app.middlewares.globals.logger;
    var service = app.services.auth;
    var serviceEnel = app.services.enel;


    this.userAuthentication = (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        service.login(email, password)
            .then(result => res.status(200).send({token: jwt.sign({ result: result }, process.env.APP_JWT_SECRET, { expiresIn: "48h" }) }))
            .catch(error => res.status(400).send({message: 'Falha ao autenticar.'}));
    }

    this.haUserAuthentication = (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        service.login(email, password)
        .then(login => 
            Promise.all([serviceEnel.monthAnalisys(login.token), serviceEnel.usagehistory(login.token)]).then((values) => {
                var resultData = Object.assign(login, {analisys: values[0]}, values[1]);
                delete resultData.token;
                res.status(200).send(resultData);
            }))
        .catch(error => res.status(400).send({message: 'Falha ao autenticar.'}));
    }

    this.userVerification = (req, res) => {
        var token = req.headers['authorization'];
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