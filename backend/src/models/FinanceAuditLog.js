const mongoose = require('mongoose');

const FinanceAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      // Examples: PAYMENT_RECEIVED, INVOICE_CANCELLED, EXPENSE_ADDED, ADVANCE_GIVEN, SALARY_PAID
    },
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Flexible detail object — stores relevant IDs and amounts
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FinanceAuditLog', FinanceAuditLogSchema);
