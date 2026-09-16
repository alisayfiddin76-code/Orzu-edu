const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        'IJARA',
        'GAZ',
        'SVET',
        'INTERNET',
        'SUV',
        'SOLIQ',
        'KITOB',
        'PRINTER',
        'REKLAMA',
        'BONUS',
        'JIHOZLAR',
        'TOZALASH',
        'MAOSH',
        'BOSHQA',
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
