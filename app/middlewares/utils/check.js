const { check} = require('express-validator');

/** @param { import('express').Express } app */
module.exports = app => {
	
	this.login = [
		check('email').isEmail().not().isEmpty().withMessage('O e-mail é obrigatório!'),
		check('password').not().isEmpty().withMessage('A senha é obrigatória!'),
	]

    return this
}
