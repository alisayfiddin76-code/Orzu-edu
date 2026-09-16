const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema(
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
    value: {
      type: Number,
      required: [true, 'Grade value is required'],
      min: [0, 'Grade cannot be negative'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    gradeType: {
      type: String,
      enum: ['CLASSWORK', 'HOMEWORK', 'MIDTERM', 'FINAL'],
      default: 'CLASSWORK'
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grade', GradeSchema);
