// EJS: Admin can have full access in a web page

const express = require('express')
const router = express.Router()
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require('path')

const productController = require('../../controller/adminController/AdminProductController')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
// -------------------------- Multer --------------------------
// D:\React Native\FinalProject\server\public\productUploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // const destinationPath = path.join(__dirname, '../', 'public/productUploads')

        // console.log("Product_Storage_Path:", destinationPath)
        // cb(null, destinationPath)
        cb(null, path.join(__dirname, `../../public/productUploads`), function (error, success) {
            if (error) throw error
        })
        console.log("Product_Storage_Path:", path.join(__dirname, `../public/productUploads`))
    },
    filename: (req, file, cb) => {
        // cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
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
router.get('/products', productController.allProducts)

// GET
router.get('/addProduct', productController.addProduct)
// POST
router.post('/createproduct', upload.single('image_product'), productController.createProduct)

// GET - Single Product for "Edit Product Page"
router.get('/editProduct/:productId', productController.singleProduct)
// PUT
router.post('/products/:productId', upload.single('image_product'), productController.updateProduct)

// DELETE
router.get('/products/:productId', productController.deleteProduct)

module.exports = router