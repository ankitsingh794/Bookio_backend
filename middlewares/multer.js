const multer = require('multer');
const path = require('path');
const logger = require('../config/logger');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    const error = new Error('Only images are allowed (jpeg, jpg, png, webp)');
    error.status = 400; // Bad Request
    logger.warn(`File upload rejected: ${file.originalname} - Invalid file type`);
    cb(error);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
