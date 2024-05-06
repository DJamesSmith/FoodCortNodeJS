const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const categoryController = require('../../controller/apiController/CategoryController')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// GET: All Categories
router.get('/category', categoryController.allCategories)

// // GET: Single Category
// router.get('/singleCategory/:_id', categoryController.singleCategory)

// // POST
// router.post('/createCategory', categoryController.createCategory)

// // DELETE
// router.get('/deleteCategory/:id', categoryController.deleteCategory)

module.exports = router