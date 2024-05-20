const mongoose = require('mongoose');
const Schema = mongoose.Schema

const addressSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    addressType: {
        type: String,
        required: true,
        enum: ['Home', 'Workplace', 'School/University', 'Gym', 'Park', 'Other']
    },
    address: {
        type: String,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true        // Automatically gives us createdAt and updatedAt fields
})

module.exports = mongoose.model('address', addressSchema)