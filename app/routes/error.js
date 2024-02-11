/** @param { import('express').Express } app */
module.exports = app => {
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
