module.exports = app => {
    let jwt = app.middlewares.utils.jwt;
    let service = app.services.enel;

    const handleRequest = async (req, res, serviceFunction, ...args) => {
        try {
            const token = req.headers['authorization'];
            const result = await jwt.verifyJwt(token);
            const serviceResult = await serviceFunction(result, ...args);
            res.status(200).send(serviceResult);
        } catch (error) {
            res.status(401).send({"error": error?.message || error});
        }
    };

    this.changeinstallation = (req, res) => {
        let anlage = req.body.anlage;
        let vertrag = req.body.vertrag;
        handleRequest(req, res, service.changeinstallation, anlage, vertrag);
    }

    this.usagehistory = (req, res) => {
        handleRequest(req, res, service.usagehistory);
    }

    this.bills = (req, res) => {
        handleRequest(req, res, service.bills);
    }

    this.getBill = (req, res) => {
        let id = req.params.id;
        handleRequest(req, res, service.getBill, id);
    }

    this.getAccountInfo = (req, res) => {
        handleRequest(req, res, service.getAccountInfo);
    }

    this.monthAnalisys = (req, res) => {
        handleRequest(req, res, service.monthAnalisys);
    }
    
    return this
};