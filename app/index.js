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
.include('./middlewares/globals')
.then('../routes')
.into(app)

server.listen(process.env.APP_PORT || 40002, () => {
	logger.debug(`Server running on http://localhost:${port}`);
	logger.debug(`GET http://localhost:${port}${urlPrefix}`);
})
