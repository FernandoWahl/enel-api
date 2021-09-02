const express               = require('express');
const router                = express.Router();
const authController        = require("../controllers/auth.controller");
const enelController        = require("../controllers/enel.controller");
const validation            = require("../validations/validation");


/**
 * @swagger
 *
 * /login:
 *   post:
 *     produces:
 *       - application/json
 */
router.post( "/login",        validation.login,     validation.verifyErros, authController.userAuthentication);
router.get(  "/verify",       validation.verifyJWT, validation.verifyErros, authController.userVerification);
router.get(  "/usagehistory", validation.verifyJWT, validation.verifyErros, enelController.usagehistory);
router.get(  "/portalinfo",   validation.verifyJWT, validation.verifyErros, enelController.portalinfo);

module.exports = router;
