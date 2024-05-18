// EJS: Admin can have full access in a web page

const Product = require('../../model/Product')
const Category = require('../../model/Category')
const { imageToBase64 } = require('../../utility/Base64Image')

// GET
exports.allProducts = async (req, res) => {
    try {

        var search = ''
        var page = 1
        const limit = 10

        if (req.query.search) {
            search = req.query.search
        }

        if (req.query.page) {
            page = req.query.page
        }

        const categorySearchRegex = new RegExp(search, 'i')

        const productData = await Product.find({
            $or: [
                { productTitle: { $regex: '.*' + search + '.*', $options: 'i' } },
                { productDescription: { $regex: '.*' + search + '.*', $options: 'i' } },
                { category: { $in: await Category.find({ categoryName: categorySearchRegex }).distinct('_id') } }
            ]
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('category')
            .exec()

        const count = await Product.find({
            $or: [
                { productTitle: { $regex: '.*' + search + '.*', $options: 'i' } },
                { productDescription: { $regex: '.*' + search + '.*', $options: 'i' } },
                { category: { $in: await Category.find({ categoryName: categorySearchRegex }).distinct('_id') } }
            ]
        })
            .countDocuments()

        // console.log(`productData: ${productData}`)

        res.render('Products/allProducts', {        // EJS Filename
            title: 'AdminLTE | All Products',
            dashboardtitle: 'Food Products Page',
            message: req.flash('message'),
            error: req.flash('error'),
            displaydata: productData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            previousPage: page - 1,
            nextPage: page - (-1),
            count: count,
            limit: limit
        })

    } catch (error) {
        console.log(error.message)
    }
}

// GET - Add Food Product
exports.addProduct = ((req, res) => {
    Category.find().then(result => {
        res.render('Products/addProduct', {
            title: 'AdminLTE | Add New Food Product',
            dashboardtitle: 'Food Products Page',
            message: req.flash('message'),
            foodCategory: result
        })
    })
})

// POST - Add Food Product
exports.createProduct = async (req, res) => {
    //console.log(req.body)
    const {
        productTitle,
        productDescription,
        productPrice,
        productRating,
        productKiloCalories,
        productDeliveryTime,
        category
    } = req.body

    // Check if textInput is empty
    if (!productTitle || !productDescription || !productPrice || !productRating || !productKiloCalories || !productDeliveryTime || !category) {
        req.flash('error', 'Please fill in all required fields.')
        return res.redirect('/admin/addProduct')
    }

    try {
        const existingProduct = await Product.findOne({ productTitle })
        if (existingProduct) {
            req.flash('error', 'A product with the same title already exists.')
            return res.redirect('/admin/addProduct')
        }

        let image_product = ''
        if (req.file) {
            image_product = req.file.filename
            const filePath = `public/productUploads/${image_product}`
            const base64Image = await imageToBase64(filePath)
            image_product = base64Image
        }

        const ProductModel = new Product({
            productTitle: productTitle,
            productDescription: productDescription,
            productPrice: productPrice,
            productRating: productRating,
            productKiloCalories: productKiloCalories,
            productDeliveryTime: productDeliveryTime,
            productIsLiked: false,
            productLikesCount: 0,
            productUnlikesCount: 0,
            productQuantity: 10,
            initialProductQuantity: 0,
            image_product: image_product,
            image_original_name: req.file ? req.file.originalname : '',
            category: category,
            productIsAddedToCart: false,
            productIsFavourite: false,
            productIsOrdered: false
        })

        const cat = await Category.findById(category).select('categoryName')

        ProductModel.save()
            .then(result => {
                console.log(result, "Food Product data created successfully.")
                req.flash('message', `Added "${productTitle}" successfully<br />Category: ${cat.categoryName}`)
                res.redirect('/admin/products')
            })
            .catch(err => {
                console.log(err, "No Data Saved.")
                req.flash('error', 'You can not send Empty data.')
                res.redirect('/admin/addProduct')
            })
    } catch (error) {
        console.log(error)
        req.flash('error', 'An error occurred while saving the product.')
        res.redirect('/admin/addProduct')
    }
}

// DELETE - Delete Food Product
exports.deleteProduct = async (req, res) => {
    const productId = req.params.productId

    console.log(`productId: ${productId}`)
    try {
        const deletedProduct = await Product.findByIdAndDelete({ _id: productId })

        if (!deletedProduct) {
            req.flash('error', 'Product not found.')
            return res.redirect('/admin/products')
        }

        console.log(`Product "${deletedProduct.productTitle}" deleted successfully`)

        req.flash('message', `Product "${deletedProduct.productTitle}" deleted successfully.`)
        res.redirect('/admin/products')
    } catch (error) {
        console.error('Error deleting product:', error)
        req.flash('error', 'An error occurred while deleting the product.')
        res.redirect('/admin/products')
    }
}

// GET - Single Product for "Edit Product Page"
exports.singleProduct = async (req, res) => {
    try {
        const productID = req.params.productId

        const result = await Product.findById(productID)
        const foodCategory = await Category.find()

        if (!result) {
            req.flash('error', 'Product not found.')
            return res.redirect('/admin/products')
        }

        res.render('Products/editProduct', {
            title: 'AdminLTE | Edit Product',
            dashboardtitle: 'Products Page',
            message: req.flash('message'),
            product: result,
            foodCategory: foodCategory
        })
    } catch (error) {
        console.error('Error fetching product:', error)
        req.flash('error', 'An error occurred while fetching the product.')
        res.redirect('/admin/products')
    }
}

// PUT - Update Food Product
exports.updateProduct = async (req, res) => {
    const productId = req.params.productId
    console.log(`productId: ${productId}`)
    const {
        productTitle,
        productDescription,
        productPrice,
        productRating,
        productKiloCalories,
        productDeliveryTime,
        category
    } = req.body

    if (!productTitle || !productDescription || !productPrice || !productRating || !productKiloCalories || !productDeliveryTime || !category) {
        req.flash('error', 'Please fill in all required fields.')
        return res.redirect(`/admin/editProduct/${productId}`)
    }

    try {
        const existingProduct = await Product.findById(productId)
        if (!existingProduct) {
            req.flash('error', 'Product not found.')
            return res.redirect('/admin/products')
        }

        let image_product = ''
        if (req.file) {
            image_product = req.file.filename
            const filePath = `public/productUploads/${image_product}`
            const base64Image = await imageToBase64(filePath)
            image_product = base64Image
        }

        existingProduct.productTitle = productTitle
        existingProduct.productDescription = productDescription
        existingProduct.productPrice = productPrice
        existingProduct.productRating = productRating
        existingProduct.productKiloCalories = productKiloCalories
        existingProduct.productDeliveryTime = productDeliveryTime
        existingProduct.image_product = image_product
        existingProduct.category = category

        existingProduct.productIsLiked = false
        existingProduct.productIsAddedToCart = false
        existingProduct.productIsFavourite = false
        existingProduct.productIsOrdered = false

        await existingProduct.save()

        req.flash('message', `Product "${existingProduct.productTitle}" updated successfully.`)
        res.redirect('/admin/products')
    } catch (error) {
        console.error('Error updating product:', error)
        req.flash('error', 'An error occurred while updating the product.')
        res.redirect(`/admin/editProduct/${productId}`)
    }
}