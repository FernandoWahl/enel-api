const prefix = process.env.APP_PREFIX;

/** @param { import('express').Express } app */
module.exports = app => {
	let check = app.middlewares.utils.check;
	let validation = app.middlewares.utils.validation;
	let controller = app.controllers.enel;

	app.post(`${prefix}/changeinstallation`, validation.verifyJWT, check.changeinstallation, validation.verifyErros, controller.changeinstallation);
	app.get(`${prefix}/usagehistory`, validation.verifyJWT, validation.verifyErros, controller.usagehistory);
	app.get(`${prefix}/monthAnalisys`, validation.verifyJWT, validation.verifyErros, controller.monthAnalisys);
	app.get(`${prefix}/bills`, validation.verifyJWT, validation.verifyErros, controller.bills);
	app.get(`${prefix}/bills/:id([0-9Aa-z]+)`, validation.verifyJWT, validation.verifyErros, controller.getBill);

	return this;
}
