const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const logger = require('../config/logger'); // assuming you have a logger

// Allowed MIME types for images
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      logger.warn('Image upload attempted without file');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      logger.warn(`Invalid file type attempted for upload: ${req.file.mimetype}`);
      return res.status(400).json({ message: 'Invalid file type. Only images are allowed.' });
    }

    // Optional: file size limit (example: max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (req.file.size > maxSizeBytes) {
      logger.warn(`File size exceeded: ${req.file.size} bytes`);
      return res.status(400).json({ message: 'File size too large. Max 5MB allowed.' });
    }

    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'bookio_uploads' },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error', error);
              return reject(error);
            }
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadFromBuffer();

    logger.info(`Image uploaded to Cloudinary: ${result.public_id}`);

    res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    logger.error('Server error during image upload', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

module.exports = { uploadImage };
