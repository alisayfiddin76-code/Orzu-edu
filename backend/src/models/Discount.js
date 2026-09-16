const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group reference is required'],
      index: true,
    },
    // Guruhning asl narxi (yaratish paytida Group.price dan olinadi)
    original_price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Qo'lda belgilangan chegirma summasi (so'mda)
    discount_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Haqiqiy to'lov = original_price - discount_amount
    final_price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Chegirma sababi (ixtiyoriy)
    reason: {
      type: String,
      trim: true,
      default: null,
    },
    // Kim belgilagan (Finance Admin yoki Super Admin)
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Bir o'quvchi bir guruhda faqat bitta qo'l chegirmasi bo'lishi mumkin
DiscountSchema.index({ student: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Discount', DiscountSchema);
