const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Exam date is required'],
      index: true,
    },
    results: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: [true, 'Student reference is required'],
        },
        score: {
          type: Number,
          required: [true, 'Score is required'],
          min: [0, 'Score cannot be negative'],
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', ExamSchema);
