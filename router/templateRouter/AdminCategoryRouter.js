const express = require('express')
const router = express.Router()

const adminController = require('../../controller/adminController/AdminCategoryController')

// GET: All Categories
router.get('/allCategories', adminController.allCategories)

// POST
router.post('/createCategory', adminController.createCategory)

// DELETE
router.get('/deleteCategory/:id', adminController.deleteCategory)

module.exports = router