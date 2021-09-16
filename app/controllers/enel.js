module.exports = app => {
	var logger = app.middlewares.globals.logger;
	var jwt = app.middlewares.utils.jwt;
	var service = app.services.enel;

	this.usagehistory = (req, res) => {
		var token = req.headers['authorization'];
		logger.debug("controller:usagehistory:body", token);
		jwt.verifyJwt(token)
			.then(result => service.usagehistory(result))
			.then(result => {
				logger.debug("controller:usagehistory:result", result);
				res.status(200).send(result);
			})
			.catch(err => {
				logger.error("controller:usagehistory:error", err);
				return res.status(401).send(err);
			});
	}

	this.bills = (req, res) => {
		var token = req.headers['authorization'];
		logger.debug("controller:bills:body", token);
		jwt.verifyJwt(token)
			.then(result => service.bills(result))
			.then(result => {
				logger.debug("controller:bills:result", result);
				res.status(200).send(result);
			})
			.catch(err => {
				logger.error("controller:bills:error", err);
				return res.status(401).send(err);
			});
	}

	this.getBill = (req, res) => {
		var token = req.headers['authorization'];
		var id = req.params.id;
		logger.debug("controller:bills:id", id);
		jwt.verifyJwt(token)
			.then(result => service.getBill(result, id))
			.then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				logger.error("controller:getBill:error", err);
				return res.status(401).send(err);
			});
	}


	this.monthAnalisys = (req, res) => {
		var token = req.headers['authorization'];
		logger.debug("controller:monthAnalisys:body", token);
		jwt.verifyJwt(token)
			.then(result => service.monthAnalisys(result))
			.then(result => {
				logger.debug("controller:monthAnalisys:result", result);
				res.status(200).send(result);
			})
			.catch(err => {
				logger.error("controller:monthAnalisys:error", err);
				return res.status(401).send(err);
			});
	}

	return this
};
