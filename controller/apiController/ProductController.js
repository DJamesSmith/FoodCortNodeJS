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

        res.status(200).json({
            success: true,
            status: 200,
            data: products,
            currentPage: page,
            perPage: perPage,
            totalPages: totalPages,
            totalRecords: totalRecords,
            message: products.length === 0 ? 'Product list empty.' : 'Product list fetched successfully',
        })

    } catch (error) {
        res.status(400).send({ success: false, message: error })
    }
}

// POST - Add to cart
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user._id
        const { productId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' })
        }

        if (user.productCart.includes(productId)) {
            return res.status(200).json({ success: false, status: 200, message: 'Product already in cart' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ success: false, status: 404, message: 'Product not found' })
        }

        user.productCart.push(productId)
        await user.save()

        res.status(200).json({ success: true, status: 200, message: `"${product.productTitle}" added to your cart`, cart: user.productCart })
    } catch (error) {
        console.error('Error adding product to cart:', error)
        res.status(500).json({ success: false, status: 500, message: 'Internal Server Error' })
    }
}

// GET all Cart items
exports.getCartItems = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId).populate('productCart')
        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' })
        }

        const cartItemsCount = user.productCart.length

        res.status(200).json({
            success: true,
            status: 200,
            message: `${user.first_name} ${user.last_name}'s cart items fetched successfully`,
            cart: user.productCart,
            cartItemsCount: cartItemsCount
        })
    } catch (error) {
        console.error('Error fetching cart items:', error)
        res.status(500).json({ success: false, status: 500, message: 'Internal Server Error' })
    }
}

// POST - Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id
        const { productId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' })
        }

        const productIndex = user.productCart.indexOf(productId)
        if (productIndex === -1) {
            return res.status(200).json({ success: false, status: 200, message: 'Product not found in cart' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ success: false, status: 404, message: 'Product not found' })
        }

        user.productCart.splice(productIndex, 1)
        await user.save()

        res.status(200).json({
            success: true,
            status: 200,
            message: `"${product.productTitle}" removed from your cart`,
            removedProduct: { id: product._id, productTitle: product.productTitle },
            cart: user.productCart
        })

    } catch (error) {
        console.error('Error removing product from cart:', error)
        res.status(500).json({ success: false, status: 500, message: 'Internal Server Error' })
    }
}

// POST - Add Favourite
exports.addToFavorites = async (req, res) => {
    try {
        const userId = req.user._id
        const { productId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' })
        }

        if (user.favouriteProducts.includes(productId)) {
            return res.status(200).json({ success: false, status: 200, message: 'Product already in favorites' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ success: false, status: 404, message: 'Product not found' })
        }

        user.favouriteProducts.push(productId)
        await user.save()

        res.status(200).json({ success: true, status: 200, message: `"${product.productTitle}" added to favorites`, favorites: user.favouriteProducts })
    } catch (error) {
        console.error('Error adding product to favorites:', error)
        res.status(500).json({ success: false, status: 500, message: 'Internal Server Error' })
    }
}

// Get all Favorite Products
exports.getFavoriteProducts = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId).populate('favouriteProducts')
        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' })
        }

        res.status(200).json({ success: true, status: 200, message: `${user.first_name} ${user.last_name}'s favorite products fetched successfully`, favorites: user.favouriteProducts })
    } catch (error) {
        console.error('Error fetching favorite products:', error)
        res.status(500).json({ success: false, status: 500, message: 'Internal Server Error' })
    }
}

// POST - Remove from Favorites
exports.removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user._id
        const { productId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' })
        }

        const favoriteIndex = user.favouriteProducts.indexOf(productId)
        if (favoriteIndex === -1) {
            return res.status(200).json({ success: false, status: 200, message: 'Product not found in favorites' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(200).json({ success: false, status: 200, message: 'Product not found' })
        }

        user.favouriteProducts.splice(favoriteIndex, 1)
        await user.save()

        res.status(200).json({
            success: true,
            status: 200,
            message: `"${product.productTitle}" removed from favorites`,
            removedProduct: { id: product._id, productTitle: product.productTitle },
            favorites: user.favouriteProducts
        })

    } catch (error) {
        console.error('Error removing product from favorites:', error)
        res.status(500).json({ success: false, status: 500, message: 'Internal Server Error' })
    }
}