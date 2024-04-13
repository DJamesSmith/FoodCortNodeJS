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

// Define static folder 
router.use(express.static('public'))

// Use multer diskStorage for file upload
const storage = multer.diskStorage({
    // User_Storage_Path: D:\React Native\FinalProject\server\public\userUploads
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

// Define uploaded storage path
const upload = multer({ storage: storage })

// -------------------------- Multer --------------------------

router.post('/user/register', upload.single('profile_pic'), userController.register)
router.post('/user/verify', userController.verify)

router.post('/user/login', userController.login)
router.post('/user/login-validate', auth, userController.loginValidate)
router.get('/user/profile-details', auth, userController.getProfileDetails)

router.post('/user/forgotpassword', userController.forgotPassword)
router.post('/user/validate-otp', auth, userController.validateOTP)
router.post('/user/updatepassword', auth, userController.updatePassword)

router.get('/user/resendOTP', auth, userController.resendOTP)
router.post('/user/logout', auth, userController.logout)

module.exports = router