const fs = require('fs')

const imageToBase64 = filePath => {
    console.log(`Entered imageToBase64`)
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

module.exports = { imageToBase64 }