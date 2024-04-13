// For the admin to make changes from the backend side through POSTMAN

const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')

const userController = require('../../controller/apiController/UserController')
const adminController = require('../../controller/AdminController')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// -------------------------- Multer --------------------------

router.use(express.static('public'))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, `../../public/userUploads`), function (error, success) {
            if (error) throw error
        })
        console.log("User_Storage_Path:", path.join(__dirname, `../public/userUploads`))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '_' + path.extname(file.originalname)
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

// GET: All Users
router.get('/allUsers', userController.allUsers)

// GET: Single User
router.get('/singleUser/:id', userController.singleUser)

// POST
router.post('/createUser',  upload.single('profile_pic'), userController.createUser)

// PUT
router.post('/updateUser/:id',  upload.single('profile_pic'), userController.updateUser)

// DELETE
router.get('/deleteUser/:id', userController.deleteUser)

// Activate-Deactivate
router.get("/activateUser/:id", adminController.adminAuth, userController.activateUser)
router.get("/deactivateUser/:id", adminController.adminAuth, userController.deactivateUser)

module.exports = router