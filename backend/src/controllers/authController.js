const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Helper to generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT Token
 */
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
 * Register a new user (PUBLIC: O'quvchi ro'yxatdan o'tishi)
 * POST /api/v1/auth/register
 * Phone = login, birthDate (YYYY-MM-DD) = password
 */
exports.register = async (req, res) => {
  try {
    const { firstname, lastname, phone, email, password, role, avatar, birthDate, parentPhone, course, source } = req.body;

    const formattedPhone = cleanPhone(phone);

    // BirthDate dan passwordni aniqlash
    let resolvedPassword = password;
    let birthdateFormatted = null;

    if (birthDate) {
      birthdateFormatted = birthDate.replace(/-/g, '');
      resolvedPassword = birthdateFormatted; 
    }

    if (!resolvedPassword) {
      return res.status(400).json({
        status: 'error',
        message: "Parol yoki tug'ilgan sana majburiy",
      });
    }

    const userExists = await User.findOne({ phone: formattedPhone });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: "Foydalanuvchi ushbu telefon raqami bilan allaqachon ro'yxatdan o'tgan",
      });
    }

    const user = await User.create({
      firstname,
      lastname,
      phone: formattedPhone,
      email: email || undefined,
      password: resolvedPassword,
      role: role || 'STUDENT',
      avatar,
      birthDate: birthdateFormatted, 
    });

    // Create a Lead record so CRM admins see the application
    const Lead = require('../models/Lead');
    const newLead = await Lead.create({
      fullname: `${firstname} ${lastname}`.trim(),
      phone: formattedPhone,
      course: course || null,
      source: source || 'WEBSITE',
      status: 'NEW',
      birthDate: birthdateFormatted,
    });

    if ((role || 'STUDENT') === 'STUDENT') {
      const Student = require('../models/Student');
      const formattedParentPhone = parentPhone ? cleanPhone(parentPhone) : null;
      await Student.create({
        user: user._id,
        lead: newLead._id,
        parentPhone: formattedParentPhone,
        status: 'ACTIVE',
        source: source || 'WEBSITE',
      });
    }

    // Token yaratish
    const token = generateToken(user._id);

    // Parolni javobdan olib tashlaymiz
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: "Ro'yxatdan o'tishda xatolik yuz berdi",
      error: error.message,
    });
  }
};


/**
 * Login user
 * POST /api/v1/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { phone, username, password, app_type } = req.body;

    // Validation checks
    if ((!phone && !username) || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Iltimos, telefon raqami (yoki username) va parolni kiriting',
      });
    }

    if (!app_type || !['CRM', 'PUBLIC'].includes(app_type)) {
      return res.status(400).json({
        status: 'error',
        message: "Iltimos, to'g'ri ilova turini (app_type: CRM yoki PUBLIC) ko'rsating",
      });
    }

    let user;

    if (username) {
      // Finance Admin: username orqali login
      user = await User.findOne({ username: username.toLowerCase().trim() }).select('+password');
    } else {
      // Oddiy foydalanuvchi: telefon orqali login
      const formattedPhone = cleanPhone(phone);
      user = await User.findOne({ phone: formattedPhone }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: "Login yoki parol noto'g'ri",
      });
    }

    // Check if status is ACTIVE
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        status: 'error',
        message: `Hisobingiz bloklangan yoki faol emas. Holat: ${user.status}`,
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: "Login yoki parol noto'g'ri",
      });
    }

    // Verify role limitations based on app_type
    const staffRoles = ['SUPER_ADMIN', 'MANAGER', 'TEACHER', 'FINANCE_ADMIN'];
    const clientRoles = ['STUDENT', 'PARENT'];

    if (app_type === 'CRM') {
      if (!staffRoles.includes(user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Ruxsat berilmagan portal (Faqat xodimlar uchun)',
        });
      }
    } else if (app_type === 'PUBLIC') {
      if (!clientRoles.includes(user.role)) {
        return res.status(403).json({
          status: 'error',
          message: "Ruxsat berilmagan portal (Faqat o'quvchilar va ota-onalar uchun)",
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
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
 * Update user password
 * PATCH /api/v1/auth/update-password
 * Protected route - user can only update their own password
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation checks
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Iltimos, hozirgi parol va yangi parolni kiriting',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Yangi parollar mos kelmaydi',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak',
      });
    }

    // Get current user from request (set by protect middleware)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Foydalanuvchi topilmadi',
      });
    }

    // Verify current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Hozirgi parol noto\'g\'ri',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save(); // Will be hashed by pre-save hook

    // Generate new token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      message: 'Parol muvaffaqiyatli o\'zgartirildi',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Parolni o\'zgartirishda xatolik yuz berdi',
      error: error.message,
    });
  }
};

