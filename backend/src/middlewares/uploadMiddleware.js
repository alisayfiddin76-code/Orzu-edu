const multer = require('multer');

/**
 * Upload Middleware — Multer bilan Memory Storage
 * Render.com va boshqa cloud hosting larda disk read-only bo'lgani uchun
 * fayllar xotiraga (buffer) saqlanadi.
 * Keyinchalik Cloudinary yoki boshqa cloud storage ga yuklash mumkin.
 * req.file.buffer — fayl ma'lumotlari
 * req.file.mimetype — fayl turi
 * req.file.originalname — fayl nomi
 */

// Memory storage — disk o'rniga RAM da saqlaydi
const storage = multer.memoryStorage();

// Faqat rasm fayllari ruxsati
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error("Faqat rasm fayllari (jpg, png, webp, gif) yuklanishi mumkin"), false);
  }
};

// Rasm va hujjatlar (pdf, doc, docx) ruxsati
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Faqat rasm (jpg, png, webp) yoki hujjat (pdf, doc, docx) fayllari yuklanishi mumkin"), false);
  }
};

// Multer instances
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5MB
  },
});

const uploadDoc = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maksimal 10MB
  },
});

/**
 * Category middleware factory
 * Ishlatish: router.post('/', setCategory('blog'), upload.single('image'), controller)
 */
const setCategory = (category) => (req, res, next) => {
  req.uploadCategory = category;
  next();
};

module.exports = { upload, uploadDoc, setCategory };
