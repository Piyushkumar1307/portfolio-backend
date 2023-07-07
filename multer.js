const multer = require('multer');

// Define the storage configuration for multer
const storage = multer.diskStorage({
  destination: 'certiuploads/', // Specify the destination folder for uploaded files
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
  },
});

// Create the multer instance with the storage configuration
const upload = multer({ storage });

module.exports = upload;
