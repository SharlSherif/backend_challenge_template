import { decodeToken } from '../../helpers/token'

module.exports = (req, res, next) => {
    const authorization = req.headers['user-key']
    // if this token is not valid ,return 401 status code
    if (authorization == undefined) return res.status(401).send({ noToken: 'please provide an authorization token' })
    const decoded = decodeToken(authorization.replace('Bearer ', ''))
    if (decoded == null) return res.status(401).send() // if this token is not valid ,return 401 status code
    // else pass the user data to the controller
    req.customer = decoded.user;
    next();
}