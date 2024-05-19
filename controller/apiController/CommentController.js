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

// POST - New Comment
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
                likesCount: 0
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
        console.error("Error creating comment:", error)
        res.status(500).send({ success: false, message: "Internal Server Error" })
    }
}


// PUT - Update Existing Comment for Particular Product
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params
        const { comment } = req.body

        const existingComment = await Comment.findByIdAndUpdate(
            commentId,
            { comment: comment },
            { new: true }
        )

        if (existingComment) {
            const productId = existingComment.product
            const productDoc = await Product.findById(productId)

            res.status(200).json({
                success: true,
                comment: existingComment,
                productTitle: productDoc.productTitle,
                message: `Comment updated successfully for product "${productDoc.productTitle}"`,
            })
        } else {
            res.status(404).send({ success: false, message: "Comment not found" })
        }
    } catch (error) {
        console.error("Error updating comment:", error)
        res.status(500).send({ success: false, message: "Internal Server Error" })
    }
}

// DELETE - Delete Comment for Particular Product
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params
        const deletedComment = await Comment.findByIdAndDelete(commentId)

        if (deletedComment) {
            const productId = deletedComment.product
            const productDoc = await Product.findById(productId)

            res.status(200).json({
                success: true,
                comment: deletedComment,
                message: `Comment "${deletedComment.comment.substring(0, 12)}..." deleted successfully for product "${productDoc.productTitle}"`,
            })
        } else {
            res.status(404).send({ success: false, message: `Comment not found` })
        }
    } catch (error) {
        console.error("Error deleting comment:", error)
        res.status(500).send({ success: false, message: "Internal Server Error" })
    }
}

// Toggle Like on a Comment
exports.toggleLikeComment = async (req, res) => {
    try {
        const { commentId, userId } = req.params

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' })
        }

        const likedIndex = comment.likedBy.indexOf(userId)
        let message = ''

        if (likedIndex === -1) {
            // User has not liked the comment yet
            comment.likedBy.push(userId)
            comment.likesCount = (comment.likesCount || 0) + 1
            message = 'Comment liked successfully'
        } else {
            // User has already liked the comment, so unlike it
            comment.likedBy.splice(likedIndex, 1)
            comment.likesCount = Math.max((comment.likesCount || 1) - 1, 0)
            message = 'Comment unliked successfully'
        }

        await comment.save()

        res.status(200).json({ success: true, message, comment })
    } catch (error) {
        console.error("Error toggling like on comment:", error)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}