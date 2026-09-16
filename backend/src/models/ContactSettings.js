const mongoose = require('mongoose');

/**
 * ContactSettings Model
 * Saytning aloqa ma'lumotlari — faqat bitta yagona yozuv (singleton)
 */
const ContactSettingsSchema = new mongoose.Schema(
  {
    phone_1: {
      type: String,
      required: [true, 'Asosiy telefon raqami talab qilinadi'],
      trim: true,
    },
    phone_2: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    main_address: {
      type: String,
      required: [true, 'Asosiy manzil talab qilinadi'],
      trim: true,
    },
    branch_address: {
      type: String,
      trim: true,
      default: null,
    },
    instagram: {
      type: String,
      trim: true,
      default: null,
    },
    telegram: {
      type: String,
      trim: true,
      default: null,
    },
    youtube: {
      type: String,
      trim: true,
      default: null,
    },
    branches: {
      type: [String],
      default: [],
    },
    // Ish vaqtlari
    weekdays_label: {
      type: String,
      trim: true,
      default: 'Dushanba - Shanba',
    },
    weekdays_hours: {
      type: String,
      trim: true,
      default: '09:00 - 20:00',
    },
    weekend_label: {
      type: String,
      trim: true,
      default: 'Yakshanba',
    },
    weekend_hours: {
      type: String,
      trim: true,
      default: 'Dam olish kuni',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactSettings', ContactSettingsSchema);
