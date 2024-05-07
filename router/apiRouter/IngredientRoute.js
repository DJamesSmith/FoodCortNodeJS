// API: User can only fetch details in API Postman. Aggregate, Pagination, Populate.

const express = require('express')
const router = express.Router()
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require('path')
const auth = require('../../middleware/auth')

const ingredientController = require('../../controller/apiController/IngredientController')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
// -------------------------- Multer --------------------------
// // D:\React Native\FinalProject\server\public\ingredientUploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const destinationPath = path.join(__dirname, '../', 'public/ingredientUploads')

//         console.log("ExtraIngredient_Storage_Path:", destinationPath)
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

// GET - All Ingredients
router.get('/product/:productId/ingredients', auth, ingredientController.allIngredientsForProduct)

// POST - Add Ingredient ("State change" with number of items)
// router.get('/addIngredient', ingredientController.createIngredient)

module.exports = router