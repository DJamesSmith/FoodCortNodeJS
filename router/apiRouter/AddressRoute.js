const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const addressController = require('../../controller/apiController/AddressController')
const auth = require('../../middleware/auth')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// GET - Addresses for a particular User
router.get('/user/addresses', auth, addressController.allAddresses)

// POST - Add address for a particular User
router.post('/user/create-address', auth, addressController.addAddress)

// PUT - Edit address for a particular User's particular address
router.put('/user/address/:addressId', auth, addressController.updateAddress)

// DELETE - Delete a particular address of a User
router.delete('/user/address/:addressId', auth, addressController.deleteAddress)

module.exports = router