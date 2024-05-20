const Address = require('../../model/Address')
const { User } = require('../../model/User')

// GET - Get all addresses for a particular User
exports.allAddresses = async (req, res) => {
    try {
        const userId = req.user._id
        const addresses = await Address.find({ user: userId })
            .populate('user', 'first_name last_name')

        if (addresses.length > 0) {
            const { first_name, last_name } = addresses[0].user
            res.status(200).json({ success: true, status: 200, addresses, message: `All addresses for ${first_name + ' ' + last_name} successfully fetched.` })
        } else if (addresses.length === 0) {
            res.status(404).json({ success: true, status: 404, addresses, message: `Address list is empty.` })
        }
    } catch (error) {
        console.error('Error fetching addresses:', error)
        res.status(500).json({ success: false, status: 500, message: 'Failed to fetch addresses' })
    }
}

// POST - Add an address for a particular User
exports.addAddress = async (req, res) => {
    try {
        const userId = req.user._id
        const { address, addressType, isDefault } = req.body

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' })
        }

        if (isDefault) {
            await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false })
        }

        const newAddress = new Address({ user: userId, address, addressType, isDefault })
        await newAddress.save()

        res.status(201).json({ success: true, status: 201, newAddress, message: `Address added successfully for ${user.first_name} ${user.last_name}` })
    } catch (error) {
        console.error('Error adding address:', error)
        res.status(500).json({ success: false, status: 500, message: 'Failed to add address' })
    }
}

// PUT - Update an address for a particular User
exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user._id
        const addressId = req.params.addressId
        const { address, addressType, isDefault } = req.body

        if (isDefault) {
            await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false })
        }

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: addressId, user: userId },
            { address, addressType, isDefault },
            { new: true }
        )
        const user = await User.findById(userId)

        if (!updatedAddress) {
            return res.status(404).json({ success: false, status: 404, message: `Address not found for the user ${user.first_name} ${user.last_name}` })
        }

        res.status(200).json({ success: true, status: 200, updatedAddress, message: `Address updated successfully for ${user.first_name} ${user.last_name}` })
    } catch (error) {
        console.error('Error updating address:', error)
        res.status(500).json({ success: false, status: 500, message: 'Failed to update address' })
    }
}

// DELETE - Delete a particular address of a User
exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId
        const address = await Address.findById(addressId)

        if (!address) {
            return res.status(404).json({ success: false, status: 404, message: 'Address not found' })
        }

        const user = await User.findById(address.user)
        const deletedAddress = await Address.findByIdAndDelete(addressId)

        if (deletedAddress) {
            res.status(200).json({ success: true, status: 200, deletedAddress, message: `Address for ${user.first_name} ${user.last_name} deleted successfully` })
        } else {
            res.status(404).json({ success: false, status: 404, message: 'Address not found' })
        }
    } catch (error) {
        console.error('Error deleting address:', error)
        res.status(500).json({ success: false, status: 500, message: 'Failed to delete address' })
    }
}

// PUT - Set an address as default for a User
exports.setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user._id
        const addressId = req.params.addressId

        await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false })

        const defaultAddress = await Address.findOneAndUpdate(
            { _id: addressId, user: userId },
            { isDefault: true },
            { new: true }
        )

        if (!defaultAddress) {
            return res.status(404).json({ success: false, status: 404, message: 'Address not found' })
        }

        res.status(200).json({ success: true, status: 200, defaultAddress, message: 'Default address set successfully' })
    } catch (error) {
        console.error('Error setting default address:', error)
        res.status(500).json({ success: false, status: 500, message: 'Failed to set default address' })
    }
}