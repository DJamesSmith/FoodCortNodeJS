const Address = require('../../model/Address')
const { User } = require('../../model/User')

// GET - Get all addresses for a particular User
exports.allAddresses = async (req, res) => {
    try {
        const userId = req.params.userId
        const addresses = await Address.find({ user: userId })
            .populate('user', 'first_name last_name')

        if (addresses.length > 0) {
            const { first_name, last_name } = addresses[0].user
            res.status(200).json({ success: true, addresses, message: `All addresses for ${first_name + ' ' + last_name} successfully fetched.` })
        } else if (addresses.length === 0) {
            res.status(200).json({ success: true, addresses, message: `Address list is empty.` })
        }
    } catch (error) {
        console.error('Error fetching addresses:', error)
        res.status(500).json({ success: false, message: 'Failed to fetch addresses' })
    }
}

// POST - Add an address for a particular User
exports.addAddress = async (req, res) => {
    try {
        const userId = req.params.userId
        const { address } = req.body

        const user = await User.findById(userId)

        const newAddress = new Address({ user: userId, address })
        await newAddress.save()

        res.status(200).json({ success: true, newAddress, message: `Address added successfully for ${user.first_name} ${user.last_name}` })
    } catch (error) {
        console.error('Error adding address:', error)
        res.status(500).json({ success: false, message: 'Failed to add address' })
    }
}

// PUT - Update an address for a particular User
exports.updateAddress = async (req, res) => {
    try {
        const userId = req.params.userId
        const addressId = req.params.addressId
        const { address } = req.body

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: addressId, user: userId },
            { address },
            { new: true }
        )
        const user = await User.findById(userId)

        if (!updatedAddress) {
            return res.status(404).json({ success: false, message: `Address not found for the user ${user.first_name} ${user.last_name}` })
        }

        res.status(200).json({ success: true, updatedAddress, message: `Address updated successfully for ${user.first_name} ${user.last_name}` })
    } catch (error) {
        console.error('Error updating address:', error)
        res.status(500).json({ success: false, message: 'Failed to update address' })
    }
}

// DELETE - Delete a particular address of a User
exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId
        const address = await Address.findById(addressId)

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' })
        }

        const user = await User.findById(address.user)
        const deletedAddress = await Address.findByIdAndDelete(addressId)

        if (deletedAddress) {
            res.status(200).json({ success: true, deletedAddress, message: `Address for ${user.first_name} ${user.last_name} deleted successfully` })
        } else {
            res.status(404).json({ success: false, message: 'Address not found' })
        }
    } catch (error) {
        console.error('Error deleting address:', error)
        res.status(500).json({ success: false, message: 'Failed to delete address' })
    }
}