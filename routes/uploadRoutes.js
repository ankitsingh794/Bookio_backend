const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const logger = require('../config/logger');

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'bookio' },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload error: ${error.message}`);
          return reject(error);
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

router.post('/image', upload.single('image'), async (req, res, next) => {
  logger.info('POST /upload/image route hit');
  try {
    if (!req.file) {
      logger.warn('No file uploaded in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    logger.info(`Image uploaded to Cloudinary: ${result.secure_url}`);

    res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    logger.error(`Image upload failed: ${error.message}`);
    next(error);
  }
});

module.exports = router;
