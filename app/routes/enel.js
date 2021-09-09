require('dotenv').config()
const prefix = process.env.APP_PREFIX;

/**
 * @swagger
 * tags:
 *   name: Portal
 */

/** @param { import('express').Express } app */
module.exports = app => {

	var validation = app.middlewares.utils.validation;
	var controller = app.controllers.enel;

	/**
	 * @swagger
	 *
	 * /usagehistory:
	 *    get:
	 *      operationId: usagehistory
	 *      security: 
	 *        - BearerAuth: []
	 *      tags:
	 *        - Portal
	 *      responses:
	 *        "200":
	 *          description: Success
	 *        "401":
	 *          description: Unauthorized
	 *        "5XX":
	 *          description: Unexpected error
	 */
	app.get(`${prefix}/usagehistory`, validation.verifyJWT, validation.verifyErros, controller.usagehistory);

	/**
	 * @swagger
	 *
	 * /bills:
	 *    get:
	 *      operationId: bills
	 *      security: 
	 *        - BearerAuth: []
	 *      tags:
	 *        - Portal
	 *      responses:
	 *        "200":
	 *          description: Success
	 *        "401":
	 *          description: Unauthorized
	 *        "5XX":
	 *          description: Unexpected error
	 */
	app.get(`${prefix}/bills`, validation.verifyJWT, validation.verifyErros, controller.bills);

	return this;
}
