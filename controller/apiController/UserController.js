const bcryptjs = require('bcryptjs')
const { User, passwordValidationMessages } = require('../../model/User')

const validateInput = (first_name, last_name, contact, password) => {
    const errors = []

    if (!first_name || !last_name || !contact || !password) {
        errors.push("Please fill up all the fields")
    } else {
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
    }

    return errors
}

// Password checking method
const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10)
        return passwordHash
    } catch (error) {
        // res.status(400).send(error.message)
        console.log(error)
    }
}

// GET - All Users
exports.allUsers = async (req, res) => {
    try {
        const data = await User.find().exec()
        console.log(data)
        res.status(200).send({ success: true, message: "All Users data from API fetched Successfully !", displaydata: data })
    } catch (error) {
        res.status(500).send({ message: error.message || "Some error occurred while fetching users" })
    }
}

// GET - Single User
exports.singleUser = (req, res) => {

    const userID = req.params.id

    User.findById(userID)
        .then(data => {
            res.status(200).send({ success: true, message: `User ID ${userID} from API fetched Successfully !`, user: data })
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occurred while creating User" })
        })
}

// POST - Add User
exports.createUser = async (req, res) => {
    //console.log(req.body)
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

    const UserModel = new User({
        first_name: capitalizedFirstName,
        last_name: capitalizedLastName,
        contact: contact,
        password: setpassword,
        decryptedPassword: password,
        profile_pic: profile_pic,
        profile_pic_originalname: req.file ? req.file.originalname : '',
        status: 1,
        isVerified: 0
    })

    await UserModel.save()
        .then(data => {
            res.status(200).send({ success: true, message: "User data created using API successfully!", user: data })
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating a User"
            })
        })
}

// PUT - Edit User
exports.updateUser = async (req, res) => {

    const setpassword = await securePassword(req.body.password)

    if (!req.body) {
        res.status(400).send({ message: "Please fill all the input fields." })
    }

    let profile_pic = ''

    if (req.file) {
        profile_pic = req.file.filename
    }

    const userID = req.params.id
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const contact = req.body.contact
    const password = setpassword

    User.findById(userID)
        .then(async result => {
            result.first_name = first_name
            result.last_name = last_name
            result.contact = contact
            result.password = password
            result.decryptedPassword = req.body.password
            result.profile_pic = profile_pic

            await result.save()
                .then(data => {
                    res.status(200).send({ success: true, message: `User edited using API successfully !`, user: data })
                })
                .catch(err => {
                    res.status(500).send({ message: err.message || "Some error occurred while updating a User" })
                })
        })
}

// DELETE - User (Soft Delete)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 0 })
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" })
        }
        return res.status(200).send({ success: true, message: `User with ID ${req.params.id} deleted successfully !`, user })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message || "Some error occurred while deleting a User" })
    }
}

exports.activateUser = (req, res) => {
    User.findByIdAndUpdate(req.params.id, { status: true })
        .then(updatedUser => {
            console.log("User Activated.")
            res.status(200).send({ success: true, message: `User Activated !`, user: updatedUser })
        })
        .catch(err => {
            console.log(err)
            res.status(500).send({ message: err.message || "Some error occurred while activating a User" })
        })
}

exports.deactivateUser = (req, res) => {
    User.findByIdAndUpdate(req.params.id, { status: false })
        .then(updatedUser => {
            console.log("User Deactivated.")
            res.status(200).send({ success: true, message: `User Deactivated !`, user: updatedUser })
        })
        .catch(err => {
            console.log(err)
            res.status(500).send({ message: err.message || "Some error occurred while deactivating a User" })
        })
}