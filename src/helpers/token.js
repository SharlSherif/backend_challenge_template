import jwt from 'jsonwebtoken'

exports.generateToken = payload => jwt.sign(payload, process.env.JWT_KEY)
exports.decodeToken = token => jwt.decode(token, process.env.JWT_KEY)