const express = require('express');
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Barcha finance routelar protect qilingan
router.use(authMiddleware.protect);

// ---- Finance Admin huquqlari
const financeRoles = ['SUPER_ADMIN', 'FINANCE_ADMIN'];
const adminOnly = ['SUPER_ADMIN'];

// ============================================================
// FINANCE ADMIN MANAGEMENT (SUPER_ADMIN only)
// ============================================================
router.post('/admin',
  authMiddleware.restrictTo(...adminOnly),
  financeController.createFinanceAdmin
);
router.get('/admin',
  authMiddleware.restrictTo(...adminOnly),
  financeController.getFinanceAdmin
);
router.patch('/admin/:id/password',
  authMiddleware.restrictTo(...adminOnly),
  financeController.changeFinanceAdminPassword
);
router.delete('/admin/:id',
  authMiddleware.restrictTo(...adminOnly),
  financeController.deleteFinanceAdmin
);

// ============================================================
// DASHBOARD
// ============================================================
router.get('/dashboard',
  authMiddleware.restrictTo(...financeRoles),
  financeController.getDashboard
);

// ============================================================
// INVOICES / PAYMENTS
// ============================================================
router.post('/invoices',
  authMiddleware.restrictTo(...financeRoles),
  financeController.receivePayment
);
// Ko'p oylik / ko'p guruhli to'lov (Revenue Split)
router.post('/invoices/multi',
  authMiddleware.restrictTo(...financeRoles),
  financeController.receiveMultiPayment
);
router.get('/invoices',
  authMiddleware.restrictTo(...financeRoles, 'STUDENT'),
  financeController.getInvoices
);
router.get('/invoices/debtors',
  authMiddleware.restrictTo(...financeRoles, 'TEACHER'),
  financeController.getDebtors
);
router.get('/invoices/search',
  authMiddleware.restrictTo(...financeRoles),
  financeController.searchStudentInvoice
);
router.get('/invoices/notifications',
  authMiddleware.restrictTo(...financeRoles),
  financeController.getInvoiceNotifications
);
router.patch('/invoices/:id/cancel',
  authMiddleware.restrictTo(...financeRoles),
  financeController.cancelInvoice
);
// Qo'lda oylik invoice yaratish (SUPER_ADMIN va FINANCE_ADMIN ham ishlatishi mumkin)
router.post('/invoices/generate',
  authMiddleware.restrictTo(...financeRoles),
  financeController.manualGenerateInvoices
);
// Guruhdan chiqarilgan o'quvchilarning orphan invoicelarini tozalash
router.post('/invoices/cleanup',
  authMiddleware.restrictTo(...adminOnly),
  financeController.cleanupOrphanInvoices
);
// Mavjud o'quvchilarni 1-sanaga moslashtirish
router.post('/invoices/align-to-first',
  authMiddleware.restrictTo(...adminOnly),
  financeController.alignToFirstOfMonth
);

// ============================================================
// PRORATED BILLING
// ============================================================
// Prorated summa hisoblash (A va B variant preview)
router.get('/prorated-preview',
  authMiddleware.restrictTo(...financeRoles),
  financeController.calculateProratedPreview
);
// Billing cycle sinxronlash (eski yoki yangi o'quvchilar uchun A/B variant)
router.post('/invoices/sync-billing',
  authMiddleware.restrictTo(...financeRoles),
  financeController.syncStudentBillingCycle
);

// ============================================================
// EXPENSES
// ============================================================
router.post('/expenses',
  authMiddleware.restrictTo(...financeRoles),
  financeController.addExpense
);
router.get('/expenses',
  authMiddleware.restrictTo(...financeRoles),
  financeController.getExpenses
);
router.delete('/expenses/:id',
  authMiddleware.restrictTo(...financeRoles),
  financeController.deleteExpense
);

// ============================================================
// DISCOUNTS (Chegirmalar)
// ============================================================
const discountController = require('../controllers/discountController');

router.get('/discounts',
  authMiddleware.restrictTo(...financeRoles),
  discountController.getAll
);
router.get('/discounts/student/:studentId/calculate',
  authMiddleware.restrictTo(...financeRoles),
  discountController.calculateForStudent
);
router.post('/discounts',
  authMiddleware.restrictTo(...financeRoles),
  discountController.create
);
router.patch('/discounts/:id',
  authMiddleware.restrictTo(...financeRoles),
  discountController.update
);
router.delete('/discounts/:id',
  authMiddleware.restrictTo(...financeRoles),
  discountController.remove
);

// ============================================================
// TEACHER FINANCES
// ============================================================
router.get('/teachers',
  authMiddleware.restrictTo(...financeRoles),
  financeController.getAllTeachersSummary
);
router.get('/teachers/:id/summary',
  authMiddleware.restrictTo(...financeRoles, 'TEACHER'),
  financeController.getTeacherFinanceSummary
);

// ============================================================
// ADVANCES
// ============================================================
router.post('/advances',
  authMiddleware.restrictTo(...financeRoles),
  financeController.giveAdvance
);
router.get('/advances',
  authMiddleware.restrictTo(...financeRoles),
  financeController.getAdvances
);

// ============================================================
// SALARY
// ============================================================
router.post('/salary/:teacherId',
  authMiddleware.restrictTo(...financeRoles),
  financeController.paySalary
);

// ============================================================
// REPORTS
// ============================================================
router.get('/report',
  authMiddleware.restrictTo(...financeRoles),
  financeController.getMonthlyReport
);

// ============================================================
// AUDIT LOG (Super Admin only)
// ============================================================
router.get('/audit-log',
  authMiddleware.restrictTo(...adminOnly),
  financeController.getAuditLog
);

module.exports = router;
