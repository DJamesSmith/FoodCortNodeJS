const mongoose = require('mongoose');
const Schema = mongoose.Schema

const addressSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        trim: true
    }
}, {
    timestamps: true        // Automatically gives us createdAt and updatedAt fields
})

module.exports = mongoose.model('address', addressSchema)