const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE'],
      required: [true, 'Status is required'],
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same student in the same group on the same day
AttendanceSchema.index({ student: 1, group: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
