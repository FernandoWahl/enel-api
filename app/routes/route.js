const express               = require('express');
const router                = express.Router();
const routerExpress         = express.Router();
const authController        = require("../controllers/auth.controller");
const authValidation        = require("../validations/auth.validation");

const enelController        = require("../controllers/enel.controller");

const { validationResult }  = require('express-validator');

function verifyErros(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  next();
}

//Login
routerExpress.post( "/login",        authValidation.login, verifyErros, authController.userAuthentication);
routerExpress.get(  "/verify",       authValidation.verifyJWT, authController.userVerification);

//Enel
routerExpress.get(  "/usagehistory", authValidation.verifyJWT, enelController.usagehistory);
routerExpress.get(  "/portalinfo",   authValidation.verifyJWT, enelController.portalinfo);


router.use("/" , routerExpress);
module.exports = router;
