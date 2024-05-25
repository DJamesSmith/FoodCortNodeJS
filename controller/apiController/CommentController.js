const Product = require('../../model/Product')
const { User } = require('../../model/User')
const Comment = require('../../model/Comment')

// GET - All Comments (Particular Food product)
exports.allCommentsForProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ success: false, status: 404, message: 'Product not found' })
        }

        const comments = await Comment.find({ product: productId })
        if (comments.length == 0) {
            res.status(200).json({ success: true, status: 200, comments: comments, message: `No comments for product "${product.productTitle}"` })
        } else {
            res.status(200).json({ success: true, status: 200, comments: comments, message: `All comments for product "${product.productTitle}"` })
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ success: false, status: 500, message: "Internal Server Error" })
    }
}

// POST - New Comment
exports.createComment = async (req, res) => {
    try {
        const userId = req.user._id
        const { comment, product } = req.body

        const userDoc = await User.findById(userId)
        const productDoc = await Product.findById(product)

        if (userDoc && productDoc) {
            console.log("User:", userDoc.first_name)
            console.log("Product:", productDoc.productTitle)

            const newComment = new Comment({
                user: userId,
                comment: comment,
                product: product,
                likesCount: 0
            })

            await newComment.save()

            res.status(201).send({
                success: true,
                status: 201,
                comment: newComment,
                message: `${userDoc.first_name} ${userDoc.last_name} added a comment successfully for product ${productDoc.productTitle}`,
            })
        } else {
            res.status(404).send({ success: false, status: 404, message: "User or product not found" })
        }
    } catch (error) {
        console.error("Error creating comment:", error)
        res.status(500).send({ success: false, status: 500, message: "Internal Server Error" })
    }
}


// PUT - Update Existing Comment for Particular Product
exports.updateComment = async (req, res) => {
    try {
        const userId = req.user._id
        const { commentId } = req.params
        const { comment } = req.body

        const userDoc = await User.findById(userId)

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
                status: 200,
                comment: existingComment,
                productTitle: productDoc.productTitle,
                message: `${userDoc.first_name} ${userDoc.last_name} updated a comment successfully for product "${productDoc.productTitle}"`,
            })
        } else {
            res.status(404).send({ success: false, status: 404, message: "Comment not found" })
        }
    } catch (error) {
        console.error("Error updating comment:", error)
        res.status(500).send({ success: false, status: 500, message: "Internal Server Error" })
    }
}

// DELETE - Delete Comment for Particular Product
exports.deleteComment = async (req, res) => {
    try {
        const userId = req.user._id
        const { commentId } = req.params
        const deletedComment = await Comment.findByIdAndDelete(commentId)

        const userDoc = await User.findById(userId)

        if (deletedComment) {
            const productId = deletedComment.product
            const productDoc = await Product.findById(productId)

            res.status(200).json({
                success: true,
                comment: deletedComment,
                message: `${userDoc.first_name} ${userDoc.last_name} deleted a comment "${deletedComment.comment.substring(0, 12)}..." successfully for product "${productDoc.productTitle}"`,
            })
        } else {
            res.status(404).send({ success: false, message: `Comment not found` })
        }
    } catch (error) {
        console.error("Error deleting comment:", error)
        res.status(500).send({ success: false, message: "Internal Server Error" })
    }
}

// Like a Comment
exports.likeComment = async (req, res) => {
    try {
        const userId = req.user._id
        const { commentId } = req.params

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).json({ success: false, status: 404, message: 'Comment not found' })
        }

        if (comment.likedBy.includes(userId)) {
            return res.status(200).json({ success: false, status: 200, message: 'Comment already liked' })
        }

        comment.likedBy.push(userId)
        comment.likesCount = (comment.likesCount || 0) + 1

        await comment.save()

        res.status(200).json({ success: true, status: 200, message: 'Comment liked successfully', comment })
    } catch (error) {
        console.error("Error liking comment:", error)
        res.status(500).json({ success: false, status: 500, message: "Internal Server Error" })
    }
}

// Unlike a Comment
exports.unlikeComment = async (req, res) => {
    try {
        const userId = req.user._id
        const { commentId } = req.params

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).json({ success: false, status: 404, message: 'Comment not found' })
        }

        const likedIndex = comment.likedBy.indexOf(userId)
        if (likedIndex === -1) {
            return res.status(200).json({ success: false, status: 200, message: 'Comment not liked yet' })
        }

        comment.likedBy.splice(likedIndex, 1)
        comment.likesCount = Math.max((comment.likesCount || 1) - 1, 0)

        await comment.save()

        res.status(200).json({ success: true, status: 200, message: 'Comment unliked successfully', comment })
    } catch (error) {
        console.error("Error unliking comment:", error)
        res.status(500).json({ success: false, status: 500, message: "Internal Server Error" })
    }
}

// Get All Liked Comments for a Particular Product
exports.getAllLikedCommentsForProduct = async (req, res) => {
    try {
        const userId = req.user._id
        const productId = req.params.productId

        const likedComments = await Comment.find({
            product: productId,
            likedBy: userId
        })

        const commentsWithLikes = likedComments.map(comment => ({
            _id: comment._id,
            comment: comment.comment,
            product: comment.product,
            likesCount: comment.likesCount,
            likedBy: comment.likedBy
        }))

        res.status(200).json({ success: true, status: 200, likedComments: commentsWithLikes })
    } catch (error) {
        console.error("Error fetching liked comments for product:", error)
        res.status(500).json({ success: false, status: 500, message: "Internal Server Error" })
    }
}