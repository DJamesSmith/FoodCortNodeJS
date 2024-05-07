// EJS: Admin can have full access in a web page

const Product = require('../../model/Product')
const Category = require('../../model/Category')
const ExtraIngredient = require('../../model/ExtraIngredient')

const { imageToBase64 } = require('../../utility/Base64Image')

// GET
exports.allIngredients = async (req, res) => {
    try {
        var search = ''
        var page = 1
        const limit = 100

        if (req.query.search) {
            search = req.query.search
        }

        if (req.query.page) {
            page = req.query.page
        }

        const ingredientData = await ExtraIngredient.find({
            $or: [
                { ingredientName: { $regex: '.*' + search + '.*', $options: 'i' } },
            ]
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('product')
            .exec()

        const count = await ExtraIngredient.find({
            $or: [
                { ingredientName: { $regex: '.*' + search + '.*', $options: 'i' } },
            ]
        })
            .countDocuments()

        // console.log(`ingredientData: ${ingredientData}`)

        res.render('Ingredients/allIngredients', {        // EJS Filename
            title: 'AdminLTE | All ExtraIngredients',
            dashboardtitle: 'Extra Ingredients Page',
            message: req.flash('message'),
            error: req.flash('error'),
            ingredient: ingredientData,
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

// GET - Add Extra Ingredient
exports.addIngredient = async (req, res) => {
    try {
        const products = await Product.find({}, 'productTitle')
        res.render('Ingredients/addIngredient', {
            title: 'AdminLTE | Add New Extra Ingredient',
            dashboardtitle: 'Extra Ingredients Page',
            message: req.flash('message'),
            ingredients: products
        })
    } catch (error) {
        console.log(error.message)
    }
}

// POST - Add ExtraIngredient for particular Product
exports.createIngredient = async (req, res) => {
    //console.log(req.body)
    const {
        ingredientName,
        ingredientPrice,
        ingredientWeight,
        // ingredientQuantity,
        // initialIngredientQuantity,
        product
    } = req.body

    // Check if textInput is empty
    if (!ingredientName || !ingredientPrice || !ingredientWeight || !product) {
        req.flash('message', 'Please fill in all required fields.')
        console.log('Please fill in all required fields.')
        return res.redirect('/admin/addIngredient')
    }

    try {
        const existingIngredient = await ExtraIngredient.findOne({ ingredientName, product })

        if (existingIngredient) {
            const existingProduct = await Product.findById(product).select('productTitle')
            req.flash('message', `The ingredient "${ingredientName}" already exists for the product "${existingProduct.productTitle}".`)
            // console.log(`The ingredient "${ingredientName}" already exists for the product "${existingProduct.productTitle}".`)
            return res.redirect('/admin/addIngredient')
        }

        let image_ingredient = ''
        if (req.file) {
            image_ingredient = req.file.filename
            const filePath = `public/ingredientUploads/${image_ingredient}`
            const base64Image = await imageToBase64(filePath)
            image_ingredient = base64Image
        }

        const IngredientModel = new ExtraIngredient({
            ingredientName: ingredientName,
            ingredientPrice: ingredientPrice,
            ingredientWeight: ingredientWeight,
            ingredientQuantity: 0,
            initialIngredientQuantity: 0,
            image_ingredient: image_ingredient,
            image_original_name: req.file ? req.file.originalname : '',
            product: product,
        })

        const productId = await Product.findById(product).select('productTitle')

        IngredientModel.save()
            .then(result => {
                console.log(result, "Extra Ingredient data created successfully.")
                req.flash('message', `Added "${ingredientName}" successfully<br />Product: ${productId.productTitle}`)
                res.redirect('/admin/ingredients')
            })
            .catch(err => {
                console.log(err, "No Data Saved.")
                req.flash('error', 'You can not send Empty data.')
                res.redirect('/admin/ingredients')
            })
    } catch (error) {
        console.log(error)
        req.flash('error', 'An error occurred while saving the product.')
        res.redirect('/admin/ingredients')
    }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------

// GET - Single Ingredient for "Edit Ingredient Page"
exports.singleIngredient = async (req, res) => {
    try {
        const ingredientId = req.params.ingredientId;
        const ingredient = await ExtraIngredient.findById(ingredientId).populate('product');

        if (!ingredient) {
            req.flash('error', 'Ingredient not found.');
            return res.redirect('/admin/ingredients');
        }

        const products = await Product.find({}, 'productTitle');

        res.render('Ingredients/editIngredient', {
            title: 'AdminLTE | Edit Extra Ingredient',
            dashboardtitle: 'Edit Extra Ingredient Page',
            message: req.flash('message'),
            error: req.flash('error'),
            ingredient: ingredient,
            products: products
        });
    } catch (error) {
        console.error('Error fetching ingredient:', error);
        req.flash('error', 'An error occurred while fetching the ingredient.');
        res.redirect('/admin/ingredients');
    }
}

// PUT - Update ExtraIngredient
exports.updateIngredient = async (req, res) => {
    const ingredientId = req.params.ingredientId
    const {
        ingredientName,
        ingredientPrice,
        ingredientWeight,
        // ingredientQuantity,
        // initialIngredientQuantity,
        product
    } = req.body

    try {
        const existingIngredient = await ExtraIngredient.findById(ingredientId)

        if (!existingIngredient) {
            req.flash('error', 'Ingredient not found.')
            return res.redirect('/admin/ingredients')
        }

        existingIngredient.ingredientName = ingredientName
        existingIngredient.ingredientPrice = ingredientPrice
        existingIngredient.ingredientWeight = ingredientWeight
        existingIngredient.ingredientQuantity = 0
        existingIngredient.initialIngredientQuantity = 0
        existingIngredient.product = product

        if (req.file) {
            const image_ingredient = req.file.filename
            const filePath = `public/ingredientUploads/${image_ingredient}`
            const base64Image = await imageToBase64(filePath)
            existingIngredient.image_ingredient = base64Image
            existingIngredient.image_original_name = req.file.originalname
        }

        await existingIngredient.save()

        req.flash('message', `ExtraIngredient "${existingIngredient.ingredientName}" updated successfully.`)
        res.redirect('/admin/ingredients')
    } catch (error) {
        console.error('Error updating ingredient:', error)
        req.flash('error', 'An error occurred while updating the ingredient.')
        res.redirect(`/admin/editIngredient/${ingredientId}`)
    }
}

// DELETE - Delete ExtraIngredient
exports.deleteIngredient = async (req, res) => {
    const ingredientId = req.params.ingredientId

    try {
        const deletedIngredient = await ExtraIngredient.findByIdAndDelete(ingredientId)

        if (!deletedIngredient) {
            req.flash('error', 'Ingredient not found.')
            return res.redirect('/admin/ingredients')
        }

        console.log(`Ingredient "${deletedIngredient.ingredientName}" deleted successfully.`)

        req.flash('message', `Ingredient "${deletedIngredient.ingredientName}" deleted successfully.`)
        res.redirect('/admin/ingredients')
    } catch (error) {
        console.error('Error deleting ingredient:', error)
        req.flash('error', 'An error occurred while deleting the ingredient.')
        res.redirect('/admin/ingredients')
    }
}