const jwt = require('jsonwebtoken');

module.exports = app => {
    const logger = app.middlewares.log.logger;
    const auth = app.services.auth;

    const handleAuthenticationError = (res, error, statusCode = 401) => {
        logger.error(`controller:error:${res.req.route.path}`, error);
        res.status(statusCode).send({ message: error?.message || error });
    };

    const generateToken = (result) => jwt.sign({ result }, process.env.APP_JWT_SECRET, { expiresIn: '48h' });

    const verifyAndDecodeToken = async (token) => {
        if (!token) {
            throw new Error('Nenhum token fornecido.');
        }

        const decoded = jwt.verify(token, process.env.APP_JWT_SECRET);
        logger.debug('controller:decode:result', decoded.result);

        return decoded.result;
    };

    this.userAuthentication = async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await auth.login(email, password);
            const token = generateToken(result);
            res.status(200).send({ token });
        } catch (error) {
            handleAuthenticationError(res, error, 400);
        }
    };

    this.tokenAuthentication = async (req, res) => {
        try {
            const token = req.headers['authorization']?.replace('Bearer ', '');
            const decodedResult = await verifyAndDecodeToken(token);
            
            const result = await auth.token(decodedResult.refreshToken);
            const newToken = generateToken(result);
            res.status(200).send({ token: newToken });
        } catch (error) {
            handleAuthenticationError(res, error);
        }
    };

    this.userVerification = async (req, res) => {
        try {
            const token = req.headers['authorization']?.replace('Bearer ', '');
            const decodedResult = await verifyAndDecodeToken(token);

            res.status(200).send(decodedResult);
        } catch (error) {
            handleAuthenticationError(res, error);
        }
    };

    return this;
};
