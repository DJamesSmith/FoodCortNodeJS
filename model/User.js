const mongoose = require('mongoose')
const Schema = mongoose.Schema

const passwordValidationMessages = {
    minLength: 'Password must be at least 6 characters long',
    specialChar: 'Password must contain at least one special character',
    uppercase: 'Password must contain at least one uppercase letter',
    lowercase: 'Password must contain at least one lowercase letter',
    number: 'Password must contain at least one number'
}

const userSchema = mongoose.Schema({
    status: {
        type: Boolean,
        default: true
    },
    type: {
        type: Number,
        // default: 1
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    first_name: {
        type: String,
        required: [true, 'Your First name is required'],
        trim: true
    },
    last_name: {
        type: String,
        required: [true, 'Your Last name is required'],
        trim: true
    },
    contact: {
        type: String,
        required: [true, 'Your Email or Phone number is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: value => {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value) || /^\+\d{1,15}$/.test(value)
            },
            message: 'Please provide a valid email address or phone number'
        }
    },
    password: {
        type: String,
        required: [true, 'Your Password is required'],
    },
    decryptedPassword: {
        type: String,
        required: [true, 'Your Password is required'],
    },
    address: [{
        type: Schema.Types.ObjectId,
        ref: 'address'
    }],
    profile_pic: {
        type: String,
        default: ''
    },
    profile_pic_originalname: {
        type: String,
        default: ''
    }
}, {
    timestamps: true        // Automatically gives us a createdAt and updatedAt fields
})

const User = mongoose.model('User', userSchema)
module.exports = { User, passwordValidationMessages }