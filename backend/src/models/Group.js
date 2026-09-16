const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referencing User (with role TEACHER)
      required: [true, 'Teacher reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Group title is required'],
      trim: true,
    },
    room: {
      type: String,
      trim: true,
    },
    start_time: {
      type: String, // Example: "14:00"
      trim: true,
    },
    end_time: {
      type: String, // Example: "16:00"
      trim: true,
    },
    days: {
      type: String,
      enum: ['ODD', 'EVEN', 'EVERYDAY', 'CUSTOM'],
      required: [true, 'Days option is required'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    teacher_share_percent: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED'],
      default: 'ACTIVE'
    },
    finalResults: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        classworkScore: Number, // Percentage 0-100
        homeworkScore: Number,  // Percentage 0-100
        midtermScore: Number,   // Percentage 0-100
        finalScore: Number,     // Percentage 0-100
        totalPercentage: Number, // (cw+hw) * 0.4 + mid * 0.3 + final * 0.3
        rank: Number // Overall rank in the group
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Group', GroupSchema);
