const mongoose = require('mongoose')
const Schema = mongoose.Schema

const extraIngredient = new mongoose.Schema({
    ingredientName: {
        type: String,
        required: true
    },
    ingredientPrice: {
        type: String,
        required: true
    },
    ingredientWeight: {
        type: String,
        required: true
    },
    ingredientQuantity: {
        type: String,
        required: true
    },
    initialIngredientQuantity: {
        type: String,
        required: true
    },
    image_ExtraIngredient: {
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