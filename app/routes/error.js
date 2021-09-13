/** @param { import('express').Express } app */
module.exports = app => {
    
    app.use((req, res, next) => { 
        res.status(404).send({ code: 404 });
        next();
    })
        
    app.use((error, req, res, next) => {
        if (process.env.NODE_ENV === 'production') {
            res.status(500).send('error/500');
            return;
        }
        next(error);
    });
    
    return this;
}
