const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes by verifying JWT tokens
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Read token from Authorization header (Bearer <token>)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Siz tizimga kirmagansiz! Iltimos, kirish orqali token oling.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Noto\'g\'ri yoki muddati o\'tgan token. Iltimos, qayta kiring.',
      });
    }

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'Ushbu tokenga tegishli foydalanuvchi tizimda mavjud emas.',
      });
    }

    // Check if user status is active
    if (currentUser.status !== 'ACTIVE') {
      return res.status(403).json({
        status: 'error',
        message: 'Foydalanuvchi hisobi faol emas yoki bloklangan.',
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Autentifikatsiya tekshiruvida xatolik',
      error: error.message,
    });
  }
};

/**
 * Restrict route access to specific roles
 * @param {...string} roles - Allowed user roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user has been set by the protect middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Ushbu amalni bajarish uchun sizda ruxsat yo\'q.',
      });
    }
    next();
  };
};
