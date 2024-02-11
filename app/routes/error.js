/** @param { import('express').Express } app */
module.exports = app => {
    app.use(function(req, res, next) {
        let error =  new Error("Not found")
        error.status = 404;
        throw error
    });
    app.use((err, req, res, next) => {
        if(err){
            const status = err?.status || 500;
            const errorResponse = {
                status,
                error: err?.message || err
            };

            res.status(status).json(errorResponse);
        }
    });

    return this;
};
