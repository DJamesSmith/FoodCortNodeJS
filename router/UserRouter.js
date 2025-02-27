const express = require('express')
const router = express.Router()
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require('path')

const userController = require('../controller/UserController')
const auth = require('../middleware/auth')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
// -------------------------- Multer --------------------------

router.use(express.static('public'))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, `../public/userUploads`), function (error, success) {
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

const upload = multer({ storage: storage })

// -------------------------- Multer --------------------------

router.post('/user/register', upload.single('profile_pic'), userController.register)
router.post('/user/verify', userController.verify)

router.post('/user/login', userController.login)
router.post('/user/login-validate', auth, userController.loginValidate)
router.get('/user/profile-details', auth, userController.getProfileDetails)

router.put('/user/editprofile', auth, upload.single('profile_pic'), userController.updateProfile)

router.post('/user/forgotpassword', userController.forgotPassword)
router.post('/user/validate-otp', auth, userController.validateOTP)
router.post('/user/updatepassword', auth, userController.updatePassword)

router.put('/user/change-password', auth, userController.changePassword)

module.exports = router