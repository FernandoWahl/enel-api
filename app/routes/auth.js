require('dotenv').config()
const prefix = process.env.APP_PREFIX;

/**
 * @swagger
 * tags:
 *   name: Auth
 */

/** @param { import('express').Express } app */
module.exports = app => {
	var check = app.middlewares.utils.check;
	var validation = app.middlewares.utils.validation;
	var controller = app.controllers.auth;

	/**
	 * @swagger
	 *
	 * /login:
	 *    post:
	 *      operationId: login
	 *      tags:
	 *        - Auth
	 *      requestBody:
	 *        content:
	 *          application/json:
	 *            schema:
	 *              $ref: "#/components/schemas/LoginRequest"
	 *      responses:
	 *        "200":
	 *          description: Success
	 *          content:
	 *            application/json:
	 *               schema:
	 *                 $ref: '#/components/schemas/TokenResponse'
	 *        "422":
	 *          description: Unprocessable Entity
	 *        "5XX":
	 *          description: Unexpected error
	 */
	app.post(`${prefix}/login`, check.login, validation.verifyErros, controller.userAuthentication);


	/**
	 * @swagger
	 *
	 * /verify:
	 *    get:
	 *      operationId: verify
	 *      security: 
	 *        - BearerAuth: []
	 *      tags:
	 *        - Auth
	 *      responses:
	 *        "200":
	 *          description: Success
	 *          content:
	 *            application/json:
	 *               schema:
	 *                 $ref: '#/components/schemas/VerifyResponse'
	 *        "401":
	 *          description: Unauthorized
	 *        "5XX":
	 *          description: Unexpected error
	 */
	app.get(`${prefix}/verify`, validation.verifyJWT, validation.verifyErros, controller.userVerification);

	return this
}
