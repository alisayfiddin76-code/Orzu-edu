const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      index: true,
      trim: true,
      match: [/^\+998\d{9}$/, 'Please use a valid Uzbek phone number (+998XXXXXXXXX)'],
      // Telefon raqamini +998XXXXXXXXX formatida saqlash
      set: function (val) {
        if (!val) return val;
        // Bo'sh joylarni va tire va qavslarni olib tashlaymiz
        let clean = String(val).replace(/[\s\-\(\)]/g, '');
        // Agar +998 bilan boshlanmasa qo'shamiz
        if (!clean.startsWith('+998')) {
          clean = clean.startsWith('998') ? '+' + clean : '+998' + clean;
        }
        return clean;
      }
    },
    course: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['WEBSITE', 'TELEGRAM', 'INSTAGRAM', 'FACEBOOK', 'REFERRAL', 'FRIENDS', 'ADVERTISEMENT'],
      default: 'WEBSITE',
      index: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'CALLED', 'INTERESTED', 'DEMO', 'REGISTERED', 'REJECTED'],
      default: 'NEW',
      index: true,
    },
    note: {
      type: String,
      trim: true,
    },
    // Tug'ilgan sana — login parol sifatida ishlatiladi (YYYYMMDD formatida saqlanadi)
    birthDate: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lead', LeadSchema);

