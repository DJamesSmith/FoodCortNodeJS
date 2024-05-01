const bcryptjs = require('bcryptjs')
const { User, passwordValidationMessages } = require('../../model/User')
const { imageToBase64 } = require('../../utility/Base64Image')

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

exports.allUsers = async (req, res) => {
    try {

        var search = ''
        if (req.query.search) {
            search = req.query.search
        }

        var page = 1
        if (req.query.page) {
            page = req.query.page
        }

        const limit = 5

        const userData = await User.find({
            $or: [
                { first_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { last_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { contact: { $regex: '.*' + search + '.*', $options: 'i' } },
                { password: { $regex: '.*' + search + '.*', $options: 'i' } },
            ]
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()

        const count = await User.find({
            $or: [
                { first_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { last_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { contact: { $regex: '.*' + search + '.*', $options: 'i' } },
                { password: { $regex: '.*' + search + '.*', $options: 'i' } },
            ]
        })
            .countDocuments()

        res.render('Users/allUsers', {
            title: 'AdminLTE | All Users',
            dashboardtitle: 'Users Page',
            message: req.flash('message'),
            error: req.flash('error'),
            displaydata: userData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            previousPage: page - 1,
            nextPage: page - (-1),
            count: count,
            limit: limit
        })

    } catch (error) {
        console.log(error.message)
    }
}

// GET - Add User
exports.addUser = ((req, res) => {
    res.render('Users/addUser', {
        title: 'AdminLTE | Add New User',
        dashboardtitle: 'Users Page',
        message: req.flash('message')
    })
})

// POST - Add User
exports.createUser = async (req, res) => {
    //console.log(req.body)
    const { first_name, last_name, contact, password } = req.body

    const errors = validateInput(first_name, last_name, contact, password)

    if (errors.length > 0) {
        const errorMessage = errors.join('\n')
        req.flash('error', errorMessage)
        return res.status(400).json({ success: false, status: 400, message: errorMessage })
        // return res.redirect('/admin/addUser')
    }

    let setpassword = ''
    if (password) {
        setpassword = await securePassword(password)
    }

    let profile_pic = ''

    if (req.file) {
        profile_pic = req.file.filename
        profile_pic = req.file.filename
        const filePath = `public/userUploads/${profile_pic}`
        const base64Image = await imageToBase64(filePath)
        profile_pic = base64Image
    }

    console.log(`Admin_added_profile_pic: ${profile_pic}`)

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
    UserModel.save()
        .then(result => {
            console.log(result, "User data created successfully.")
            req.flash('message', 'Added user successfully')
            res.redirect('/admin/allUsers')
        })
        .catch(err => {
            console.log(err, "No Data Saved.")
            req.flash('error', 'You can not send Empty data.')
            res.redirect('/admin/addUser')
        })
}

// GET - Single User for "Edit User Page"
exports.singleUser = ((req, res) => {

    const userID = req.params.id

    User.findById(userID)
        .then(result => {
            res.render('Users/editUser', {
                title: 'AdminLTE | Edit User',
                dashboardtitle: 'Users Page',
                message: req.flash('message'),
                data: result
            })
        })
})

// PUT - Edit User
exports.updateUser = async (req, res) => {
    try {
        const setpassword = await securePassword(req.body.password)

        let profile_pic = ''
        if (req.file) {
            profile_pic = req.file.filename
            const filePath = `public/userUploads/${profile_pic}`
            const base64Image = await imageToBase64(filePath)
            profile_pic = base64Image
        }
        console.log(`Admin_updated_profile_pic: ${profile_pic}`)

        await User.findByIdAndUpdate(req.params.id, {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            contact: req.body.contact,
            password: setpassword,
            decryptedPassword: req.body.password,
            profile_pic: profile_pic,
            status: 1,
            isVerified: 0
        })

        console.log("User Updated")
        res.redirect('/admin/allUsers')
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: error.message || "Some error occurred while updating a User" })
    }
}

// DELETE - User (Soft Delete)
exports.deleteUser = async (req, res) => {
    try {
        const result = await User.findByIdAndUpdate(req.params.id, { status: 0 })
        console.log('Deleted Successfully.', result)
        res.redirect('/admin/allUsers')
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: error.message || "Some error occurred while deleting a User" })
    }
}

exports.activateUser = (req, res) => {
    User.findByIdAndUpdate(req.params.id, {
        status: true
    })
        .then(() => {
            console.log("User Activated.")
            res.redirect("/admin/allUsers")
        })
        .catch(err => {
            console.log(err)
        })
}

exports.deactivateUser = (req, res) => {
    User.findByIdAndUpdate(req.params.id, {
        status: false
    })
        .then(() => {
            console.log("User Deactivated.")
            res.redirect("/admin/allUsers")
        })
        .catch(err => {
            console.log(err)
        })
}