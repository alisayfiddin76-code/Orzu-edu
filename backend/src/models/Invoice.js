const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    // Format: "2025-07" — oy va yil
    month: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Aslida to'lanadigan summa = amount - discount
    final_amount: {
      type: Number,
      default: function () {
        return this.amount - (this.discount || 0);
      },
    },
    status: {
      type: String,
      enum: ['PAID', 'UNPAID', 'CANCELLED', 'REFUND'],
      default: 'UNPAID',
      index: true,
    },
    // Oyning 1-kuni (to'lov muddati)
    due_date: {
      type: Date,
      required: true,
    },
    paid_at: {
      type: Date,
      default: null,
    },
    payment_method: {
      type: String,
      enum: ['CASH', 'CARD', 'CLICK', 'BANK'],
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: null,
    },
    // Invoice turi: to'liq oylik yoki prorated (kunlik hisobda)
    invoice_type: {
      type: String,
      enum: ['FULL', 'PRORATED'],
      default: 'FULL',
    },
    // B-variant tanlanganda: qaysi oygacha billing cycle skip qilinsin
    // Format: "YYYY-MM" — masalan "2026-10"
    billing_cycle_skipped_until: {
      type: String,
      default: null,
    },
    // Kim to'lovni kiritgan (Finance Admin yoki Super Admin)
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Bir student bir guruhda bir oyda faqat bitta invoice bo'lsin
InvoiceSchema.index({ student: 1, group: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
