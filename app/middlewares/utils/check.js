const { check} = require('express-validator');

/** @param { import('express').Express } app */
module.exports = app => {
	
	this.login = [
		check('email').isEmail().not().isEmpty().withMessage('O e-mail é obrigatório!'),
		check('password').not().isEmpty().withMessage('A senha é obrigatória!'),
	]

	this.changeinstallation = [
		check('anlage').not().isEmpty().withMessage('O anlage é obrigatório!'),
		check('vertrag').not().isEmpty().withMessage('A vertrag é obrigatória!'),
	]

    return this
}
