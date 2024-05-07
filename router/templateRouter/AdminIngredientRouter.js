// EJS: Admin can have full access in a web page

const express = require('express')
const router = express.Router()
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require('path')

const ingredientController = require('../../controller/adminController/AdminIngredientController')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
// -------------------------- Multer --------------------------
// D:\React Native\FinalProject\server\public\ingredientUploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, `../../public/ingredientUploads`), function (error, success) {
            if (error) throw error
        })
        console.log("ExtraIngredients_Storage_Path:", path.join(__dirname, `../public/ingredientUploads`))
    },
    filename: (req, file, cb) => {
        const name = file.fieldname + Date.now() + path.extname(file.originalname)
        cb(null, name, function (error1, success1) {
            if (error1) throw error1
        })
    }
})

const maxSize = 2 * 1024 * 1024 // for 1MB

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true)
        } else {
            cb(null, false)
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"))
        }
    },
    limits: { fileSize: maxSize }
})

// -------------------------- Multer --------------------------

// GET
router.get('/ingredients', ingredientController.allIngredients)

// GET
router.get('/addIngredient', ingredientController.addIngredient)
// POST
router.post('/createIngredient', upload.single('image_ingredient'), ingredientController.createIngredient)

// GET - Single Ingredient for "Edit Ingredient Page"
router.get('/editIngredient/:ingredientId', ingredientController.singleIngredient)
// PUT
router.post('/updateIngredient/:ingredientId', upload.single('image_ingredient'), ingredientController.updateIngredient)

// DELETE
router.get('/ingredient/:ingredientId', ingredientController.deleteIngredient)

module.exports = router