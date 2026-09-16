const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');
const Student = require('../models/Student');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const TeacherAdvance = require('../models/TeacherAdvance');
const FinanceAuditLog = require('../models/FinanceAuditLog');
const Course = require('../models/Course');
const Discount = require('../models/Discount');
const AppError = require('../utils/appError');

// Helper: joriy oy strini qaytaradi "YYYY-MM" formatda
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Helper: audit log yozish
const logAction = async (action, userId, details) => {
  try {
    await FinanceAuditLog.create({ action, performed_by: userId, details });
  } catch (e) {
    console.error('Audit log yozishda xatolik:', e.message);
  }
};

// ============================================================
// FINANCE ADMIN MANAGEMENT
// ============================================================

/**
 * Finance Admin yaratish — faqat bitta bo'lishi mumkin
 * POST /api/v1/finance/admin
 * SUPER_ADMIN only
 */
exports.createFinanceAdmin = async (req, res, next) => {
  try {
    // Faqat bitta Finance Admin bo'lishi mumkin
    const existing = await User.findOne({ role: 'FINANCE_ADMIN' });
    if (existing) {
      return next(new AppError("Finance Admin allaqachon mavjud. Avval mavjudini o'chiring.", 400));
    }

    const { firstname, lastname, username, password } = req.body;

    if (!firstname || !lastname || !username || !password) {
      return next(new AppError("firstname, lastname, username va password majburiy", 400));
    }

    if (password.length < 6) {
      return next(new AppError("Parol kamida 6 ta belgidan iborat bo'lishi kerak", 400));
    }

    // Username mavjudligini tekshirish
    const usernameExists = await User.findOne({ username: username.toLowerCase().trim() });
    if (usernameExists) {
      return next(new AppError("Bu username allaqachon ishlatilgan", 400));
    }

    const financeAdmin = await User.create({
      firstname,
      lastname,
      username: username.toLowerCase().trim(),
      password,
      role: 'FINANCE_ADMIN',
      status: 'ACTIVE',
    });

    financeAdmin.password = undefined;

    await logAction('FINANCE_ADMIN_CREATED', req.user._id, {
      finance_admin_id: financeAdmin._id,
      username: financeAdmin.username,
    });

    res.status(201).json({
      status: 'success',
      message: 'Finance Admin muvaffaqiyatli yaratildi',
      data: { financeAdmin },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Finance Admin ma'lumotlarini olish
 * GET /api/v1/finance/admin
 * SUPER_ADMIN only
 */
exports.getFinanceAdmin = async (req, res, next) => {
  try {
    const financeAdmin = await User.findOne({ role: 'FINANCE_ADMIN' }).select('-password');
    res.status(200).json({
      status: 'success',
      data: { financeAdmin },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Finance Admin parolini o'zgartirish
 * PATCH /api/v1/finance/admin/:id/password
 * SUPER_ADMIN only
 */
exports.changeFinanceAdminPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return next(new AppError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak", 400));
    }

    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'FINANCE_ADMIN') {
      return next(new AppError("Finance Admin topilmadi", 404));
    }

    admin.password = newPassword;
    await admin.save();

    await logAction('FINANCE_ADMIN_PASSWORD_CHANGED', req.user._id, {
      finance_admin_id: admin._id,
    });

    res.status(200).json({
      status: 'success',
      message: "Parol muvaffaqiyatli o'zgartirildi",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Finance Admin o'chirish
 * DELETE /api/v1/finance/admin/:id
 * SUPER_ADMIN only
 */
exports.deleteFinanceAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'FINANCE_ADMIN') {
      return next(new AppError("Finance Admin topilmadi", 404));
    }

    await User.findByIdAndDelete(req.params.id);

    await logAction('FINANCE_ADMIN_DELETED', req.user._id, {
      finance_admin_id: req.params.id,
    });

    res.status(200).json({
      status: 'success',
      message: "Finance Admin o'chirildi",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DASHBOARD STATISTICS
// ============================================================

/**
 * Finance Dashboard — real vaqt statistikalar
 * GET /api/v1/finance/dashboard
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const targetMonth = req.query.month || getCurrentMonth();
    const [year, mon] = targetMonth.split('-').map(Number);
    const monthStart = new Date(year, mon - 1, 1);
    const monthEnd = new Date(year, mon, 1);

    // Bugungi to'lovlar (PAID, bugun to'langan)
    const todayPaidInvoices = await Invoice.find({
      status: 'PAID',
      paid_at: { $gte: todayStart, $lt: todayEnd },
    });
    const todayIncome = todayPaidInvoices.reduce((sum, inv) => sum + (inv.final_amount || inv.amount), 0);

    // Bugungi chiqimlar
    const todayExpenses = await Expense.find({
      date: { $gte: todayStart, $lt: todayEnd },
    });
    const todayExpenseTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Shu oy tushumi
    const monthPaidInvoices = await Invoice.find({
      status: 'PAID',
      month: targetMonth,
    });
    const monthIncome = monthPaidInvoices.reduce((sum, inv) => sum + (inv.final_amount || inv.amount), 0);

    // Shu oy chiqimlari
    const monthExpenses = await Expense.find({
      date: { $gte: monthStart, $lt: monthEnd },
    });
    const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Qarzdorlar (UNPAID, joriy oy)
    const unpaidInvoices = await Invoice.find({
      status: 'UNPAID',
      month: targetMonth,
    });
    const debtors = unpaidInvoices.length;
    const totalDebt = unpaidInvoices.reduce((sum, inv) => sum + (inv.final_amount || inv.amount), 0);

    // Bugun to'laganlar soni
    const todayPaidCount = todayPaidInvoices.length;

    // To'lov usuli bo'yicha kassa (bugun)
    const cashbox = {
      CASH: 0, CARD: 0, CLICK: 0, BANK: 0,
    };
    todayPaidInvoices.forEach(inv => {
      if (inv.payment_method && cashbox[inv.payment_method] !== undefined) {
        cashbox[inv.payment_method] += inv.final_amount || inv.amount;
      }
    });

    // O'qituvchilarga to'lanishi kerak summa (joriy oy)
    const teachers = await User.find({ role: 'TEACHER', status: 'ACTIVE' });
    let totalTeacherOwed = 0;

    for (const teacher of teachers) {
      const groups = await Group.find({ teacher: teacher._id });
      let teacherEarned = 0;
      for (const group of groups) {
        const paidInvoices = await Invoice.find({
          group: group._id,
          month: targetMonth,
          status: 'PAID',
        });
        const groupIncome = paidInvoices.reduce((sum, inv) => sum + (inv.final_amount || inv.amount), 0);
        const sharePercent = group.teacher_share_percent || 50;
        teacherEarned += (groupIncome * sharePercent) / 100;
      }

      const advances = await TeacherAdvance.find({ teacher: teacher._id, month: targetMonth });
      const totalAdvance = advances.reduce((sum, a) => sum + a.amount, 0);
      totalTeacherOwed += Math.max(0, teacherEarned - totalAdvance);
    }

    // Foyda
    const profit = monthIncome - monthExpenseTotal;

    res.status(200).json({
      status: 'success',
      data: {
        today: {
          income: todayIncome,
          expense: todayExpenseTotal,
          paid_count: todayPaidCount,
          cashbox,
        },
        month: {
          income: monthIncome,
          expense: monthExpenseTotal,
          profit,
          debtors_count: debtors,
          total_debt: totalDebt,
        },
        teachers_owed: totalTeacherOwed,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// INVOICE / PAYMENTS
// ============================================================

/**
 * To'lov qabul qilish (Invoice PAID qilish)
 * POST /api/v1/finance/invoices
 */
exports.receivePayment = async (req, res, next) => {
  try {
    const {
      student_id,
      group_id,
      month,
      amount,
      discount,
      payment_method,
      note,
    } = req.body;

    if (!student_id || !group_id || !payment_method) {
      return next(new AppError("student_id, group_id va payment_method majburiy", 400));
    }

    const targetMonth = month || getCurrentMonth();
    const [year, mon] = targetMonth.split('-').map(Number);
    const dueDate = new Date(year, mon - 1, 1);

    // Group narxini olish (agar amount berilmasa)
    const group = await Group.findById(group_id);
    if (!group) return next(new AppError("Guruh topilmadi", 404));

    const finalAmount = amount || group.price;
    const disc = discount || 0;

    // Invoice mavjudmi — yangilash yoki yangi yaratish
    let invoice = await Invoice.findOne({
      student: student_id,
      group: group_id,
      month: targetMonth,
    });

    if (invoice) {
      // Mavjud invoiceni yangilash
      invoice.amount = finalAmount;
      invoice.discount = disc;
      invoice.final_amount = finalAmount - disc;
      invoice.status = 'PAID';
      invoice.paid_at = new Date();
      invoice.payment_method = payment_method;
      invoice.note = note || invoice.note;
      invoice.created_by = req.user._id;
      await invoice.save();
    } else {
      // Yangi invoice yaratish
      invoice = await Invoice.create({
        student: student_id,
        group: group_id,
        month: targetMonth,
        amount: finalAmount,
        discount: disc,
        final_amount: finalAmount - disc,
        status: 'PAID',
        due_date: dueDate,
        paid_at: new Date(),
        payment_method,
        note: note || null,
        created_by: req.user._id,
      });
    }

    await logAction('PAYMENT_RECEIVED', req.user._id, {
      invoice_id: invoice._id,
      student_id,
      group_id,
      amount: invoice.final_amount,
      payment_method,
      month: targetMonth,
    });

    await invoice.populate([
      { path: 'student', populate: { path: 'user', select: 'firstname lastname phone' } },
      { path: 'group', select: 'title' },
      { path: 'created_by', select: 'firstname lastname' },
    ]);

    res.status(200).json({
      status: 'success',
      message: "To'lov muvaffaqiyatli qabul qilindi",
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ko'p oylik / ko'p guruhli to'lovni qabul qilish (Revenue Split uchun)
 * POST /api/v1/finance/invoices/multi
 *
 * Request Body:
 * {
 *   student_id: "...",
 *   payment_method: "CASH",
 *   note: "optional",
 *   payments: [
 *     { group_id: "...", months: ["2026-08", "2026-09"], amounts: [17000, 260000] },
 *     { group_id: "...", months: ["2026-08"], amounts: [8500] }
 *   ]
 * }
 *
 * amounts massivi months massivi bilan bir xil tartibda bo'lishi kerak.
 * Agar amounts berilmasa, guruh narxidan foydalaniladi.
 */
exports.receiveMultiPayment = async (req, res, next) => {
  try {
    const { student_id, payment_method, note, payments } = req.body;

    if (!student_id || !payment_method || !payments || !Array.isArray(payments) || payments.length === 0) {
      return next(new AppError("student_id, payment_method va payments (massiv) majburiy", 400));
    }

    const createdInvoices = [];
    const paidAt = new Date();

    for (const entry of payments) {
      const { group_id, months, amounts } = entry;
      if (!group_id || !months || !Array.isArray(months)) continue;

      const group = await Group.findById(group_id);
      if (!group) continue;

      for (let i = 0; i < months.length; i++) {
        const targetMonth = months[i];
        const [yr, mn] = targetMonth.split('-').map(Number);
        const dueDate = new Date(yr, mn - 1, 1);

        // amounts[i] berilgan bo'lsa ishlatiladi, aks holda guruh narxi
        const entryAmount = (amounts && amounts[i] != null) ? amounts[i] : group.price;
        const finalAmount = entryAmount || 0;

        // Mavjud invoice bor-yo'qligini tekshiramiz
        let invoice = await Invoice.findOne({
          student: student_id,
          group: group_id,
          month: targetMonth,
        });

        if (invoice) {
          invoice.amount = finalAmount;
          invoice.discount = 0;
          invoice.final_amount = finalAmount;
          invoice.status = 'PAID';
          invoice.paid_at = paidAt;
          invoice.payment_method = payment_method;
          invoice.note = note || invoice.note;
          invoice.created_by = req.user._id;
          await invoice.save();
        } else {
          invoice = await Invoice.create({
            student: student_id,
            group: group_id,
            month: targetMonth,
            amount: finalAmount,
            discount: 0,
            final_amount: finalAmount,
            status: 'PAID',
            due_date: dueDate,
            paid_at: paidAt,
            payment_method,
            note: note || null,
            created_by: req.user._id,
          });
        }
        createdInvoices.push(invoice);
      }
    }

    const totalPaid = createdInvoices.reduce((s, inv) => s + inv.final_amount, 0);

    await logAction('MULTI_PAYMENT_RECEIVED', req.user._id, {
      student_id,
      payment_method,
      invoices_count: createdInvoices.length,
      total_amount: totalPaid,
    });

    res.status(200).json({
      status: 'success',
      message: `${createdInvoices.length} ta to'lov qabul qilindi. Jami: ${totalPaid.toLocaleString()} so'm`,
      data: {
        invoices: createdInvoices,
        total_paid: totalPaid,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Barcha invoicelar ro'yxati
 * GET /api/v1/finance/invoices?month=2025-07&status=UNPAID&group=...
 */
exports.getInvoices = async (req, res, next) => {
  try {
    const { month, status, group, student } = req.query;
    const filter = {};

    if (month) filter.month = month;
    if (status) filter.status = status;
    if (group) filter.group = group;
    if (student) filter.student = student;

    if (req.user.role === 'STUDENT') {
      const StudentModel = require('../models/Student');
      const currentStudent = await StudentModel.findOne({ user: req.user._id });
      if (!currentStudent) {
        return next(new AppError("Talaba profili topilmadi", 404));
      }
      filter.student = currentStudent._id;
    }

    const invoices = await Invoice.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'firstname lastname phone' } })
      .populate('group', 'title price teacher')
      .populate('created_by', 'firstname lastname')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: { invoices },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Qarzdorlar ro'yxati
 * GET /api/v1/finance/invoices/debtors?month=2025-07
 *
 * Mantiq:
 * 1. Tanlangan oy uchun UNPAID invoicelar — aniq qarzdorlar
 * 2. Tanlangan oy uchun invoice UMUMAN YO'Q bo'lgan faol o'quvchilar — ham qarzdor hisoblanadi
 *    (cron job hali ishlamagan yoki invoice yaratilmagan bo'lsa ham ko'rinsin)
 */
exports.getDebtors = async (req, res, next) => {
  try {
    const month = req.query.month || getCurrentMonth();
    const today = new Date();
    const [yr, mn] = month.split('-').map(Number);
    const dueDate = new Date(yr, mn - 1, 1);

    // TEACHER uchun faqat o'z guruhlariga tegishli (data scoping)
    let teacherGroupIds = [];
    let groupQuery = { $or: [{ status: 'ACTIVE' }, { status: { $exists: false } }] };
    if (req.user.role === 'TEACHER') {
      const teacherGroups = await Group.find({ teacher: req.user._id }).select('_id');
      teacherGroupIds = teacherGroups.map(g => g._id);
      groupQuery = { ...groupQuery, _id: { $in: teacherGroupIds } };
    }

    // ---- 1. DB dagi UNPAID invoicelarni olamiz ----
    const unpaidInvoices = await Invoice.find({
      status: 'UNPAID',
      month,
      ...(req.user.role === 'TEACHER'
        ? { group: { $in: teacherGroupIds } }
        : {}),
    })
      .populate({
        path: 'student',
        select: 'user parentPhone enrollments',
        populate: { path: 'user', select: 'firstname lastname phone status' },
      })
      .populate({ path: 'group', populate: { path: 'teacher', select: 'firstname lastname' } });

    // ---- 2. Invoice UMUMAN YO'Q bo'lgan o'quvchilarni topamiz ----
    // Barcha faol guruhlar + o'quvchilari
    const activeGroups = await Group.find(groupQuery)
      .populate({
        path: 'students',
        select: 'user parentPhone enrollments status',
        populate: { path: 'user', select: 'firstname lastname phone status' },
      })
      .populate('teacher', 'firstname lastname');

    // Shu oy uchun invoice mavjud bo'lgan (PAID, UNPAID, CANCELLED) (student, group) juftliklari
    const existingInvoices = await Invoice.find({ month }).select('student group status');
    const existingSet = new Set(
      existingInvoices.map(inv => `${inv.student?.toString()}_${inv.group?.toString()}`)
    );

    // UNPAID invoice mavjud bo'lganlar uchun Set (takrorlanmasin)
    const unpaidSet = new Set(
      unpaidInvoices.map(inv => `${inv.student?._id?.toString()}_${inv.group?._id?.toString()}`)
    );

    // ---- Helper: o'quvchi uchun chegirma ma'lumotlarini olish ----
    const getDiscountInfo = async (studentId, groupId, groupPrice) => {
      // O'quvchi nechta faol guruhda ekanini aniqlaymiz
      const activeGroupCount = await Group.countDocuments({
        students: studentId,
        status: 'ACTIVE',
      });
      const autoDiscountPercent = activeGroupCount >= 2 ? 10 : 0;
      const autoDiscountAmount = Math.round((groupPrice * autoDiscountPercent) / 100);

      // Qo'lda chegirmani topamiz
      const manualDiscount = await Discount.findOne({
        student: studentId,
        group: groupId,
      });
      const manualDiscountAmount = manualDiscount ? manualDiscount.discount_amount : 0;
      const totalDiscount = autoDiscountAmount + manualDiscountAmount;
      const discountedPrice = Math.max(0, groupPrice - totalDiscount);

      return {
        auto_discount_percent: autoDiscountPercent,
        auto_discount_amount: autoDiscountAmount,
        manual_discount_amount: manualDiscountAmount,
        total_discount: totalDiscount,
        discounted_price: discountedPrice,
        has_discount: totalDiscount > 0,
        manual_discount_reason: manualDiscount ? manualDiscount.reason : null,
      };
    };

    // Invoice yo'q o'quvchilardan virtual UNPAID ob'ektlar yasaymiz
    const virtualDebtors = [];
    for (const group of activeGroups) {
      for (const student of group.students) {
        if (!student || !student.user) continue;
        if (student.user.firstname === 'N/A') continue;
        // Faqat ACTIVE o'quvchilar
        if (student.status && student.status !== 'ACTIVE') continue;

        const key = `${student._id.toString()}_${group._id.toString()}`;
        // Allaqachon UNPAID invoice bor — 1-qismda olingan, qayta qo'shmaymiz
        if (unpaidSet.has(key)) continue;
        // Shu oy uchun boshqa invoice mavjud (PAID / CANCELLED) — bu o'quvchi qarzdor emas
        if (existingSet.has(key)) continue;

        // billing_overrides tekshiruvi: skip_until bor bo'lsa o'tkazib yuboramiz
        const hasSkip = student.enrollments?.find(
          en => en.group?.toString() === group._id.toString() && en.skip_until && month <= en.skip_until
        );
        if (hasSkip) continue;

        // Chegirma hisoblaymiz
        const discountInfo = await getDiscountInfo(student._id, group._id, group.price || 0);

        // Virtual invoice ob'ekti (DB ga saqlanmaydi)
        virtualDebtors.push({
          _id: null,           // Hali invoice yo'q
          student,
          group,
          month,
          amount: group.price || 0,
          discount: discountInfo.total_discount,
          final_amount: discountInfo.discounted_price,
          discount_info: discountInfo,
          status: 'UNPAID',
          due_date: dueDate,
          paid_at: null,
          payment_method: null,
          days_overdue: Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))),
          is_virtual: true,   // Frontend uchun belgi: invoice hali yaratilmagan
        });
      }
    }

    // ---- 3. UNPAID invoicelarni map qilamiz (chegirma bilan) ----
    const realDebtorsRaw = unpaidInvoices.filter(inv => {
      if (!inv.student || !inv.student.user) return false;
      if (inv.student.user.firstname === 'N/A') return false;
      return true;
    });

    const realDebtors = [];
    for (const inv of realDebtorsRaw) {
      const due = new Date(inv.due_date);
      const diffDays = Math.floor((today - due) / (1000 * 60 * 60 * 24));
      const groupPrice = inv.group?.price || inv.amount || 0;

      // Invoice da allaqachon discount saqlangan bo'lishi mumkin,
      // lekin eng dolzarb chegirma hisobini qayta hisoblaymiz
      const discountInfo = await getDiscountInfo(
        inv.student._id,
        inv.group._id,
        groupPrice
      );

      // Invoice final_amount ni chegirmaga mos yangilab qo'yamiz (agar mos kelmasa)
      const correctFinalAmount = discountInfo.discounted_price;

      realDebtors.push({
        ...inv.toObject(),
        amount: groupPrice,
        discount: discountInfo.total_discount,
        final_amount: correctFinalAmount,
        discount_info: discountInfo,
        days_overdue: diffDays > 0 ? diffDays : 0,
        is_virtual: false,
      });
    }

    // ---- 4. Ikkalasini birlashtirish ----
    const result = [...realDebtors, ...virtualDebtors];

    res.status(200).json({
      status: 'success',
      results: result.length,
      data: { debtors: result },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bildirishnomalar uchun to'lovi kelgan yoki kechikkanlar soni
 * GET /api/v1/finance/invoices/notifications
 */
exports.getInvoiceNotifications = async (req, res, next) => {
  try {
    const today = new Date();
    // To'lanmagan va muddati bugun yoki undan oldin bo'lganlar
    const count = await Invoice.countDocuments({
      status: 'UNPAID',
      due_date: { $lte: today }
    });

    res.status(200).json({
      status: 'success',
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Invoice bekor qilish
 * PATCH /api/v1/finance/invoices/:id/cancel
 */
exports.cancelInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return next(new AppError("Invoice topilmadi", 404));

    invoice.status = 'CANCELLED';
    await invoice.save();

    await logAction('INVOICE_CANCELLED', req.user._id, {
      invoice_id: invoice._id,
    });

    res.status(200).json({
      status: 'success',
      message: "Invoice bekor qilindi",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * O'quvchi uchun invoice qidirish (qidiruv sahifasi uchun)
 * GET /api/v1/finance/invoices/search?phone=998901234567&month=2025-07
 */
exports.searchStudentInvoice = async (req, res, next) => {
  try {
    const { phone, student_id, month } = req.query;
    const targetMonth = month || getCurrentMonth();

    let studentDoc;
    if (student_id) {
      studentDoc = await Student.findById(student_id).populate('user');
    } else if (phone) {
      const user = await User.findOne({ phone: { $regex: phone.replace(/\D/g, ''), $options: 'i' } });
      if (!user) return next(new AppError("Foydalanuvchi topilmadi", 404));
      studentDoc = await Student.findOne({ user: user._id }).populate('user');
    }

    if (!studentDoc) return next(new AppError("O'quvchi topilmadi", 404));

    // O'quvchining guruhlari va joriy oy invoicelari
    const groups = await Group.find({ students: studentDoc._id })
      .populate('course', 'title')
      .populate('teacher', 'firstname lastname');

    // O'quvchining barcha faol guruhlarini sanab, avto chegirma foizini aniqlash
    const activeGroupCount = await Group.countDocuments({
      students: studentDoc._id,
      status: 'ACTIVE',
    });
    const autoDiscountPercent = activeGroupCount >= 2 ? 10 : 0;

    const invoicesData = [];
    for (const group of groups) {
      const invoice = await Invoice.findOne({
        student: studentDoc._id,
        group: group._id,
        month: targetMonth,
      });

      // Qo'lda belgilangan chegirmani topish
      const manualDiscount = await Discount.findOne({
        student: studentDoc._id,
        group: group._id,
      });

      // Avto chegirma summasi
      const autoDiscountAmount = Math.round((group.price * autoDiscountPercent) / 100);
      // Qo'lda chegirma summasi
      const manualDiscountAmount = manualDiscount ? manualDiscount.discount_amount : 0;
      // Jami chegirma
      const totalDiscount = autoDiscountAmount + manualDiscountAmount;
      // Chegirmali narx
      const discountedPrice = Math.max(0, group.price - totalDiscount);

      invoicesData.push({
        group,
        invoice: invoice || null,
        amount: invoice ? invoice.amount : group.price,
        discount_info: {
          auto_discount_percent: autoDiscountPercent,
          auto_discount_amount: autoDiscountAmount,
          manual_discount_amount: manualDiscountAmount,
          total_discount: totalDiscount,
          discounted_price: discountedPrice,
          has_discount: totalDiscount > 0,
          manual_discount_reason: manualDiscount ? manualDiscount.reason : null,
        },
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        student: studentDoc,
        month: targetMonth,
        invoices: invoicesData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPENSES
// ============================================================

/**
 * Chiqim qo'shish
 * POST /api/v1/finance/expenses
 */
exports.addExpense = async (req, res, next) => {
  try {
    const { category, amount, date, note } = req.body;

    if (!category || !amount) {
      return next(new AppError("category va amount majburiy", 400));
    }

    const expense = await Expense.create({
      category,
      amount,
      date: date ? new Date(date) : new Date(),
      note: note || null,
      created_by: req.user._id,
    });

    await logAction('EXPENSE_ADDED', req.user._id, {
      expense_id: expense._id,
      category,
      amount,
    });

    res.status(201).json({
      status: 'success',
      message: "Chiqim muvaffaqiyatli qo'shildi",
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Chiqimlar ro'yxati
 * GET /api/v1/finance/expenses?month=2025-07&category=IJARA
 */
exports.getExpenses = async (req, res, next) => {
  try {
    const { month, category } = req.query;
    const filter = {};

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      filter.date = {
        $gte: new Date(year, mon - 1, 1),
        $lt: new Date(year, mon, 1),
      };
    }
    if (category) filter.category = category;

    const expenses = await Expense.find(filter)
      .populate('created_by', 'firstname lastname')
      .sort({ date: -1 });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({
      status: 'success',
      results: expenses.length,
      data: { expenses, total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Chiqim o'chirish
 * DELETE /api/v1/finance/expenses/:id
 */
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return next(new AppError("Chiqim topilmadi", 404));

    await Expense.findByIdAndDelete(req.params.id);

    await logAction('EXPENSE_DELETED', req.user._id, {
      expense_id: req.params.id,
      amount: expense.amount,
    });

    res.status(200).json({ status: 'success', message: "Chiqim o'chirildi" });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// TEACHER FINANCES (Avans + Ulush hisoblash)
// ============================================================

/**
 * O'qituvchi moliyaviy xulosasi
 * GET /api/v1/finance/teachers/:id/summary?month=2025-07
 */
exports.getTeacherFinanceSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const month = req.query.month || getCurrentMonth();

    // TEACHER faqat o'zining ma'lumotlarini ko'ra oladi
    if (req.user.role === 'TEACHER' && req.user._id.toString() !== id) {
      return next(new AppError("Siz faqat o'z moliyaviy ma'lumotlaringizni ko'ra olasiz", 403));
    }

    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== 'TEACHER') {
      return next(new AppError("O'qituvchi topilmadi", 404));
    }

    const groups = await Group.find({ teacher: id })
      .populate('course', 'title')
      .populate({
        path: 'students',
        select: 'user parentPhone status',
        populate: { path: 'user', select: 'firstname lastname phone email' }
      });

    const groupSummaries = [];
    let totalEarned = 0;
    let totalExpectedEarned = 0;

    for (const group of groups) {
      // O'quvchi ism-familiyasi bilan to'lov ma'lumotlari (accordion uchun)
      const paidInvoices = await Invoice.find({
        group: group._id,
        month,
        status: 'PAID',
      }).populate({ path: 'student', select: 'user parentPhone', populate: { path: 'user', select: 'firstname lastname phone' } });

      const unpaidInvoices = await Invoice.find({
        group: group._id,
        month,
        status: 'UNPAID',
      }).populate({ path: 'student', select: 'user parentPhone', populate: { path: 'user', select: 'firstname lastname phone' } });

      const groupIncome = paidInvoices.reduce((sum, inv) => sum + (inv.final_amount || inv.amount), 0);
      const expectedGroupIncome = paidInvoices.concat(unpaidInvoices).reduce((sum, inv) => sum + (inv.final_amount || inv.amount), 0);
      
      const sharePercent = group.teacher_share_percent || 50;
      const teacherShare = (groupIncome * sharePercent) / 100;
      const expectedTeacherShare = (expectedGroupIncome * sharePercent) / 100;
      
      totalEarned += teacherShare;
      totalExpectedEarned += expectedTeacherShare;

      // Har bir o'quvchi uchun to'lov holati (accordion uchun)
      const studentsDetail = group.students.map(student => {
        const paid = paidInvoices.find(inv => inv.student?._id?.toString() === student._id.toString());
        const unpaid = unpaidInvoices.find(inv => inv.student?._id?.toString() === student._id.toString());
        return {
          student_id: student._id,
          firstname: student.user?.firstname || 'Noma\'lum',
          lastname: student.user?.lastname || '',
          phone: student.user?.phone || '',
          email: student.user?.email || '',
          parentPhone: student.parentPhone || '',
          student_status: student.status || 'ACTIVE',
          status: paid ? 'PAID' : (unpaid ? 'UNPAID' : 'NO_INVOICE'),
          amount: paid ? (paid.final_amount || paid.amount) : (unpaid ? (unpaid.final_amount || unpaid.amount) : 0),
          paid_at: paid ? paid.paid_at : null,
          payment_method: paid ? paid.payment_method : null,
        };
      });

      groupSummaries.push({
        group_id: group._id,
        title: group.title,
        course: group.course?.title,
        total_students: group.students.length,
        paid_count: paidInvoices.length,
        unpaid_count: unpaidInvoices.length,
        group_income: groupIncome,
        teacher_share_percent: sharePercent,
        teacher_share: teacherShare,
        expected_teacher_share: expectedTeacherShare,
        students_detail: studentsDetail,
      });
    }

    // Avanslar
    const advances = await TeacherAdvance.find({ teacher: id, month })
      .populate('given_by', 'firstname lastname');
    const totalAdvance = advances.reduce((sum, a) => sum + a.amount, 0);
    const remaining = Math.max(0, totalEarned - totalAdvance);

    res.status(200).json({
      status: 'success',
      data: {
        teacher: {
          _id: teacher._id,
          firstname: teacher.firstname,
          lastname: teacher.lastname,
        },
        month,
        groups: groupSummaries,
        total_earned: totalEarned,
        expected_earned: totalExpectedEarned,
        total_advance: totalAdvance,
        remaining,
        advances,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Barcha o'qituvchilar moliyaviy ro'yxati
 * GET /api/v1/finance/teachers?month=2025-07
 */
exports.getAllTeachersSummary = async (req, res, next) => {
  try {
    const month = req.query.month || getCurrentMonth();
    const teachers = await User.find({ role: 'TEACHER', status: 'ACTIVE' });

    const result = [];
    for (const teacher of teachers) {
      const groups = await Group.find({ teacher: teacher._id });
      let totalStudents = 0, totalPaid = 0, totalUnpaid = 0, totalEarned = 0, totalExpectedEarned = 0;

      for (const group of groups) {
        const allStudents = group.students.length;
        const paidInvoices = await Invoice.find({ group: group._id, month, status: 'PAID' });
        const unpaidInvoices = await Invoice.find({ group: group._id, month, status: 'UNPAID' });
        const groupIncome = paidInvoices.reduce((s, i) => s + (i.final_amount || i.amount), 0);
        const expectedGroupIncome = paidInvoices.concat(unpaidInvoices).reduce((sum, inv) => sum + (inv.final_amount || inv.amount), 0);
        const sharePercent = group.teacher_share_percent || 50;
        
        totalStudents += allStudents;
        totalPaid += paidInvoices.length;
        totalUnpaid += unpaidInvoices.length;
        totalEarned += (groupIncome * sharePercent) / 100;
        totalExpectedEarned += (expectedGroupIncome * sharePercent) / 100;
      }

      const advances = await TeacherAdvance.find({ teacher: teacher._id, month });
      const totalAdvance = advances.reduce((s, a) => s + a.amount, 0);

      result.push({
        teacher: { _id: teacher._id, firstname: teacher.firstname, lastname: teacher.lastname },
        groups_count: groups.length,
        total_students: totalStudents,
        paid_count: totalPaid,
        unpaid_count: totalUnpaid,
        expected_salary: Math.max(0, totalExpectedEarned - totalAdvance),
        available_advance: Math.max(0, totalEarned - totalAdvance),
        total_earned: totalEarned,
        expected_earned: totalExpectedEarned,
        total_advance: totalAdvance,
        remaining: Math.max(0, totalEarned - totalAdvance),
      });
    }

    res.status(200).json({
      status: 'success',
      data: { teachers: result, month },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Avans berish
 * POST /api/v1/finance/advances
 */
exports.giveAdvance = async (req, res, next) => {
  try {
    const { teacher_id, amount, month, note } = req.body;

    if (!teacher_id || !amount) {
      return next(new AppError("teacher_id va amount majburiy", 400));
    }

    const teacher = await User.findById(teacher_id);
    if (!teacher || teacher.role !== 'TEACHER') {
      return next(new AppError("O'qituvchi topilmadi", 404));
    }

    const targetMonth = month || getCurrentMonth();

    // O'qituvchi maksimal avans olishi mumkin bo'lgan summasini hisoblash
    const groups = await Group.find({ teacher: teacher_id });
    let totalEarned = 0;
    for (const group of groups) {
      const paidInvoices = await Invoice.find({ group: group._id, month: targetMonth, status: 'PAID' });
      const groupIncome = paidInvoices.reduce((s, i) => s + (i.final_amount || i.amount), 0);
      totalEarned += (groupIncome * (group.teacher_share_percent || 50)) / 100;
    }

    const prevAdvances = await TeacherAdvance.find({ teacher: teacher_id, month: targetMonth });
    const alreadyGiven = prevAdvances.reduce((s, a) => s + a.amount, 0);
    const available = totalEarned - alreadyGiven;

    if (amount > available) {
      return next(new AppError(
        `Avans limiti oshib ketdi! Maksimal: ${available.toLocaleString()} so'm`, 400
      ));
    }

    // O'qituvchi avansini saqlash
    const advance = await TeacherAdvance.create({
      teacher: teacher_id,
      amount,
      month: targetMonth,
      note: note || null,
      given_by: req.user._id,
      given_at: new Date(),
    });

    // O'qituvchi avansini chiqimlarga qo'shish
    const dateFormatted = new Date().toLocaleDateString('uz-UZ');
    await Expense.create({
      category: 'MAOSH',
      amount: amount,
      note: note || `${teacher.firstname} ${teacher.lastname}ga ${dateFormatted} kuni berilgan avans`,
      created_by: req.user._id,
    });

    await logAction('ADVANCE_GIVEN', req.user._id, {
      advance_id: advance._id,
      teacher_id,
      amount,
      month: targetMonth,
    });

    res.status(201).json({
      status: 'success',
      message: "Avans muvaffaqiyatli berildi",
      data: {
        advance,
        remaining_available: available - amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Avanslar ro'yxati
 * GET /api/v1/finance/advances?month=2025-07&teacher_id=...
 */
exports.getAdvances = async (req, res, next) => {
  try {
    const { month, teacher_id } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (teacher_id) filter.teacher = teacher_id;

    const advances = await TeacherAdvance.find(filter)
      .populate('teacher', 'firstname lastname phone')
      .populate('given_by', 'firstname lastname')
      .sort({ given_at: -1 });

    res.status(200).json({
      status: 'success',
      results: advances.length,
      data: { advances },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Maosh to'lash (oy yakunida)
 * POST /api/v1/finance/salary/:teacherId
 */
exports.paySalary = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { month } = req.body;
    const targetMonth = month || getCurrentMonth();

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'TEACHER') {
      return next(new AppError("O'qituvchi topilmadi", 404));
    }

    const groups = await Group.find({ teacher: teacherId });
    let totalEarned = 0;
    for (const group of groups) {
      const paidInvoices = await Invoice.find({ group: group._id, month: targetMonth, status: 'PAID' });
      const groupIncome = paidInvoices.reduce((s, i) => s + (i.final_amount || i.amount), 0);
      totalEarned += (groupIncome * (group.teacher_share_percent || 50)) / 100;
    }

    const advances = await TeacherAdvance.find({ teacher: teacherId, month: targetMonth });
    const totalAdvance = advances.reduce((s, a) => s + a.amount, 0);
    const finalSalary = Math.max(0, totalEarned - totalAdvance);

    if (finalSalary > 0) {
      // 1. Oylik qoldig'ini Chiqimlarga qo'shish
      await Expense.create({
        category: 'MAOSH',
        amount: finalSalary,
        note: `${teacher.firstname} ${teacher.lastname} uchun ${targetMonth} oyi yakuniy maoshi`,
        created_by: req.user._id,
      });

      // 2. Qarzni nollash uchun uni Avans (to'lov) sifatida yozish
      await TeacherAdvance.create({
        teacher: teacherId,
        amount: finalSalary,
        month: targetMonth,
        note: `To'liq oylik (qoldiq) to'landi`,
        given_by: req.user._id,
        given_at: new Date(),
      });
    }

    await logAction('SALARY_PAID', req.user._id, {
      teacher_id: teacherId,
      month: targetMonth,
      total_earned: totalEarned,
      total_advance: totalAdvance,
      final_salary: finalSalary,
    });

    res.status(200).json({
      status: 'success',
      message: "Maosh to'landi",
      data: {
        teacher: { _id: teacher._id, firstname: teacher.firstname, lastname: teacher.lastname },
        month: targetMonth,
        total_earned: totalEarned,
        total_advance: totalAdvance,
        final_salary: finalSalary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// REPORTS
// ============================================================

/**
 * Oylik hisobot
 * GET /api/v1/finance/report?month=2025-07
 */
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const month = req.query.month || getCurrentMonth();
    const [year, mon] = month.split('-').map(Number);
    const monthStart = new Date(year, mon - 1, 1);
    const monthEnd = new Date(year, mon, 1);

    const paidInvoices = await Invoice.find({ status: 'PAID', month });
    const totalIncome = paidInvoices.reduce((s, i) => s + (i.final_amount || i.amount), 0);

    const expenses = await Expense.find({ date: { $gte: monthStart, $lt: monthEnd } });
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const maoshExpense = expenses.filter(e => e.category === 'MAOSH').reduce((s, e) => s + e.amount, 0);

    // O'qituvchilar ulushi (jami)
    const teachers = await User.find({ role: 'TEACHER', status: 'ACTIVE' });
    let totalTeacherShare = 0;
    for (const teacher of teachers) {
      const groups = await Group.find({ teacher: teacher._id });
      for (const group of groups) {
        const paid = await Invoice.find({ group: group._id, month, status: 'PAID' });
        const groupIncome = paid.reduce((s, i) => s + (i.final_amount || i.amount), 0);
        totalTeacherShare += (groupIncome * (group.teacher_share_percent || 50)) / 100;
      }
    }

    // Sof foyda = Tushum - (Chiqimlar - Maosh chiqimlari) - O'qituvchilarning jami ulushi
    // Agar Maosh chiqimini ayirmasak, ham 'totalExpense' ichida, ham 'totalTeacherShare' orqali 2 marta ushlab qolinadi.
    const netProfit = totalIncome - (totalExpense - maoshExpense) - totalTeacherShare;

    // To'lov usuli bo'yicha
    const byMethod = { CASH: 0, CARD: 0, CLICK: 0, BANK: 0 };
    paidInvoices.forEach(inv => {
      if (inv.payment_method && byMethod[inv.payment_method] !== undefined) {
        byMethod[inv.payment_method] += inv.final_amount || inv.amount;
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        month,
        income: totalIncome,
        expense: totalExpense,
        teacher_share: totalTeacherShare,
        net_profit: netProfit,
        by_payment_method: byMethod,
        paid_invoices_count: paidInvoices.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Audit log (Super Admin uchun)
 * GET /api/v1/finance/audit-log
 */
exports.getAuditLog = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await FinanceAuditLog.find()
      .populate('performed_by', 'firstname lastname role')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: logs.length,
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// MONTHLY INVOICE GENERATOR (Cron Job — har oyning 1-kuni)
// ============================================================

/**
 * Har oyning 1-kuni barcha faol guruhlardagi o'quvchilarga
 * to'liq oylik UNPAID Invoice yaratadi.
 * Prorated bo'lgan birinchi oyning Invoice'i allaqachon mavjud bo'lsa — o'tkazib yuboradi.
 */
exports.generateMonthlyInvoices = async () => {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const groups = await Group.find({ status: 'ACTIVE' }).populate('students');
    let created = 0, skipped = 0, billingSkipped = 0;

    for (const group of groups) {
      const amount = group.price || 0;
      for (const studentId of group.students) {
        // 1. Invoice allaqachon mavjudmi?
        const exists = await Invoice.findOne({
          student: studentId,
          group: group._id,
          month,
        });
        if (exists) {
          skipped++;
          continue;
        }

        // 2. B-variant billing skip tekshiruvi
        // Student billing_overrides da shu guruh uchun skip_until bor-yo'qligini tekshiramiz
        const studentDoc = await Student.findById(studentId).select('billing_overrides');
        if (studentDoc && studentDoc.billing_overrides && studentDoc.billing_overrides.length > 0) {
          const override = studentDoc.billing_overrides.find(
            ov => ov.group && ov.group.toString() === group._id.toString()
          );
          if (override && override.skip_until) {
            // Agar joriy oy <= skip_until bo'lsa — invoice yaratmaymiz
            if (month <= override.skip_until) {
              billingSkipped++;
              console.log(`[CRON] Skip (B-variant): student=${studentId} group=${group._id} skip_until=${override.skip_until}`);
              // Agar bu oxirgi skip oyi bo'lsa — override ni o'chirib tashlaymiz (endi to'g'ri tsiklda)
              if (month === override.skip_until) {
                await Student.updateOne(
                  { _id: studentId },
                  { $pull: { billing_overrides: { group: group._id } } }
                );
              }
              continue;
            }
          }
        }

        // 3. Yangi to'liq oylik UNPAID invoice yaratamiz
        await Invoice.create({
          student: studentId,
          group: group._id,
          month,
          amount,
          discount: 0,
          final_amount: amount,
          status: 'UNPAID',
          due_date: dueDate,
          invoice_type: 'FULL',
        });
        created++;
      }
    }

    console.log(`[FINANCE CRON] ${month}: ${created} ta invoice yaratildi, ${skipped} ta o'tkazib yuborildi, ${billingSkipped} ta B-variant skip`);
    return { created, skipped, billingSkipped, month };
  } catch (error) {
    console.error('[FINANCE CRON] Xatolik:', error.message);
    throw error;
  }
};

/**
 * Qo'lda oylik invoice yaratish (Admin uchun)
 * POST /api/v1/finance/invoices/generate
 */
exports.manualGenerateInvoices = async (req, res, next) => {
  try {
    const result = await exports.generateMonthlyInvoices();
    res.status(200).json({
      status: 'success',
      message: `Invoicelar yaratildi`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Guruhdan chiqarilgan o'quvchilarning orphan invoicelarini tozalash
 */
exports.cleanupOrphanInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ status: 'UNPAID' }).populate('student group');
    let deletedCount = 0;
    
    for (const inv of invoices) {
      if (!inv.student) {
        // Talaba bazadan butunlay o'chirilgan
        await Invoice.findByIdAndDelete(inv._id);
        deletedCount++;
        continue;
      }
      if (!inv.student.enrollments) continue;
      
      const isEnrolled = inv.student.enrollments.some(
        en => en.group && en.group.toString() === (inv.group?._id || inv.group)?.toString()
      );
      if (!isEnrolled) {
        // Hozirda guruhda yo'q, invoice o'chirilishi kerak
        await Invoice.findByIdAndDelete(inv._id);
        deletedCount++;
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: `${deletedCount} ta o'quvchisi yo'q (orphan) invoice o'chirildi.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mavjud o'quvchilarni 1-sanaga moslashtirish (Proration)
 */
exports.alignToFirstOfMonth = async (req, res, next) => {
  try {
    const today = new Date();
    const yr = today.getFullYear();
    const mn = today.getMonth(); // 0-indexed
    const dayOfMonth = today.getDate();
    const currentMonthStr = `${yr}-${String(mn + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(yr, mn + 1, 0).getDate();
    const daysRemaining = daysInMonth - dayOfMonth + 1;

    // Hamma active o'quvchilarni topish
    const students = await Student.find({ status: 'ACTIVE' }).populate('enrollments.group');
    let updatedCount = 0;

    for (const student of students) {
      if (!student.enrollments) continue;
      for (const en of student.enrollments) {
        if (!en.group) continue;
        const group = en.group;
        const fullPrice = group.price || 0;
        
        // Ularning qachon to'lov qilgani ma'lum emas, lekin agar biz ularni bugundan boshlab 1-sanaga to'g'rilasak:
        // Bugundan to oyning oxirigacha prorated invoice yaratamiz (yoki update qilamiz)
        const proratedAmount = Math.round((fullPrice / daysInMonth) * daysRemaining);
        
        const existingInvoice = await Invoice.findOne({
          student: student._id,
          group: group._id,
          month: currentMonthStr,
          status: 'UNPAID'
        });

        if (existingInvoice) {
          // Update existing unpaid invoice
          existingInvoice.amount = proratedAmount;
          existingInvoice.final_amount = proratedAmount;
          existingInvoice.note = `Align to 1st: Prorated for ${daysRemaining} days`;
          await existingInvoice.save();
          updatedCount++;
        }
      }
    }

    res.status(200).json({
      status: 'success',
      message: `${updatedCount} ta invoice 1-sanaga moslashtirildi.`
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PRORATED BILLING — YANGI FUNKSIYALAR
// ============================================================

/**
 * Prorated summani hisoblash va A/B variantlarini ko'rsatish
 * GET /api/v1/finance/prorated-preview?student_id=&group_id=&join_date=
 *
 * join_date ixtiyoriy — berilmasa bugungi sana ishlatiladi
 * Qaytaradi: { full_price, days_in_month, days_remaining, prorated_amount, variant_a, variant_b, next_billing_month }
 */
exports.calculateProratedPreview = async (req, res, next) => {
  try {
    const { student_id, group_id, join_date } = req.query;

    if (!group_id) {
      return next(new AppError('group_id majburiy', 400));
    }

    const group = await Group.findById(group_id);
    if (!group) return next(new AppError('Guruh topilmadi', 404));

    const today = join_date ? new Date(join_date) : new Date();
    const yr = today.getFullYear();
    const mn = today.getMonth(); // 0-indexed
    const dayOfMonth = today.getDate();

    const currentMonthStr = `${yr}-${String(mn + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(yr, mn + 1, 0).getDate();
    // Qolgan kunlar: bugundan oyning oxirigacha (bugun ham kiradi)
    const daysRemaining = daysInMonth - dayOfMonth + 1;

    const fullPrice = group.price || 0;

    // Agar 1-sana bo'lsa — prorated yo'q, to'liq to'lov
    const isFirstDay = dayOfMonth === 1;
    const proratedAmount = isFirstDay
      ? fullPrice
      : Math.round((fullPrice / daysInMonth) * daysRemaining);

    // Keyingi to'liq oy
    const nextMonthDate = new Date(yr, mn + 1, 1);
    const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // B-variant uchun skip_until oyi (keyingi oyning 1-sanasida ham invoice yaratilmaydi)
    // B-variant: joriy oy prorated + keyingi 1 to'liq oy => 2 oydan keyingi oyda invoice
    const skipUntilDate = new Date(yr, mn + 2, 1); // 2 oy oldinga
    const skipUntilStr = `${skipUntilDate.getFullYear()}-${String(skipUntilDate.getMonth() + 1).padStart(2, '0')}`;
    // Aslida B-variant: keyingi oyni o'z ichiga oladi — keyingi keyingi oyda invoice
    // Ammo foydalanuvchi qulayligi uchun: skip_until = nextMonthStr (faqat bitta oy skip)
    const bVariantSkipUntil = nextMonthStr;

    // A-variant: faqat prorated to'lov, keyingi oyda normal invoice
    // B-variant: prorated + keyingi to'liq oy, keyingi oyda invoice yo'q
    const variantA = {
      label: 'A-Variant: Faqat joriy oy qoldig\'i',
      amount: proratedAmount,
      description: `${daysRemaining} kun uchun (${currentMonthStr})`,
      next_billing_month: nextMonthStr,
    };

    const variantB = {
      label: 'B-Variant: Joriy oy qoldig\'i + 1 to\'liq oy',
      amount: proratedAmount + fullPrice,
      prorated_part: proratedAmount,
      full_month_part: fullPrice,
      description: `${daysRemaining} kun + ${nextMonthStr} to'liq oy`,
      next_billing_month: skipUntilDate.toISOString().slice(0, 7), // 2 oy keyingi
      skip_until: bVariantSkipUntil,
    };

    // Agar student_id berilgan bo'lsa — u allaqachon B-variant tanlaganmi tekshiramiz
    let existingOverride = null;
    if (student_id) {
      const studentDoc = await Student.findById(student_id).select('billing_overrides');
      if (studentDoc) {
        existingOverride = studentDoc.billing_overrides?.find(
          ov => ov.group && ov.group.toString() === group_id
        ) || null;
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        group: { _id: group._id, title: group.title, price: fullPrice },
        current_month: currentMonthStr,
        join_date: today.toISOString().slice(0, 10),
        day_of_month: dayOfMonth,
        days_in_month: daysInMonth,
        days_remaining: daysRemaining,
        is_first_day: isFirstDay,
        prorated_amount: proratedAmount,
        full_price: fullPrice,
        variant_a: variantA,
        variant_b: variantB,
        existing_override: existingOverride,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eski o'quvchilarning billing cycle ni 1-sanaga sinxronlash
 * POST /api/v1/finance/invoices/sync-billing
 *
 * Body:
 * {
 *   student_id: "...",
 *   group_id: "...",
 *   variant: "A" | "B",
 *   payment_method: "CASH" | "CARD" | "CLICK" | "BANK",
 *   amount: number,       // ixtiyoriy — berilmasa prorated hisoblanadi
 *   discount: number,     // ixtiyoriy
 *   note: string,         // ixtiyoriy
 * }
 *
 * A-variant: faqat joriy oy qoldig'i uchun to'lov, keyingi oyda normal invoice
 * B-variant: joriy oy qoldig'i + keyingi to'liq oy, keyingi oyda invoice yaratilmaydi
 */
exports.syncStudentBillingCycle = async (req, res, next) => {
  try {
    const { student_id, group_id, variant, payment_method, amount, discount, note } = req.body;

    if (!student_id || !group_id || !variant || !payment_method) {
      return next(new AppError('student_id, group_id, variant (A|B) va payment_method majburiy', 400));
    }
    if (!['A', 'B'].includes(variant)) {
      return next(new AppError('variant faqat A yoki B bo\'lishi mumkin', 400));
    }

    const student = await Student.findById(student_id);
    if (!student) return next(new AppError('O\'quvchi topilmadi', 404));

    const group = await Group.findById(group_id);
    if (!group) return next(new AppError('Guruh topilmadi', 404));

    const today = new Date();
    const yr = today.getFullYear();
    const mn = today.getMonth();
    const dayOfMonth = today.getDate();
    const currentMonthStr = `${yr}-${String(mn + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(yr, mn + 1, 0).getDate();
    const daysRemaining = daysInMonth - dayOfMonth + 1;
    const fullPrice = group.price || 0;

    const proratedAmount = dayOfMonth === 1
      ? fullPrice
      : Math.round((fullPrice / daysInMonth) * daysRemaining);

    const disc = discount || 0;
    const paidAt = new Date();
    const dueDate = new Date(yr, mn, 1);
    const createdInvoices = [];

    // === A-VARIANT ===
    if (variant === 'A') {
      // Faqat joriy oy qoldig'i uchun to'lov
      const finalAmt = amount || proratedAmount;
      const finalPayable = finalAmt - disc;

      let invoice = await Invoice.findOne({ student: student_id, group: group_id, month: currentMonthStr });
      if (invoice) {
        invoice.amount = finalAmt;
        invoice.discount = disc;
        invoice.final_amount = finalPayable;
        invoice.status = 'PAID';
        invoice.paid_at = paidAt;
        invoice.payment_method = payment_method;
        invoice.invoice_type = 'PRORATED';
        invoice.note = note || `A-variant: ${daysRemaining} kun prorated`;
        invoice.created_by = req.user._id;
        await invoice.save();
      } else {
        invoice = await Invoice.create({
          student: student_id,
          group: group_id,
          month: currentMonthStr,
          amount: finalAmt,
          discount: disc,
          final_amount: finalPayable,
          status: 'PAID',
          due_date: dueDate,
          paid_at: paidAt,
          payment_method,
          invoice_type: 'PRORATED',
          note: note || `A-variant: ${daysRemaining} kun prorated (${daysInMonth} kunli oyda)`,
          created_by: req.user._id,
        });
      }
      createdInvoices.push(invoice);

      // A-variant: billing_overrides dan shu guruh override ni o'chirib tashlaymiz (normal tsiklga qaytadi)
      await Student.updateOne(
        { _id: student_id },
        { $pull: { billing_overrides: { group: group._id } } }
      );

    } else {
      // === B-VARIANT ===
      // 1. Joriy oy prorated invoice
      const proratedPayable = (amount !== undefined ? amount : proratedAmount) - disc;
      const proratedFinalAmt = amount !== undefined ? amount : proratedAmount;

      let proratedInvoice = await Invoice.findOne({ student: student_id, group: group_id, month: currentMonthStr });
      if (proratedInvoice) {
        proratedInvoice.amount = proratedFinalAmt;
        proratedInvoice.discount = disc;
        proratedInvoice.final_amount = proratedPayable;
        proratedInvoice.status = 'PAID';
        proratedInvoice.paid_at = paidAt;
        proratedInvoice.payment_method = payment_method;
        proratedInvoice.invoice_type = 'PRORATED';
        proratedInvoice.note = note || `B-variant: ${daysRemaining} kun prorated`;
        proratedInvoice.created_by = req.user._id;
        await proratedInvoice.save();
      } else {
        proratedInvoice = await Invoice.create({
          student: student_id,
          group: group_id,
          month: currentMonthStr,
          amount: proratedFinalAmt,
          discount: disc,
          final_amount: proratedPayable,
          status: 'PAID',
          due_date: dueDate,
          paid_at: paidAt,
          payment_method,
          invoice_type: 'PRORATED',
          note: note || `B-variant: ${daysRemaining} kun prorated (${daysInMonth} kunli oyda)`,
          created_by: req.user._id,
        });
      }
      createdInvoices.push(proratedInvoice);

      // 2. Keyingi to'liq oy invoice (PAID sifatida)
      const nextMonthDate = new Date(yr, mn + 1, 1);
      const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
      const nextDueDate = nextMonthDate;

      let nextInvoice = await Invoice.findOne({ student: student_id, group: group_id, month: nextMonthStr });
      if (nextInvoice) {
        nextInvoice.amount = fullPrice;
        nextInvoice.discount = 0;
        nextInvoice.final_amount = fullPrice;
        nextInvoice.status = 'PAID';
        nextInvoice.paid_at = paidAt;
        nextInvoice.payment_method = payment_method;
        nextInvoice.invoice_type = 'FULL';
        nextInvoice.billing_cycle_skipped_until = nextMonthStr;
        nextInvoice.note = note || `B-variant: ${nextMonthStr} to'liq oy oldindan to'landi`;
        nextInvoice.created_by = req.user._id;
        await nextInvoice.save();
      } else {
        nextInvoice = await Invoice.create({
          student: student_id,
          group: group_id,
          month: nextMonthStr,
          amount: fullPrice,
          discount: 0,
          final_amount: fullPrice,
          status: 'PAID',
          due_date: nextDueDate,
          paid_at: paidAt,
          payment_method,
          invoice_type: 'FULL',
          billing_cycle_skipped_until: nextMonthStr,
          note: note || `B-variant: ${nextMonthStr} to'liq oy oldindan to'landi`,
          created_by: req.user._id,
        });
      }
      createdInvoices.push(nextInvoice);

      // 3. Student billing_overrides yangilash — keyingi oy uchun cron invoice yaratmasin
      const existingOverrideIdx = student.billing_overrides?.findIndex(
        ov => ov.group && ov.group.toString() === group._id.toString()
      );
      if (existingOverrideIdx !== undefined && existingOverrideIdx >= 0) {
        student.billing_overrides[existingOverrideIdx].skip_until = nextMonthStr;
      } else {
        if (!student.billing_overrides) student.billing_overrides = [];
        student.billing_overrides.push({ group: group._id, skip_until: nextMonthStr });
      }
      await student.save();
    }

    const totalPaid = createdInvoices.reduce((s, inv) => s + inv.final_amount, 0);

    await logAction('BILLING_SYNC', req.user._id, {
      student_id,
      group_id,
      variant,
      payment_method,
      total_paid: totalPaid,
      invoices_count: createdInvoices.length,
    });

    res.status(200).json({
      status: 'success',
      message: `Billing cycle ${variant}-variant orqali muvaffaqiyatli sinxronlashtirildi`,
      data: {
        variant,
        invoices: createdInvoices,
        total_paid: totalPaid,
        next_billing_info: variant === 'A'
          ? 'Keyingi oyning 1-sanasida avtomatik invoice yaratiladi'
          : 'Keyingi oyning 1-sanasida invoice yaratilmaydi (to\'lov allaqachon amalga oshirildi)',
      },
    });
  } catch (error) {
    next(error);
  }
};
