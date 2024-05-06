const CategoryModel = require('../../model/Category')

// GET - All Categories
// exports.allCategories = (req, res) => {
//     CategoryModel.find((error, data) => {
//         console.log(data)
//         if (!error) {
//             res.status(200).send({ success: true, msg: "All Food Categories fetched Successfully !", displayCategoryData: data })
//         }
//     })
// }

exports.allCategories = async (req, res) => {
    try {
        const data = await CategoryModel.find()
        console.log(data)
        res.status(200).send({ success: true, msg: "All Food Categories fetched Successfully !", displayCategoryData: data })
    } catch (error) {
        console.error(error)
        res.status(500).send({ success: false, msg: "Error fetching categories" })
    }
}

// exports.singleCategory = async (req, res) => {                       // (Single Category) Fetch ONE categoryID - Many Food Products
//     try {
//         const BlogData = await BlogModel.find({ category: req.params._id }).populate('category')

//         if (BlogData) {
//             res.status(200).json({ status: 'success', message: `Category ID data fetched successfully.`, data: BlogData })
//         } else {
//             res.status(400).json({ status: 'failed', 'msg': "data not found" })
//         }
//     } catch (error) {
//         res.status(400).json({ msg: error.message })
//     }
// }

// // POST - Add category
// exports.createCategory = (req, res) => {
//     //console.log(req.body)
//     const Category = new CategoryModel({
//         categoryName: req.body.categoryName
//     })
//     Category.save()
//         .then(result => {
//             console.log(result, "Category data created successfully.")
//             res.status(200).send({ msg: 'Added category successfully', categoryData: result })
//         })
//         .catch(err => {
//             console.log(err, "No Data Saved.")
//             res.status(400).send('You can not send Empty data.')
//         })
// }

// // DELETE - category
// exports.deleteCategory = (req, res, next) => {
//     const categoryID = req.params.id

//     console.log('categoryID Value: ', categoryID)

//     CategoryModel.deleteOne({ _id: categoryID })
//         .then(data => {
//             res.status(200).send({ success: true, msg: `Data with Category ID [${categoryID}] using API deleted Successfully !`, categoryData: data })
//         })
//         .catch(error => {
//             console.log(`Error: ${error}`)
//         })
// }



// Normal Work of this idea
// Delete: A pop-up[ display 'Are you sure you want to delete this Category? All data saved under this category will be deleted.'
// Then all blogs automatically get deleted under this Category (only) using the categoryID when you click 'OK'.