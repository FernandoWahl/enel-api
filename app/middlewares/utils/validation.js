const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

/** @param { import('express').Express } app */
module.exports = app => {
	var logger = app.middlewares.globals.logger;

	this.verifyJWT = (req, res, next) => {
		var token = req.headers['authorization'];
		if (!token) {
			return res.status(401).send({
				auth: false,
				message: 'No token provided.'
			});
		} else {
			token = token.replace("Bearer ", "")
		}
		jwt.verify(token, process.env.APP_JWT_SECRET, function (err, decoded) {
			if (err) return res.status(401).send({
				auth: false,
				message: 'Failed to authenticate token.'
			});
			logger.debug("validations:verifyJWT:user", decoded.result);
			req.token = token;
			req.user = decoded.result;
			req.email = decoded.result.email;
			next();
		});
	}

	this.verifyErros = (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json(errors.array());
		}
		next();
	}

    return this
}
