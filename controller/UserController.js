const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const twilio = require('twilio')
const nodemailer = require('nodemailer')

const config = require('../config/config')
const { User, passwordValidationMessages } = require('../model/User')
const OTP = require('../model/OTP')
const client = twilio(config.twilio.accountSid, config.twilio.authToken, config.twilio.phoneNumber)
let userDataTemp = {}

const validateInput = (first_name, last_name, contact, password) => {
    const errors = []

    if (!first_name || !last_name || !contact || !password) {
        errors.push("Please fill up all the fields")
    } else {
        validatePassword(errors, password)
    }

    return errors
}

const validatePassword = (errors, password) => {
    if (!password || password.length < 6) {
        errors.push(passwordValidationMessages.minLength)
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push(passwordValidationMessages.specialChar)
    }
    if (!/[A-Z]/.test(password)) {
        errors.push(passwordValidationMessages.uppercase)
    }
    if (!/[a-z]/.test(password)) {
        errors.push(passwordValidationMessages.lowercase)
    }
    if (!/\d/.test(password)) {
        errors.push(passwordValidationMessages.number)
    }

    return errors
}

// Check password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10)
        return passwordHash
    } catch (error) {
        res.status(400).send(error.message)
        console.log(error)
    }
}

// Create token
const createToken = async id => {
    try {
        const token = await jwt.sign({ _id: id }, config.secret_jwt, { expiresIn: "1d" })
        return token
    } catch (error) {
        // res.status(400).send(error.message)
        console.log(error)
    }
}

// generateOTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000)
}




























































const lastOTPSendTime = {}
const otpResendTime = config.otpResendTime * 60 * 1000

// Send OTP via SMS
const sendOTPviaSMS = async (contact, otp) => {
    try {
        const currentTime = new Date().getTime()
        const lastSendTime = lastOTPSendTime[contact] || 0
        const elapsedTime = currentTime - lastSendTime

        console.log('\ncurrentTime:', currentTime)
        console.log('lastSendTime:', lastSendTime)
        console.log('elapsedTime:', elapsedTime)

        if (elapsedTime >= otpResendTime || !lastSendTime) {
            const message = await client.messages.create({
                body: `Your OTP for registration is: ${otp}`,
                from: config.twilio.phoneNumber,
                to: contact
            })

            lastOTPSendTime[contact] = currentTime
            return true
        } else {
            const minutes = Math.floor((otpResendTime - elapsedTime) / (1000 * 60))
            const seconds = Math.floor(((otpResendTime - elapsedTime) % (1000 * 60)) / 1000)
            const timeLeft = `${minutes}:${seconds.toString().padStart(2, '0')}`

            console.log('timeLeft:', timeLeft)
            return `Resend OTP enables in ${timeLeft}`
        }
    } catch (error) {
        console.error(`Error sending OTP to ${contact}: ${error}`)
        return false
    }
}

// Send OTP via Email
const sendOTPviaEmail = async (contact, otp) => {
    try {
        const currentTime = new Date().getTime()
        const lastSendTime = lastOTPSendTime[contact] || 0
        const elapsedTime = currentTime - lastSendTime

        console.log('\ncurrentTime:', currentTime)
        console.log('lastSendTime:', lastSendTime)
        console.log('elapsedTime:', elapsedTime)

        if (elapsedTime >= otpResendTime || !lastSendTime) {
            const transporter = nodemailer.createTransport(config.nodemailer)

            const mailOptions = {
                from: config.nodemailer.auth.user,
                to: contact,
                subject: 'OTP for Registration',
                text: `Your OTP for registration is: ${otp}`
            }

            await transporter.sendMail(mailOptions)
            lastOTPSendTime[contact] = currentTime
            return true
        } else {
            const minutes = Math.floor((otpResendTime - elapsedTime) / (1000 * 60))
            const seconds = Math.floor(((otpResendTime - elapsedTime) % (1000 * 60)) / 1000)
            const timeLeft = `${minutes}:${seconds.toString().padStart(2, '0')}`

            console.log('timeLeft:', timeLeft)
            return `Resend OTP enables in ${timeLeft}`
        }
    } catch (error) {
        console.error('Error sending OTP via email:', error)
        return false
    }
}





























































// Save OTP to DB
const saveOtpToDB = async (contact, otp) => {
    try {
        const newOTP = await new OTP({
            contact: contact,
            otp: otp
        }).save()
        return newOTP
    } catch (error) {
        console.error('Error saving OTP to the database:', error)
        return null
    }
}

// Register
exports.register = async (req, res) => {
    try {
        const { first_name, last_name, contact, password } = req.body

        const errors = validateInput(first_name, last_name, contact, password)

        if (errors.length > 0) {
            const errorMessage = errors.join('\n')
            return res.status(400).json({ success: false, status: 400, message: errorMessage })
        }

        let setpassword = ''
        if (password) {
            setpassword = await securePassword(password)
        }

        let profile_pic = ''

        if (req.file) {
            profile_pic = req.file.filename
        }

        const capitalizedFirstName = first_name.charAt(0).toUpperCase() + first_name.slice(1)
        const capitalizedLastName = last_name.charAt(0).toUpperCase() + last_name.slice(1)

        const existingUser = await User.findOne({ contact })
        if (existingUser) {
            return res.status(400).json({ success: false, status: 400, message: `The contact ${contact} already exists` })
        }

        userDataTemp = await new User({
            first_name: capitalizedFirstName,
            last_name: capitalizedLastName,
            contact: contact,
            password: setpassword,
            decryptedPassword: password,
            profile_pic: profile_pic,
            profile_pic_originalname: req.file ? req.file.originalname : '',
            status: true
        })

        const otp = generateOTP()
        const isEmail = /^\S+@\S+\.\S+$/.test(contact)

        const newOTP = await saveOtpToDB(contact, otp)
        if (!newOTP) {
            return res.status(400).json({ success: false, status: 400, message: `Failed to generate OTP for contact ${contact}` })
        }

        let result
        if (isEmail) {
            result = await sendOTPviaEmail(contact, otp)
        } else {
            result = await sendOTPviaSMS(contact, otp)
        }

        if (typeof result === 'string') {
            return res.status(400).json({ success: false, status: 400, message: result })
        } else if (!result) {
            return res.status(500).json({ success: false, status: 500, message: `Failed to send OTP to contact ${contact}` })
        }

        res.status(200).send({ success: true, status: 200, message: `OTP sent successfully to ${contact}` })
    } catch (error) {
        res.status(400).send({ success: false, status: 400, message: 'Failed to send OTP' })
        console.log(error.message)
    }
}

// Verification
exports.verify = async (req, res) => {
    try {
        const { contact, otp_input } = req.body

        const savedOTP = await OTP.findOne({ contact, otp: otp_input })
        // console.log(`savedOTP: ${savedOTP}`)
        if (!savedOTP) {
            return res.status(400).json({ success: false, status: 400, message: 'Invalid OTP' })
        }

        const otpExpirationTime = new Date(savedOTP.createdAt.getTime() + config.otpExpirationDuration)
        // console.log(`otpExpirationTime: ${otpExpirationTime}`)
        const currentTime = new Date()
        if (currentTime > otpExpirationTime) {
            return res.status(400).json({ success: false, status: 400, message: 'OTP has expired' })
        }

        const user_data = await userDataTemp.save()
        await User.findOneAndUpdate({ contact }, { $set: { isVerified: true } }, { new: true })
        const tokendata = await createToken(user_data._id)

        await OTP.deleteOne({ contact })
        userDataTemp = {}

        res.status(200).send({ success: true, status: 200, data: user_data, token: tokendata, message: `Account successfully registered.` })
    } catch (error) {
        res.status(400).send({ success: false, status: 400, message: 'Failed to verify OTP' })
        console.log(error.message)
    }
}

// Login
exports.login = async (req, res) => {
    try {
        const { contact, password } = req.body

        if (!(contact && password)) {
            return res.status(400).json({ status: false, message: "All inputs required." })
        }

        const user = await User.findOne({ contact })

        if (!user) {
            return res.status(400).json({ status: 400, message: `User with contact ${contact} does not exist.` })
        }

        if (!user.status) {
            return res.status(401).json({ status: 401, message: `Your account has been deactivated.` })
        }

        if (!user.isVerified && user && (await bcryptjs.compare(password, user.password))) {
            const otp = generateOTP()
            const isEmail = /^\S+@\S+\.\S+$/.test(contact)

            let result
            if (isEmail) {
                result = await sendOTPviaEmail(contact, otp)
            } else {
                result = await sendOTPviaSMS(contact, otp)
            }

            const newOTP = await saveOtpToDB(contact, otp)
            if (!newOTP) {
                return res.status(400).json({ success: false, status: 400, message: `Failed to generate OTP for contact ${contact}` })
            }

            if (typeof result === 'string') {
                return res.status(400).json({ success: false, status: 400, message: result })
            } else if (!result) {
                return res.status(500).json({ success: false, status: 500, message: `Failed to send OTP to contact ${contact}` })
            }

            const tokendata = await createToken(user._id)

            return res.status(500).json({ success: false, status: 401, message: 'User is not verified', token: tokendata })
        } else {
            if (user && (await bcryptjs.compare(password, user.password))) {
                const tokendata = await createToken(user._id)
                return res.status(200).json({ success: true, status: 200, data: user, message: `Logged in successfully`, token: tokendata })
            } else if (!await bcryptjs.compare(password, user.password)) {
                return res.status(401).json({ status: 401, message: `Incorrect password` })
            }
        }

    } catch (err) {
        res.status(400).send({ success: false, status: 400, message: 'An error occurred while logging in. Please try again later.' })
        console.log(err)
    }
}

exports.loginValidate = async (req, res) => {
    try {
        const { contact, otp_input } = req.body

        const savedOTP = await OTP.findOne({ contact, otp: otp_input })
        // console.log(`savedOTP: ${savedOTP}`)

        if (!savedOTP) {
            return res.status(400).json({ success: false, status: 400, message: 'Invalid OTP' })
        }

        const otpExpirationTime = new Date(savedOTP.createdAt.getTime() + config.otpExpirationDuration)
        const currentTime = new Date()
        if (currentTime > otpExpirationTime) {
            return res.status(400).json({ success: false, status: 400, message: 'OTP has expired' })
        }

        await User.findOneAndUpdate({ contact }, { $set: { isVerified: true } }, { new: true })

        res.status(200).json({ success: true, status: 200, message: `User with contact ${contact} successfully verified.` })
    } catch (error) {
        console.error('Error in validateOTP:', error);
        res.status(500).json({ success: false, status: 500, message: 'Internal server error' })
    }
}

// User Details
exports.getProfileDetails = async (req, res) => {
    try {
        const userId = req.user._id
        // const userDetails = await User.findOne({ userId })
        const userDetails = await User.findById(userId)

        // console.log(`userDetails: ${userDetails}`)

        if (!userDetails) {
            return res.status(404).json({ message: 'User details not found' })
        }

        res.status(200).json({ message: 'Profile details retrieved successfully', userDetails })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
}

// Determine SMS or Email, Generate OTP accordingly
const otpdetermine = () => {

}

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { contact } = req.body

        if (!contact) {
            return res.status(400).json({ success: false, status: 400, message: 'Please provide your contact information' })
        }

        const user = await User.findOne({ contact })

        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: `User with contact ${contact} not found` })
        }

        const tokenData = await createToken(user._id)

        const otp = generateOTP()
        const isEmail = /^\S+@\S+\.\S+$/.test(contact)

        const newOTP = await saveOtpToDB(contact, otp)
        if (!newOTP) {
            return res.status(400).json({ success: false, status: 400, message: `Failed to generate OTP for contact ${contact}` })
        }

        let result
        if (isEmail) {
            result = await sendOTPviaEmail(contact, otp)
        } else {
            result = await sendOTPviaSMS(contact, otp)
        }

        if (typeof result === 'string') {
            return res.status(400).json({ success: false, status: 400, message: result })
        } else if (!result) {
            return res.status(500).json({ success: false, status: 500, message: `Failed to send OTP to contact ${contact}` })
        }

        res.status(200).json({ success: true, status: 200, message: `OTP sent successfully to contact ${contact}`, token: tokenData })
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ success: false, status: 500, message: 'Internal server error' })
    }
}

// Validate OTP
exports.validateOTP = async (req, res) => {
    try {
        const { contact, otp_input } = req.body

        const savedOTP = await OTP.findOne({ contact, otp: otp_input })
        // console.log(`savedOTP: ${savedOTP}`)

        if (!savedOTP) {
            return res.status(400).json({ success: false, status: 400, message: 'Invalid OTP' })
        }

        const otpExpirationTime = new Date(savedOTP.createdAt.getTime() + config.otpExpirationDuration)
        const currentTime = new Date()
        if (currentTime > otpExpirationTime) {
            return res.status(400).json({ success: false, status: 400, message: 'OTP has expired' })
        }

        res.status(200).json({ success: true, status: 200, message: `User with contact ${contact} successfully validated` })
    } catch (error) {
        console.error('Error in validateOTP:', error);
        res.status(500).json({ success: false, status: 500, message: 'Internal server error' })
    }
}

// Update Password: For Verified Users Only
exports.updatePassword = async (req, res) => {
    try {
        const { contact, otp_input, password, decryptedPassword } = req.body

        // console.log(`contact: ${contact}, password: ${password}, decryptedPassword: ${decryptedPassword}`)

        const arrErrors = []
        const errors = validatePassword(arrErrors, password)

        if (errors.length > 0) {
            const errorMessage = errors.join('\n')
            return res.status(400).json({ success: false, status: 400, message: errorMessage })
        }

        const userData = await User.findOne({ contact })
        console.log(`userData: ${userData}`)
        if (!userData) {
            return res.status(400).json({ success: false, status: 400, message: 'User not found' })
        }

        const savedOTP = await OTP.findOne({ contact, otp: otp_input })
        // console.log(`savedOTP: ${savedOTP}`)

        if (!savedOTP) {
            return res.status(400).json({ success: false, status: 400, message: 'Invalid OTP' })
        }

        const otpExpirationTime = new Date(savedOTP.createdAt.getTime() + config.otpExpirationDuration)
        const currentTime = new Date()
        if (currentTime > otpExpirationTime) {
            return res.status(400).json({ success: false, status: 400, message: 'OTP has expired' })
        }

        if (password !== decryptedPassword) {
            return res.status(400).json({ success: false, status: 400, message: 'Passwords do not match' })
        }

        const hashedPassword = await bcryptjs.hash(password, 10)
        userData.password = hashedPassword
        userData.decryptedPassword = password

        await userData.save()

        return res.status(200).json({ success: true, status: 200, message: 'Password changed successfully', data: userData })
    } catch (error) {
        console.error('Error in updatePassword:', error)
        return res.status(500).json({ success: false, status: 500, message: 'Internal server error' })
    }
}

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
}

// Logout
exports.logout = async (req, res) => {
    try {

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
}