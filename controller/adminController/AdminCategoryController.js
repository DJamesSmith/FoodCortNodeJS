const CategoryModel = require('../../model/Category')

// GET - All Categories
exports.allCategories = async (req, res) => {
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

        console.log()

        const CategoryData = await CategoryModel.find({
            $or: [
                { categoryName: { $regex: '.*' + search + '.*', $options: 'i' } },
                { id: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()

        const count = await CategoryModel.find({
            $or: [
                { categoryName: { $regex: '.*' + search + '.*', $options: 'i' } },
                { id: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        })
            .countDocuments()

        res.render('Categories/allCategories', {
            title: 'AdminLTE | All Categories',
            dashboardtitle: 'Category Page',
            message: req.flash('message'),
            error: req.flash('error'),
            displaydata: CategoryData,
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

// POST - Add category
exports.createCategory = (req, res) => {
    //console.log(req.body)
    const category = new CategoryModel({
        categoryName: req.body.categoryName,
        status: true
    })
    category.save()
        .then(result => {
            console.log(result, "Category data Created Successfully.")
            req.flash('message', 'Category Added Successfully.')
            res.redirect('/admin/allCategories')
        })
        .catch(err => {
            console.log(err, "No Data Saved.")
            req.flash('error', 'Cannot save empty data.')
            res.redirect('/admin/allCategories')
        })
}

// DELETE - category
exports.deleteCategory = (req, res, next) => {
    const categoryID = req.params.id

    CategoryModel.deleteOne({ _id: categoryID })
        .then(result => {
            console.log(result, "category data deleted successfully.")
            req.flash('message', 'Deleted category data successfully')
            res.redirect('/admin/allCategories')
        })
        .catch(err => {
            console.log(err, "No Data Deleted.")
            req.flash('error', 'Unable to delete category data.')
            res.redirect('/admin/allCategories')
        })
}

// Normal Work of this idea
// Delete: A pop-up[ display 'Are you sure you want to delete this Category? All data saved under this category will be deleted.'
// Then all blogs automatically get deleted under this Category (only) using the categoryID when you click 'OK'.