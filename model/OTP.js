const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    contact: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

const OTP = mongoose.model('OTP', otpSchema)

module.exports = OTP