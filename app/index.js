require('dotenv').config()
const express = require('express')
const consign = require('consign')
const app = express()

app.disable('x-powered-by')

consign({
		cwd: 'app',
		verbose: process.env.APP_DEBUG === 'true' || false,
		locale: 'pt-br'
	})
    .include('./middlewares/log')
	.include('./middlewares/connections')
    .then('./middlewares/globals')
    .then('./middlewares/utils')
	.then('./services')
	.then('./controllers')
	.then('./routes')
	.into(app)

var logger = app.middlewares.log.logger;
app.listen(process.env.APP_PORT || 40002, () => {
	logger.debug(`Server running on http://localhost:${process.env.APP_PORT}`);
	logger.debug(`GET http://localhost:${process.env.APP_PORT}${process.env.APP_PREFIX}`);
})
