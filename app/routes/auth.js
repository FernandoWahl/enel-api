const prefix = process.env.APP_PREFIX;

/** @param { import('express').Express } app */
module.exports = app => {
	let check = app.middlewares.utils.check;
	let validation = app.middlewares.utils.validation;
	let controller = app.controllers.auth;

	app.post(`${prefix}/login`, check.login, validation.verifyErros, controller.userAuthentication);
	app.get(`${prefix}/verify`, validation.verifyJWT, validation.verifyErros, controller.userVerification);

	return this
}
