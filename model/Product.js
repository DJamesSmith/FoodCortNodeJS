const mongoose = require('mongoose')
const Schema = mongoose.Schema

const product = new mongoose.Schema({
    productTitle: {
        type: String,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },
    productPrice: {
        type: String,
        required: true
    },
    productRating: {
        type: String,
        required: true
    },
    productKiloCalories: {
        type: String,
        required: true
    },
    productDeliveryTime: {
        type: String,
        required: true
    },
    productIsLiked: {
        type: String,
        required: true
    },
    productLikesCount: {
        type: Number,
        default: 0
    },
    productUnlikesCount: {
        type: Number,
        default: 0
    },
    productQuantity: {
        type: String,
        required: true
    },
    initialProductQuantity: {
        type: String,
        required: true
    },



    image_product: {
        type: String,
        required: false
    },
    image_original_name: {
        type: String,
        required: false
    },




    comment: [{
        type: Schema.Types.ObjectId,
        ref: 'comment'
    }],
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category'
    },
    // extraingredient: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'extraingredient'
    // },
},
    {
        timestamps: true        // Automatically gives us a createdAt and updatedAt fields
    }
)

module.exports = mongoose.model('product', product)