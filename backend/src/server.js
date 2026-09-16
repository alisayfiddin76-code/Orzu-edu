const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// ---- CORS — faqat ruxsat etilgan domenlar ----
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'];

app.use(cors({
  origin: function (origin, callback) {
    // Development rejimida hamma originlarga ruxsat beramiz (mobil Wi-Fi orqali test qilish uchun)
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // allow requests with no origin (mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: '${origin}' manziliga ruxsat yo'q`));
    }
  },
  credentials: true,
}));

// ---- Rate Limiting ----
// Umumiy API rate limit: 1 daqiqada 200 ta so'rov
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 daqiqa
  max: 200,
  message: { status: 'error', message: "Juda ko'p so'rov. Iltimos, bir daqiqa kuting." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login uchun kattaroq cheklov: 15 daqiqada 15 ta urinish
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 15,
  message: { status: 'error', message: "Juda ko'p urinish. 15 daqiqadan keyin qayta urining." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
})); // Secure HTTP headers with cross-origin resource policy disabled for static files
app.use(express.json({ limit: '5mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Umumiy rate limit barcha API ga
app.use('/api/', generalLimiter);

// Serve static files from uploads directory using absolute path
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Dev Logging Middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Import Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const leadRoutes = require('./routes/leadRoutes');
const groupRoutes = require('./routes/groupRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const teacherDashboardRoutes = require('./routes/teacherDashboardRoutes');
const blogRoutes = require('./routes/blogRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const messageRoutes = require('./routes/messageRoutes');
const financeRoutes = require('./routes/financeRoutes');
const studentOfMonthRoutes = require('./routes/studentOfMonthRoutes');
const parentRoutes = require('./routes/parentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const contactSettingsRoutes = require('./routes/contactSettingsRoutes');

// Inline Public Stats Endpoint (no auth required)
const Student = require('./models/Student');
const User = require('./models/User');
const Course = require('./models/Course');
const Achievement = require('./models/Achievement');

app.get('/api/v1/stats', async (req, res) => {
  try {
    const [studentCount, teacherCount, courseCount, achievementCount] = await Promise.all([
      Student.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ role: 'TEACHER' }),
      Course.countDocuments({ status: 'ACTIVE' }),
      Achievement.countDocuments()
    ]);
    res.status(200).json({
      status: 'success',
      data: { studentCount, teacherCount, courseCount, achievementCount }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Mount Routes
app.use('/api/v1/auth', loginLimiter, authRoutes); // Login uchun alohida rate limit
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/student', studentRoutes); // Alias mount for student portal
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/teacher/dashboard', teacherDashboardRoutes); // Teacher Dashboard 2.0
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/student-of-month', studentOfMonthRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/settings/contact', contactSettingsRoutes);

// Base Route for Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to ORZU EDU API. Server is running smoothly.'
  });
});

// Handle unhandled routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Ushbu havola topilmadi: ${req.originalUrl}`, 404));
});

// Global Error Handler Middleware
app.use(globalErrorHandler);

// Port configuration
const PORT = process.env.PORT || 5002;

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // ---- Monthly Invoice Cron Job ----
  // Har oyning 1-kuni soat 00:05 da barcha faol o'quvchilarga to'liq oylik invoice yaratiladi
  try {
    const cron = require('node-cron');
    const { generateMonthlyInvoices } = require('./controllers/financeController');
    cron.schedule('5 0 1 * *', async () => {
      console.log('[CRON] Oylik invoicelar yaratilmoqda...');
      try {
        const result = await generateMonthlyInvoices();
        console.log(`[CRON] Muvaffaqiyat: ${result.created} ta yaratildi, ${result.skipped} ta o'tkazib yuborildi`);
      } catch (err) {
        console.error('[CRON] Xatolik:', err.message);
      }
    });
    console.log('[CRON] Oylik invoice generator rejalashtirildi (har oyning 1-kuni 00:05)');
  } catch (e) {
    console.warn('[CRON] node-cron topilmadi:', e.message);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
