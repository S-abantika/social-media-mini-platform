const cloudinary = require('cloudinary').v2;
const fs = require('fs');

/**
 * Checks whether all required Cloudinary environment variables are configured.
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Configure Cloudinary SDK if credentials exist
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Uploads a local file to Cloudinary and deletes local temporary copy.
 * Returns the secure HTTPS URL if successful, or null on failure.
 *
 * @param {string} localFilePath - Path to file on disk
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<string|null>}
 */
const uploadToCloudinary = async (localFilePath, folder = 'connectly') => {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'auto'
    });

    // Clean up temporary local disk file after upload to avoid ephemeral disk buildup
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (cleanupErr) {
      console.warn(`[Cloudinary] Failed to clean up temp file: ${cleanupErr.message}`);
    }

    return result.secure_url;
  } catch (error) {
    console.error(`[Cloudinary] Upload failed: ${error.message}`);
    return null;
  }
};

module.exports = {
  isCloudinaryConfigured,
  uploadToCloudinary
};
