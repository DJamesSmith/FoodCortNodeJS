const express = require('express')
const router = express.Router()
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require('path')

const productController = require('../../controller/ProductController')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
// -------------------------- Multer --------------------------
// D:\React Native\FinalProject\server\public\productUploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destinationPath = path.join(__dirname, '../', 'public/productUploads')

        console.log("Product_Storage_Path:", destinationPath)
        cb(null, destinationPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + 'product' + path.extname(file.originalname))
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
router.get('/products', productController.allProducts)

// POST
router.post('/createproduct', upload.single('image_product'), productController.createProduct)

// PUT


// DELETE

module.exports = router