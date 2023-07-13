module.exports = app => {
    let jwt = app.middlewares.utils.jwt;
    let service = app.services.enel;

    this.changeinstallation = (req, res) => {
        let token = req.headers['authorization'];
        let anlage = req.body.anlage;
        let vertrag = req.body.vertrag;
        jwt.verifyJwt(token)
            .then(result => service.changeinstallation(result, anlage, vertrag))
            .then(result => res.status(200).send(result))
            .catch(err => res.status(401).send(err));
    }

    this.usagehistory = (req, res) => {
        let token = req.headers['authorization'];
        jwt.verifyJwt(token)
            .then(result => service.usagehistory(result))
            .then(result => res.status(200).send(result))
            .catch(err => res.status(401).send(err));
    }

    this.bills = (req, res) => {
        let token = req.headers['authorization'];
        jwt.verifyJwt(token)
            .then(result => service.bills(result))
            .then(result => res.status(200).send(result))
            .catch(err => res.status(401).send(err));
    }

    this.getBill = (req, res) => {
        let token = req.headers['authorization'];
        let id = req.params.id;
        jwt.verifyJwt(token)
            .then(result => service.getBill(result, id))
            .then(result => res.status(200).send(result))
            .catch(err => res.status(401).send(err));
    }

    this.monthAnalisys = (req, res) => {
        let token = req.headers['authorization'];
        jwt.verifyJwt(token)
            .then(result => service.monthAnalisys(result))
            .then(result => res.status(200).send(result))
            .catch(err => res.status(401).send(err));
    }
    
    return this
};