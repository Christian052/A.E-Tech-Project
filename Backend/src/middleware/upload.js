const multer = require('multer');

// Store file in RAM temporarily before streaming to Supabase Storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size limit
  },
  fileFilter: (req, file, cb) => {
    // Validate image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.'), false);
    }
  },
});

module.exports = upload;