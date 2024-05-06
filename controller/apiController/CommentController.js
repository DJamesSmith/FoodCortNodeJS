// API: User can fetch details only. Require aggregate, populate, pagination.

const Product = require('../../model/Product')
const { User } = require('../../model/User')
const Comment = require('../../model/Comment')

// GET - All Comments (Particular Food product)
exports.allCommentsForProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }

        const comments = await Comment.find({ product: productId })
        if (comments.length == 0) {
            res.status(200).json({ success: true, comments: comments, message: `No comments for product "${product.productTitle}"` })
        } else {
            res.status(200).json({ success: true, comments: comments, message: `All comments for product "${product.productTitle}"` })
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

exports.createComment = async (req, res) => {
    try {
        const { user, comment, product } = req.body

        const userDoc = await User.findById(user)
        const productDoc = await Product.findById(product)

        if (userDoc && productDoc) {
            console.log("User:", userDoc.first_name)
            console.log("Product:", productDoc.productTitle)

            const newComment = new Comment({
                user: user,
                comment: comment,
                product: product,
            })

            await newComment.save()

            res.status(201).send({
                success: true,
                status: 200,
                comment: newComment,
                message: `Comment added successfully for product ${productDoc.productTitle}`,
            })
        } else {
            res.status(404).send({ success: false, message: "User or product not found" })
        }
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).send({ success: false, message: "Internal Server Error" })
    }
}