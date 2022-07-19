/** @param { import('express').Express } app */
module.exports = app => {
    
    app.use((req, res, next) => { 
        res.status(404).send({ code: 404 });
        next();
    })
        
    app.use((error, req, res, next) => {
        next(error);
    });
    
    return this;
}
