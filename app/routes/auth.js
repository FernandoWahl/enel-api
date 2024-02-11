const prefix = process.env.APP_PREFIX;

/** @param { import('express').Express } app */
module.exports = app => {
	const {check, validation}  = app.middlewares.utils;
	let controller = app.controllers.auth;

	app.post(`${prefix}/login`, check.login, validation.verifyErros, controller.userAuthentication);
	app.post(`${prefix}/login/token`, controller.tokenAuthentication);
	app.get(`${prefix}/verify`, validation.verifyJWT, validation.verifyErros, controller.userVerification);

	return this
}
