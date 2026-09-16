const mongoose = require('mongoose');

const HomeworkSubmissionSchema = new mongoose.Schema(
  {
    lessonPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LessonPlan',
      required: [true, 'LessonPlan reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    submittedFiles: [
      {
        type: String, // URLs or paths to uploaded homework files
      },
    ],
    studentNote: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'GRADED', 'LATE_SUBMISSION'],
      default: 'PENDING',
      index: true,
    },
    grade: {
      type: Number,
      min: 0,
      max: 5,
    },

    feedback: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate homework submissions by the same student for the same lesson plan
HomeworkSubmissionSchema.index({ lessonPlan: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('HomeworkSubmission', HomeworkSubmissionSchema);
