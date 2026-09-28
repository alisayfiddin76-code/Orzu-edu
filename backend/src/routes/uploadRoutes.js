const express = require('express');
const router = express.Router();
const multer = require('multer');
const { bucket } = require('../config/firebase');
const AppError = require('../utils/appError');
const { protect } = require('../middlewares/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Fayl yuklanmadi', 400));
    }

    const file = req.file;
    // Format: timestamp-random.ext
    const ext = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (err) => {
      console.error('Firebase upload error:', err);
      return next(new AppError('Faylni Firebase ga yuklashda xatolik yuz berdi', 500));
    });

    blobStream.on('finish', async () => {
      try {
        // Faylni ommaviy (public) qilish
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        
        res.status(200).json({
          status: 'success',
          data: {
            url: publicUrl
          }
        });
      } catch (publicErr) {
        console.error('Make public error:', publicErr);
        // Note: some buckets have uniform bucket-level access enabled, where makePublic fails but the bucket is already public.
        // We fallback to returning the URL anyway.
        const fallbackUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
        res.status(200).json({
          status: 'success',
          data: {
            url: fallbackUrl
          }
        });
      }
    });

    blobStream.end(file.buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
