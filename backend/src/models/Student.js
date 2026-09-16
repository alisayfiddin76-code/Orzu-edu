const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    school: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    parentPhone: {
      type: String,
      required: [true, 'Parent phone is required'],
      trim: true,
      index: true,
      // Store in +998XXXXXXXXX format, use same cleanPhone helper if needed
    },
    source: {
      type: String,
      enum: ['WEBSITE', 'TELEGRAM', 'INSTAGRAM', 'FACEBOOK', 'REFERRAL', 'FRIENDS', 'ADVERTISEMENT'],
      default: 'WEBSITE',
      index: true,
    },
    joined_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'LEFT', 'GRADUATED'],
      default: 'ACTIVE',
    },
    enrollments: [
      {
        group: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Group',
        },
        joined_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // B-variant tanlaganda har bir guruh uchun billing cycle skip
    // { group: ObjectId, skip_until: "2026-10" }
    billing_overrides: [
      {
        group: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Group',
        },
        // Shu oydan boshlab (shu oy ham ichida) invoice yaratilmaydi
        skip_until: {
          type: String, // "YYYY-MM"
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', StudentSchema);
