// API: User can fetch details only. Require aggregate, populate, pagination.

const Product = require('../../model/Product')
const { User } = require('../../model/User')
const Comment = require('../../model/Comment')
const Category = require('../../model/Category')

// GET
exports.allProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const perPage = parseInt(req.query.perPage) || 10
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