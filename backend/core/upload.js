const multer = require('multer');
const path = require('path');
const fs = require('fs');


const upload = {};

const storage = multer.diskStorage({
    destination: './uploads/images/profile',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

upload.profileImage = multer({ storage: storage });

// Synchronously delete a file
upload.deletefile = (path) => {
    try {
        fs.unlinkSync(path);
        console.log('File deleted!');
    } catch (err) {
        // Handle specific error if any
        console.error(err.message);
    }
}

module.exports = upload;
