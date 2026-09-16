const mongoose = require('mongoose');

/**
 * Achievement Model
 * O'quvchilar natijalari va sertifikatlari
 */
const AchievementSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, "O'quvchi ismi talab qilinadi"],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Kurs nomi talab qilinadi'],
      trim: true,
    },
    certificateImage: {
      type: String,
      default: null, // Upload path: /uploads/achievements/filename.jpg
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    order: {
      type: Number,
      default: 0, // Tartib (saralash uchun)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Achievement', AchievementSchema);
