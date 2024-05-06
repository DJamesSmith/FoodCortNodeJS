const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('comment', commentSchema)