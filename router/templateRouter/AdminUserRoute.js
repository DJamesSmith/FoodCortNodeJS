// For the admin to make changes from the backend side through admin-Panel Localhost:3002

const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')

const adminUserController = require('../../controller/adminController/AdminUserController')
const adminController = require('../../controller/AdminController')

// ---------------- Multer ----------------

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

// ---------------- Multer ----------------

// GET: All Users
router.get('/allUsers', adminUserController.allUsers)

// POST
router.get('/addUser', adminUserController.addUser)
router.post('/createUser', upload.single('profile_pic'), adminUserController.createUser)

// PUT
router.get('/editUser/:id', adminUserController.singleUser)
router.post('/updateUser/:id', upload.single('profile_pic'), adminUserController.updateUser)

// DELETE
router.get('/deleteUser/:id', adminUserController.deleteUser)

// Activate-Deactivate
router.get("/activateUser/:id", adminController.adminAuth, adminUserController.activateUser)
router.get("/deactivateUser/:id", adminController.adminAuth, adminUserController.deactivateUser)

module.exports = router