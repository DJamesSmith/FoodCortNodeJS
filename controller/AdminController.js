const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const AdminModel = require('../model/Admin')

exports.index = async (req, res) => {
    try {
        if (req.admin) {
            const adminDetails = await AdminModel.find({})
            res.render("index", {
                title: 'AdminLTE | Dashboard',
                dashboardtitle: 'Dashboard',
                data: req.admin,
                details: adminDetails,
                message: req.flash('message')
            })
        }
    } catch (error) {
        console.error("Error fetching admin details:", error)
    }
}

exports.contact = (req, res) => {
    res.render('contact', {
        title: 'AdminLTE | Contact',
        dashboardtitle: 'Contacts Page'
    })
}

exports.about = (req, res) => {
    res.render('about', {
        title: 'AdminLTE | About',
        dashboardtitle: 'About Page'
    })
}

// Register
exports.getAdminRegister = (req, res) => {
    res.render('adminAccess/AdminRegister', {
        title: "Admin | Registration",
        message: req.flash('message')
    })
}

exports.adminRegister = async (req, res) => {
    try {

        const existingAdmin = await AdminModel.findOne({ adminEmail: req.body.adminEmail })
        if (existingAdmin) {
            req.flash("message", "Admin with this email already exists")
            return res.redirect("/admin/signUp")
        }

        const { adminName, adminEmail, adminPassword, adminPasswordConfirm } = req.body;

        if (adminPassword !== adminPasswordConfirm) {
            req.flash("message", "Passwords do not match")
            return res.redirect("/admin/signUp")
        }

        const newAdmin = new AdminModel({
            adminName,
            adminEmail,
            adminPassword: bcrypt.hashSync(req.body.adminPassword, bcrypt.genSaltSync(10)),
            adminPasswordConfirm,
            adminImage: req.file.filename,
            status: 1
        })
        await newAdmin.save()

        req.flash("message", "Admin Successfully Added")
        res.redirect("/admin/signIn")
    } catch (error) {
        console.error("Error registering admin:", error)
        req.flash("message", "Failed to register admin")
        res.redirect("/admin/signUp")
    }
}

// Login
exports.getAdminLogin = (req, res) => {
    loginData = {}
    loginData.adminEmail = (req.cookies.adminEmail) ? req.cookies.adminEmail : undefined
    loginData.adminPassword = (req.cookies.adminPassword) ? req.cookies.adminPassword : undefined

    res.render('adminAccess/AdminLogin', {
        title: "Admin | Login",
        message: req.flash('message'),
        data: loginData
    })
}

exports.adminLogin = async (req, res) => {
    try {
        const admin = await AdminModel.findOne({ adminEmail: req.body.adminEmail })

        if (admin) {
            const hashPassword = admin.adminPassword;
            if (bcrypt.compareSync(req.body.adminPassword, hashPassword)) {
                const token = jwt.sign({
                    id: admin._id,
                    adminName: admin.adminName
                }, "admin#SecretKey@123", { expiresIn: '5h' })
                res.cookie("adminToken", token);

                if (req.body.rememberme) {
                    res.cookie('adminEmail', req.body.adminEmail)
                    res.cookie('adminPassword', req.body.adminPassword)
                }

                console.log("LoggedIn Data: ", admin)
                req.flash("message", "Login Successful.")
                res.redirect("/admin")
            } else {
                req.flash("message", "Invalid Password")
                res.redirect("/admin/signIn")
            }
        } else {
            req.flash("message", "Invalid Email")
            res.redirect("/admin/signIn")
        }
    } catch (error) {
        console.error("Error logging in admin:", error)
        req.flash("message", "Failed to login")
        res.redirect("/admin/signIn")
    }
}

exports.adminAuth = (req, res, next) => {
    if (req.admin) {
        console.log('req.admin', req.admin)
        next()
    } else {
        console.log(req.admin)
        res.redirect("/admin/signIn")
    }
}

exports.logout = (req, res) => {
    res.clearCookie("adminToken")
    res.redirect("/admin")
}