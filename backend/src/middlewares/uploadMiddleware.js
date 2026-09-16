const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Upload Middleware — Multer bilan lokal disk storage
 * Rasm fayllari backend/uploads/<category>/ papkasiga saqlanadi
 * URL: /uploads/<category>/filename.ext
 */

// Papkani avtomatik yaratish
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Route parametridan yoki default 'misc' papkasini aniqlash
    const category = req.uploadCategory || 'misc';
    const uploadPath = path.join(__dirname, '../../uploads', category);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Fayl nomi: timestamp-originalname (bo'shliqlar o'rniga chiziq)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 40);
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  },
});

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
