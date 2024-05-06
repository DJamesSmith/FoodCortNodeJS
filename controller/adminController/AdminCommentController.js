// API: User can fetch details only. Require aggregate, populate, pagination.

const Product = require('../../model/Product')
const { User } = require('../../model/User')
const Comment = require('../../model/Comment')
const Category = require('../../model/Category')

// GET - All Comments (Particular Food product)
exports.allComments = async (req, res) => {
    try {
        const search = req.query.search || ''
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        // Fetch comments that have associated products and users
        const commentData = await Comment.find({
            comment: { $regex: '.*' + search + '.*', $options: 'i' }
        })
            .limit(limit)
            .skip((page - 1) * limit)
            .populate({
                path: 'product',
                populate: { path: 'category' }
            })
            .populate('user')
            .exec()

        const count = await Comment.find({
            comment: { $regex: '.*' + search + '.*', $options: 'i' }
        }).countDocuments()

        res.render('Comments/allComments', {
            title: 'AdminLTE | All Comments',
            dashboardtitle: 'Product Comments Page',
            message: req.flash('message'),
            error: req.flash('error'),
            comments: commentData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            previousPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
            count: count,
            limit: limit
        })
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).send({ success: false, message: "Internal Server Error" })
    }
}

// GET - Single Comment for "Edit Comment Page"
exports.singleComment = async (req, res) => {
    try {
        const commentID = req.params.commentId

        const commentData = await Comment.findById(commentID)
            .populate('product')
            .populate('user')

        const userData = await User.find()

        if (!commentData) {
            req.flash('error', 'Comment not found.')
            return res.redirect('/admin/comments')
        }

        res.render('Comments/editComment', {
            title: 'AdminLTE | Edit Comment',
            dashboardtitle: 'Edit Comments Page',
            message: req.flash('message'),
            comment: commentData,
            user: userData
        })
    } catch (error) {
        console.error('Error fetching comment:', error)
        req.flash('error', 'An error occurred while fetching the comment.')
        res.redirect('/admin/comments')
    }
}

// PUT - Single Comment for a User & Product
exports.updateComment = async (req, res) => {
    const commentId = req.params.commentId

    try {
        const { product, user, comment } = req.body

        console.log(`req.body: ${JSON.stringify(req.body)}`)
        const existingComment = await Comment.findById(commentId)

        if (!existingComment) {
            req.flash('error', 'Comment not found.')
            return res.redirect('/admin/comments')
        }

        const updatedProduct = await Product.findById(product)

        existingComment.product = product
        existingComment.user = user
        existingComment.comment = comment
        await existingComment.save()

        req.flash('message', `Comment updated successfully for product "${updatedProduct.productTitle}"`)
        res.redirect('/admin/comments')
    } catch (error) {
        console.error("Error updating comment:", error)
        req.flash('error', 'An error occurred while updating the comment.')
        res.redirect('/admin/comments')
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const deletedComment = await Comment.findByIdAndDelete(commentId)

        if (!deletedComment) {
            req.flash('error', 'Comment not found.')
            return res.redirect('/admin/comments')
        }

        const associatedProduct = await Product.findById(deletedComment.product)

        req.flash('message', `Comment deleted successfully for product "${associatedProduct.productTitle}".`)
        res.redirect('/admin/comments')
    } catch (error) {
        console.error("Error deleting comment:", error)
        req.flash('error', 'An error occurred while deleting the comment.')
        res.redirect('/admin/comments')
    }
}