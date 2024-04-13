const config = {
    secret_jwt: "thisismysecretkey",
    twilio: {
        accountSid: "AC928622c75733c952f8affaf9ca4eb71c",
        authToken: "7a947305f552f5c6bdd49bc2e29bb925",
        phoneNumber: "+18319200814"
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