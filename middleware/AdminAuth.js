const jwt = require('jsonwebtoken')
const config = require('../config/config')

exports.authAdminJwt = (req, res, next) => {
    if (req.cookies && req.cookies.adminToken) {
        jwt.verify(req.cookies.adminToken, "admin#SecretKey@123", (err, data) => {
            req.admin = data
            next()
        })
    } else {
        next()
    }
}


// const verifyAdminToken = async (req, res, next) => {
//     const adminToken = req.body.token || req.query.token || req.headers["x-access-token"]

//     if (!adminToken) {
//         return res.status(403).send({ "status": false, "msg": "Token required for Admin Authentication." })
//     }
//     try {
//         const decoded = jwt.verify(adminToken, config.secret_jwt)
//         req.admin = decoded
//     } catch (err) {
//         return res.status(401).send({ "status": false, "msg": "Invalid Token Access" })
//     }
//     return next()
// }

// module.exports = verifyToken