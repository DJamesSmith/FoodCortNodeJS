const mongoose = require('mongoose')
const Schema = mongoose.Schema

const extraIngredient = new mongoose.Schema({
    ingredientName: {
        type: String,
        required: true
    },
    ingredientPrice: {
        type: Number,
        required: true
    },
    ingredientWeight: {
        type: String,
        required: true
    },
    ingredientQuantity: {
        type: Number,
        required: true
    },
    initialIngredientQuantity: {
        type: Number,
        required: true
    },
    image_ingredient: {
        type: String,
        required: false
    },
    image_original_name: {
        type: String,
        required: false
    },



    product: {
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
},
    {
        timestamps: true        // Automatically gives us a createdAt and updatedAt fields
    }
)

module.exports = mongoose.model("extraingredient", extraIngredient)