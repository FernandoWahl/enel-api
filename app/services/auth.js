
/** @param { import('express').Express } app */
module.exports = app => {
    var enel = app.middlewares.utils.enel;
    var logger = app.middlewares.globals.logger;

    this.login = (email, password) => {
        return new Promise((resolve, reject) => {
            logger.debug("service:login:email", email);
            var payload = {
                "I_CANAL":"ZINT",
                "I_EMAIL": email,
                "I_PASSWORD": password
            };

            enel.firebaseLogin(payload)
                .then(response => enel.customToken(response))
                .then(response => enel.getloginv2(response))
                .then(response => resolve(response))
                .catch(error => reject(error))
        });
    }
    return this
};