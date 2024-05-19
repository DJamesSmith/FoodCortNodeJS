// API: User can fetch details only. Require aggregate, populate, pagination.

const Product = require('../../model/Product')
const { User } = require('../../model/User')
const Comment = require('../../model/Comment')
const Category = require('../../model/Category')

// GET
exports.allProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page)
        const perPage = parseInt(req.query.perPage)
        const searchQuery = req.query.search

        const skip = (page - 1) * perPage
        let query = {}

        if (searchQuery) {
            query = {
                $or: [
                    { productTitle: { $regex: '.*' + searchQuery + '.*', $options: 'i' } },
                    { productDescription: { $regex: '.*' + searchQuery + '.*', $options: 'i' } },
                ]
            }
        }

        const totalRecords = await Product.countDocuments(query)
        const products = await Product.find(query)
            .skip(skip)
            .limit(perPage)
            .populate('comment')

        const totalPages = Math.ceil(totalRecords / perPage)

        if (products.length == 0) {
            res.status(200).send({
                success: true,
                status: 200,
                data: products,
                currentPage: page,
                perPage: perPage,
                totalPages: totalPages,
                totalRecords: totalRecords,
                message: `Product list empty.`
            })
        } else {
            res.status(200).send({
                success: true,
                status: 200,
                data: products,
                currentPage: page,
                perPage: perPage,
                totalPages: totalPages,
                totalRecords: totalRecords,
                message: `Product list fetched successfully`
            })
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error })
    }
}

// POST - Add to cart
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        if (user.productCart.includes(productId)) {
            return res.status(400).json({ success: false, message: 'Product already in cart' })
        }

        user.productCart.push(productId)
        await user.save()

        res.status(200).json({ success: true, message: `${user.first_name} ${user.last_name}'s product added to cart`, cart: user.productCart })
    } catch (error) {
        console.error('Error adding product to cart:', error)
        res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

// GET all cart items
exports.getCartItems = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId).populate('productCart')
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const cartItemsCount = user.productCart.length

        res.status(200).json({
            success: true,
            message: `${user.first_name} ${user.last_name}'s cart items fetched successfully`,
            cart: user.productCart,
            cartItemsCount: cartItemsCount
        })
    } catch (error) {
        console.error('Error fetching cart items:', error)
        res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

exports.addToFavorites = async (req, res) => {
    try {
        const { userId, productId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        if (user.favouriteProducts.includes(productId)) {
            return res.status(400).json({ success: false, message: 'Product already in favorites' })
        }

        user.favouriteProducts.push(productId)
        await user.save()

        res.status(200).json({ success: true, message: `${user.first_name} ${user.last_name}'s product added to favorites`, favorites: user.favouriteProducts })
    } catch (error) {
        console.error('Error adding product to favorites:', error)
        res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

// Get all favorite products function
exports.getFavoriteProducts = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId).populate('favouriteProducts')
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        res.status(200).json({ success: true, message: `${user.first_name} ${user.last_name}'s favorite products fetched successfully`, favorites: user.favouriteProducts })
    } catch (error) {
        console.error('Error fetching favorite products:', error)
        res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}