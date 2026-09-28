const { bucket } = require('../config/firebase');

/**
 * Uploads a file buffer to Firebase Storage and returns the public URL
 * @param {Object} file - The file object from multer (req.file)
 * @param {String} folder - The folder name in Firebase Storage (e.g., 'blog', 'partners')
 * @returns {Promise<String>} - The public URL of the uploaded file
 */
const uploadToFirebase = (file, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    const ext = file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (error) => {
      console.error('Firebase upload error:', error);
      reject(error);
    });

    blobStream.on('finish', async () => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      } catch (err) {
        // Fallback for uniform bucket-level access
        const fallbackUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
        resolve(fallbackUrl);
      }
    });

    blobStream.end(file.buffer);
  });
};

module.exports = { uploadToFirebase };
