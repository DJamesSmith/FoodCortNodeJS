const mongoose = require('mongoose')

const product = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    rating: {
        type: String,
        required: true
    },
    kilocalories: {
        type: String,
        required: true
    },
    duration: {
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
    }
},
    {
        timestamps: true        // Automatically gives us a createdAt and updatedAt fields
    }
)

module.exports = mongoose.model("Product", product)