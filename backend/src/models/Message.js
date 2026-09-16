const mongoose = require('mongoose');

/**
 * Message Model
 * Public saytdagi "Aloqa" formasidan yuborilgan xabarlar
 */
const MessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ism talab qilinadi'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Telefon raqami talab qilinadi'],
      trim: true,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      default: 'Umumiy savol',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Xabar matni talab qilinadi'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false, // Admin o'qiganida true bo'ladi
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', MessageSchema);
