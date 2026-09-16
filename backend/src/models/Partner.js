const mongoose = require('mongoose');

/**
 * Partner Model
 * Hamkor tashkilotlar va kompaniyalar
 */
const PartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hamkor nomi talab qilinadi'],
      trim: true,
    },
    logo: {
      type: String,
      default: null, // Upload path: /uploads/partners/filename.png
    },
    website: {
      type: String,
      default: null,
      trim: true,
    },
    order: {
      type: Number,
      default: 0, // Ko'rsatish tartibi
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Partner', PartnerSchema);
