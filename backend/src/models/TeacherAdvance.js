const mongoose = require('mongoose');

const TeacherAdvanceSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Advance amount cannot be negative'],
    },
    // Format: "2025-07"
    month: {
      type: String,
      required: true,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      default: null,
    },
    given_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    given_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TeacherAdvance', TeacherAdvanceSchema);
