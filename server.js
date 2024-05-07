const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const session = require('express-session')
const cron = require('node-cron')
const OTP = require('./model/OTP')
require("dotenv").config()

const app = express()
app.use(cookieParser())

app.use(express.json({ limit: "30mb", extended: true }))
app.use(express.urlencoded({ extended: true }))

mongoose.set('strictQuery', true)

app.use(session({
    secret: 'secret',
    cookie: { maxAge: 600000 },
    resave: false,
    saveUninitialized: false
}))

app.use(flash())

app.set('view engine', 'ejs')
// app.set('views', 'server/views/admin')
app.set('views', path.join(__dirname, 'views/admin'))

app.use(express.static(path.join(__dirname, 'public/admin')))
app.use(express.static(path.join(__dirname, 'public/adminUploads')))
app.use(express.static(path.join(__dirname, 'public/productUploads')))
app.use(express.static(path.join(__dirname, 'public/ingredientUploads')))
app.use(express.static(path.join(__dirname, 'public/userUploads')))

// Use BodyParser for GET data from form body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors())

// ---------------------------------------------------------------------------

// Schedule a job to run every 10 minutes
cron.schedule('*/10 * * * *', async () => {
    try {
        await OTP.deleteMany({ createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } })

        console.log('Expired OTP documents deleted successfully.')
    } catch (error) {
        console.error('Error deleting expired OTP documents:', error)
    }
})

// Run this on Query field in MongoAtlas "otps" Collection
// db.otp.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 300 })
// ---------------------------------------------------------------------------

const authAdmin = require('./middleware/AdminAuth')
app.use(authAdmin.authAdminJwt)
// ---------------------------------------------------------------------------

// ---------- ADMIN ----------

const adminAuthRouter = require('./router/adminRouter/AdminRouter')
app.use('/admin', adminAuthRouter)

// ---------- ADMIN ----------

// Category
const adminCategoryRoute = require('./router/templateRouter/AdminCategoryRouter')          // For Admin: GET, POST, PUT, DELETE
app.use('/admin', adminCategoryRoute)
const categoryRoute = require('./router/apiRouter/CategoryRoute')                          // For User: GET
app.use('/api', categoryRoute)

// Products
const adminProductRoute = require('./router/templateRouter/AdminProductRouter')          // For Admin: GET, POST, PUT, DELETE
app.use('/admin', adminProductRoute)
const productRoute = require('./router/apiRouter/ProductRoute')                          // For User fetch All Products
app.use('/api', productRoute)

// Extra-Ingredients
const adminIngredientRoute = require('./router/templateRouter/AdminIngredientRouter')          // For Admin: GET, POST, PUT, DELETE
app.use('/admin', adminIngredientRoute)
const ingredientRoute = require('./router/apiRouter/IngredientRoute')                          // For User: GET, POST (maybe)
app.use('/api', ingredientRoute)

// Comment
const adminCommentRoute = require('./router/templateRouter/AdminCommentRouter')          // For Admin: GET, PUT, DELETE
app.use('/admin', adminCommentRoute)
const commentRoute = require('./router/apiRouter/CommentRoute')                          // For User fetch + Add Comments
app.use('/api', commentRoute)

// Admin-User: Authenticated to Create, Edit and Delete User
const adminUserRoute = require('./router/templateRouter/AdminUserRoute')                     // For Admin
app.use('/admin', adminUserRoute)
const apiAdminUserRoute = require('./router/apiRouter/UserRoute')                            // For ReactNative API
app.use('/api', apiAdminUserRoute)


// Client-User
const userRoute = require('./router/UserRouter')                                              // User Auth
app.use('/api', userRoute)

// ---------------------------------------------------------------------------

const port = process.env.PORT

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(port, () => {
            console.log(`DB & Server Connected, listening on http://localhost:${port}/admin`)
        })
    }).catch(error => {
        console.log(error)
    })