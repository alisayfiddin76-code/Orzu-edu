const mongoose = require('mongoose');

const studentOfMonthSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "O'quvchi ismi kiritilishi shart"],
    trim: true
  },
  subject: {
    type: String,
    required: [true, "Fan yo'nalishi kiritilishi shart"],
    trim: true
  },
  reason: {
    type: String,
    required: [true, "Nima uchun tanlanganligi haqida izoh kiritilishi shart"]
  },
  image: {
    type: String, // Rasmning URL yoki fayl yo'li
    default: null
  },
  isActive: {
    type: Boolean,
    default: false // Faqat bittasi true bo'ladi va o'sha asosiy sahifada chiqadi
  }
}, { timestamps: true });

// Faqat bitta isActive=true bo'lishini ta'minlash pre-save hook orqali ham qilinishi mumkin,
// lekin uni controllerda boshqarish qulayroq bo'ladi.

module.exports = mongoose.model('StudentOfMonth', studentOfMonthSchema);
