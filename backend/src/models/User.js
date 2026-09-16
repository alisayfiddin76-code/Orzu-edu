const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    // Finance Admin uchun username (telefon o'rniga)
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple undefined values
      lowercase: true,
      trim: true,
      default: undefined,
    },
    phone: {
      type: String,
      required: false, // Finance Admin telefonsiz bo'lishi mumkin
      unique: true,
      sparse: true, // Allows multiple null values for phone
      index: true,
      trim: true,
      match: [/^\+998\d{9}$/, 'Please use a valid Uzbek phone number (+998XXXXXXXXX)'],
      // Telefon raqamini +998XXXXXXXXX formatida saqlash
      set: function (val) {
        if (!val) return val;
        let clean = String(val).replace(/[\s\-\(\)]/g, '');
        if (!clean.startsWith('+998')) {
          clean = clean.startsWith('998') ? '+' + clean : '+998' + clean;
        }
        return clean;
      }
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined values for email
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'MANAGER', 'TEACHER', 'FINANCE_ADMIN', 'STUDENT', 'PARENT'],
      required: [true, 'Role is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'BANNED'],
      default: 'ACTIVE',
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    birthDate: {
      type: String,
      default: null,
      index: true,
      // Format: YYYYMMDD — public login uchun "parol" vazifasini bajaradi
    },
    education: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    // ---- YANIGI TEACHER FIELDLARI ----
    subject: {
      type: String,
      default: null,
    },
    scoreType: {
      type: String,
      default: null,
    },
    score: {
      type: String,
      default: null,
    },
    experience: {
      type: Number,
      default: null,
    },
    studentsCount: {
      type: String,
      default: null,
    },
    telegram: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Hash password before saving to database
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Helper method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
