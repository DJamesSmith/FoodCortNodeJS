const Product = require('../model/Product')

// POST
exports.createProduct = async (req, res, next) => {
    // console.log(`req.body------ ${req.file.originalname}`)
    try {
        const ProductDetails = await new Product({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            rating: req.body.rating,
            kilocalories: req.body.kilocalories,
            duration: req.body.duration,

            image_product: req.file.filename,
            image_original_name: req.file.originalname,
        })

        const productData = await ProductDetails.save()
        res.status(200).json({ status: 200, message: "Product Data succesfully created", data: productData })
    } catch (error) {
        res.status(400).send({ status: 400, message: "Error occurred while saving product data. Please try again later." })
    }
}

// GET
exports.allProducts = async (req, res) => {
    try {
        const AllProducts = await Product.find()
        res.status(200).send({ success: true, status: 200, data: AllProducts, message: `Product list fetched successfully` })
    } catch (error) {
        res.status(400).send({ success: false, message: message.error })
    }
}