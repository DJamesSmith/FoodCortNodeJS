const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
    adminName: {
        type: String,
        required: true
    },
    adminEmail: {
        type: String,
        required: true
    },
    adminPassword: {
        type: String,
        required: true
    },
    adminPasswordConfirm: {
        type: String,
        required: true
    },
    adminImage: {
        type: String,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    status: {
        type: Number,
        default: '1'
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Admin', adminSchema)