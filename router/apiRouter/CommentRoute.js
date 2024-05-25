// API: User can only fetch details in API Postman. Aggregate, Pagination, Populate.

const express = require('express')
const router = express.Router()
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require('path')
const auth = require('../../middleware/auth')

const commentController = require('../../controller/apiController/CommentController')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
// -------------------------- Multer --------------------------
// D:\React Native\FinalProject\server\public\productUploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const destinationPath = path.join(__dirname, '../', 'public/productUploads')

//         console.log("Product_Storage_Path:", destinationPath)
//         cb(null, destinationPath)
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
//     }
// })

// const maxSize = 2 * 1024 * 1024 // for 1MB

// const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
//             cb(null, true)
//         } else {
//             cb(null, false)
//             return cb(new Error("Only .png, .jpg and .jpeg format allowed!"))
//         }
//     },
//     limits: { fileSize: maxSize }
// })

// -------------------------- Multer --------------------------


// GET - All Comments (Particular Product)
router.get('/product/:productId/comments', auth, commentController.allCommentsForProduct)

// POST - Comment
router.post('/comment', auth, commentController.createComment)

// PUT
router.put('/comment/:commentId', auth, commentController.updateComment)

// DELETE
router.delete('/comment/:commentId', auth, commentController.deleteComment)

// Like a comment
router.patch('/comment/:commentId/like', auth, commentController.likeComment)

// Unlike a comment
router.patch('/comment/:commentId/unlike', auth, commentController.unlikeComment)

// Get all liked comments for a product
router.get('/product/:productId/comments/liked', auth, commentController.getAllLikedCommentsForProduct)

module.exports = router