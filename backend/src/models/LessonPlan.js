const mongoose = require('mongoose');

const LessonPlanSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group reference is required'],
      index: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
    },
    materials: [
      {
        type: String, // URLs or paths to files (PDF/word/jpg)
      },
    ],
    homeworkDetails: {
      type: String,
      required: [true, 'Homework details are required'],
      trim: true,
    },
    homeworkDeadline: {
      type: Date,
      required: [true, 'Homework deadline is required'],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LessonPlan', LessonPlanSchema);
