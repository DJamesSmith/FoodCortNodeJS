// For the ADMIN in AdminPanel to access all Pages from the Backend Side of the Client Side Site Information.

const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')

const verifyAdminRegister = require("../../middleware/VerifyAdminRegister")
const adminController = require('../../controller/AdminController')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// -------------------------- Multer --------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // cb(null, "./server/public/adminUploads")
        cb(null, path.join(__dirname, '../../public/adminUploads'))
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + 'ADMIN' + path.extname(file.originalname))
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

router.get('/', adminController.adminAuth, adminController.index)
router.get('/contact', adminController.contact)
router.get('/about', adminController.about)

// GET Register Page
router.get("/signUp", adminController.getAdminRegister)
// POST Register
router.post('/adminRegister', [verifyAdminRegister.checkDuplicateEntries], upload.single('adminImage'), adminController.adminRegister)

// GET Login Page
router.get("/signIn", adminController.getAdminLogin)
// POST Login
router.post('/adminLogin', adminController.adminLogin)

router.get("/logout", adminController.logout)

module.exports = router