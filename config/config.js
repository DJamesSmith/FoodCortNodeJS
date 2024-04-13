const config = {
    secret_jwt: "thisismysecretkey",
    twilio: {
        accountSid: "ACe095ce7039b0081e63cfed066fe31b2a",
        authToken: "aacea7f781699fbf7064026b01f9aa27",
        phoneNumber: "+12184801832"
    },
    otpExpirationDuration: 180000,       // 3 minutes in milliseconds
    nodemailer: {
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_APP_PASSWORD
        }
    }
}

module.exports = config