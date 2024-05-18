const config = {
    secret_jwt: "thisismysecretkey",
    twilio: {
        accountSid: "AC2e94c5630035aa7fc6ffdf1e2b395d9e",
        authToken: "75e326db5b16ea7dfe7b3b2dde1d04ba",
        phoneNumber: "+14067197686"
        // dionmanipal@gmail.com
    },
    otpExpirationDuration: 180000,       // 3 minutes in milliseconds
    otpResendTime: 1.5,
    nodemailer: {
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_APP_PASSWORD
        }
    }
}

module.exports = config