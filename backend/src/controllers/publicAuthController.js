const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper to clean and format phone number (+998XXXXXXXXX format)
const cleanPhone = (val) => {
  if (!val) return val;
  // Remove all spaces, dashes, brackets, and plus signs
  let clean = String(val).replace(/[\s\-\(\)\+]/g, '');
  
  // If it has double 998 prefix (e.g. 998998901585003 - length 15), remove one
  if (clean.startsWith('998998') && clean.length === 15) {
    clean = clean.slice(3);
  }
  
  // If it starts with 998 and is 12 digits long, it's correct
  if (clean.startsWith('998') && clean.length === 12) {
    return '+' + clean;
  }
  
  // If it is 9 digits long, prepend +998
  if (clean.length === 9) {
    return '+998' + clean;
  }
  
  // General fallback
  if (!clean.startsWith('998')) {
    clean = '998' + clean;
  }
  return '+' + clean;
};

/**
 * Public Login - Telefon va Tug'ilgan kun (YYYYMMDD) bilan kirish
 * POST /api/v1/auth/public-login
 */
exports.publicLogin = async (req, res) => {
  try {
    const { phone } = req.body;
    const birthdateInput = req.body.birthdate || req.body.birthDate;

    if (!phone || !birthdateInput) {
      return res.status(400).json({
        status: 'error',
        message: "Iltimos, telefon raqami va tug'ilgan kunni kiriting",
      });
    }

    const formattedPhone = cleanPhone(phone);
    const cleanedBirthdate = String(birthdateInput).replace(/-/g, '');

    // Telefon orqali foydalanuvchini topamiz
    const user = await User.findOne({ phone: formattedPhone }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: "Telefon raqami yoki tug'ilgan kun noto'g'ri",
      });
    }

    // Holatini tekshiramiz
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        status: 'error',
        message: `Hisobingiz faol emas. Holat: ${user.status}`,
      });
    }

    // Role tekshiruvi (faqat o'quvchi va ota-onalar)
    if (!['STUDENT', 'PARENT'].includes(user.role)) {
      return res.status(403).json({
        status: 'error',
        message: "Sizning hisobingiz admin yoki o'qituvchi. Iltimos, admin panel orqali kiring.",
      });
    }

    // 1) Hashed parolni tekshirib ko'ramiz (foydalanuvchi parolini o'zgartirgan bo'lsa yoki boshlang'ich YYYYMMDD bo'lsa ham ishlaydi)
    const isPasswordMatch = await user.matchPassword(cleanedBirthdate);

    // 2) Zaxira sifatida tug'ilgan kun bilan to'g'ridan-to'g'ri solishtiramiz
    const isBirthdateMatch = user.birthDate && user.birthDate === cleanedBirthdate;

    if (!isPasswordMatch && !isBirthdateMatch) {
      return res.status(401).json({
        status: 'error',
        message: "Telefon raqami yoki parol noto'g'ri",
      });
    }

    // Token generatsiya qilamiz
    const token = generateToken(user._id);
    user.password = undefined;

    // Role asosida redirect manzilini aniqlash
    const redirectTo = user.role === 'PARENT' ? '/parent/dashboard' : '/dashboard';

    res.status(200).json({
      status: 'success',
      token,
      redirectTo,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Tizimga kirishda xatolik yuz berdi',
      error: error.message,
    });
  }
};

/**
 * Parent Login - Faqat telefon raqami orqali ota-ona bo'lib kirish
 * POST /api/v1/auth/parent-login
 */
exports.parentLogin = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        status: 'error',
        message: "Iltimos, telefon raqamini kiriting",
      });
    }

    const formattedPhone = cleanPhone(phone);

    // 1. Shu raqam qaysidir studentning ota-onasi ekanligini tekshiramiz
    const Student = require('../models/Student');
    const studentExists = await Student.findOne({ parentPhone: formattedPhone });

    if (!studentExists) {
      return res.status(403).json({
        status: 'error',
        message: "Kechirasiz, bu raqam hech qaysi o'quvchining ota-onasi sifatida ro'yxatdan o'tmagan.",
      });
    }

    // 2. User topamiz (yoki yaratamiz agar birinchi marta kirayotgan bo'lsa)
    // Bu yerda role tekshirmaymiz, chunki o'qituvchi ham ota-ona bo'lishi mumkin.
    let user = await User.findOne({ phone: formattedPhone });
    
    if (!user) {
      // Ota-ona uchun user modelini avtomatik yaratib qo'yamiz (parol: telefon raqami)
      user = await User.create({
        firstname: "Ota",
        lastname: "ona", // Mongoose 'required' errorini oldini olish uchun
        phone: formattedPhone,
        password: formattedPhone.replace('+', ''), // parolni raqam qilamiz, aslida soralmaydi
        role: 'PARENT',
        status: 'ACTIVE',
      });
    }

    // 3. Token yaratamiz
    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      redirectTo: '/parent/dashboard',
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Tizimga kirishda xatolik yuz berdi',
      error: error.message,
    });
  }
};
