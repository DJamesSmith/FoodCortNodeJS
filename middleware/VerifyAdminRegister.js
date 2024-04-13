const AdminModel = require("../model/Admin")

exports.checkDuplicateEntries = async (req, res, next) => {
    try {
        const existingAdminName = await AdminModel.findOne({ adminName: req.body.adminName })
        if (existingAdminName) {
            req.flash("message", "Admin Name Already Exists")
            return res.redirect("/register")
        }

        const existingAdminEmail = await AdminModel.findOne({ adminEmail: req.body.adminEmail })
        if (existingAdminEmail) {
            req.flash("message", "Email Already Exists")
            return res.redirect("/register")
        }

        const adminPassword = req.body.adminPassword;
        const confirm = req.body.adminPasswordConfirm
        if (adminPassword !== confirm) {
            req.flash("message", "Passwords do not match")
            return res.redirect("/register")
        }

        next();
    } catch (error) {
        console.error("Error checking for duplicate entries:", error)
        return res.status(500).send("Internal Server Error")
    }
}