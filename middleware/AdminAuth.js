const jwt = require("jsonwebtoken")

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