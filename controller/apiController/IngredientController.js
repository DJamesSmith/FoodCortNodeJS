// API: User can fetch details only. Require aggregate, populate, pagination.

const ExtraIngredient = require('../../model/ExtraIngredient')
const Product = require('../../model/Product')

// GET
exports.allIngredientsForProduct = async (req, res) => {
    try {
        const productId = req.params.productId

        const ingredients = await ExtraIngredient.find({ product: productId })
            .populate('product', 'productTitle')

        if (ingredients.length === 0) {
            const product = await Product.findById(productId).select('productTitle')
            const productTitle = product ? product.productTitle : "Unknown"

            return res.status(404).json({
                success: false,
                message: `No extra ingredients found for the product "${productTitle}".`
            })
        }

        const productTitle = ingredients[0].product.productTitle

        res.status(200).json({
            success: true,
            ingredients: ingredients,
            message: `Extra ingredients for the product "${productTitle}" fetched successfully.`
        })

    } catch (error) {
        console.error('Error fetching ingredients:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        })
    }
}