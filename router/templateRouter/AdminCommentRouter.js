const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const commentController = require('../../controller/adminController/AdminCommentController')

// GET: All Comments
router.get('/comments', commentController.allComments)

// GET - Single Comment for "Edit Comment Page"
router.get('/editComment/:commentId', commentController.singleComment)
// PUT
router.post('/comment/:commentId', commentController.updateComment)

// DELETE
router.get('/comment/:commentId', commentController.deleteComment)

module.exports = router