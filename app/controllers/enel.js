module.exports = app => {
    var jwt = app.middlewares.utils.jwt;
    var service = app.services.enel;

    this.usagehistory = (req, res) => {
        var token = req.headers['authorization'];
        jwt.verifyJwt(token)
            .then(result => service.usagehistory(result))
            .then(result => res.status(200).send(result))
            .catch(err => res.status(401).send(err));
    }

    this.bills = (req, res) => {
        var token = req.headers['authorization'];
        jwt.verifyJwt(token)
            .then(result => service.bills(result))
            .then(result => res.status(200).send(result))
            .catch(err => res.status(401).send(err));
    }

    this.getBill = (req, res) => {
        var token = req.headers['authorization'];
        var id = req.params.id;
        jwt.verifyJwt(token)
            .then(result => service.getBill(result, id))
            .then(result => res.status(200).send(result))
            .catch(err => res.status(401).send(err));
    }

    this.monthAnalisys = (req, res) => {
        var token = req.headers['authorization'];
        jwt.verifyJwt(token)
            .then(result => service.monthAnalisys(result))
            .then(result => res.status(200).send(result))
            .catch(err => res.status(401).send(err));
    }
    
    return this
};