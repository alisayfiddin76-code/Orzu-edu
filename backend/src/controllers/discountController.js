const mongoose = require('mongoose');
const Discount = require('../models/Discount');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const AppError = require('../utils/appError');

// Helper: joriy oy strini qaytaradi "YYYY-MM" formatda
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Helper: O'quvchining faol guruhlar sonini aniqlash va avto chegirma foizini hisoblash
const getAutoDiscountPercent = async (studentId) => {
  const activeGroups = await Group.find({
    students: studentId,
    status: 'ACTIVE',
  });
  // 2+ guruhda o'qisa 10% avtomatik chegirma
  return activeGroups.length >= 2 ? 10 : 0;
};

// ============================================================
// GET ALL DISCOUNTS + STATS
// GET /api/v1/finance/discounts
// ============================================================
exports.getAll = async (req, res, next) => {
  try {
    // 1) Barcha qo'lda belgilangan chegirmalarni olish
    const discounts = await Discount.find()
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'firstname lastname phone' },
      })
      .populate('group', 'title price course students')
      .populate('created_by', 'firstname lastname')
      .sort({ createdAt: -1 });

    // 2) Avtomatik chegirmali o'quvchilarni aniqlash (2+ guruhda o'qiydigan)
    // Barcha faol guruhlardan studentlarni yig'amiz
    const activeGroups = await Group.find({ status: 'ACTIVE' })
      .select('students title price course')
      .populate('course', 'title');

    // Har bir o'quvchining nechta guruhda ekanligini hisoblash
    const studentGroupCount = {};
    const studentGroupMap = {}; // studentId -> [group objects]
    for (const group of activeGroups) {
      for (const studentId of group.students) {
        const sid = studentId.toString();
        if (!studentGroupCount[sid]) {
          studentGroupCount[sid] = 0;
          studentGroupMap[sid] = [];
        }
        studentGroupCount[sid]++;
        studentGroupMap[sid].push(group);
      }
    }

    // 2+ guruhli o'quvchilar (avto chegirmali)
    const autoDiscountStudentIds = Object.keys(studentGroupCount).filter(
      (sid) => studentGroupCount[sid] >= 2
    );

    // Avto chegirma summalarini hisoblash
    let totalAutoDiscountSum = 0;
    const autoDiscountEntries = [];

    if (autoDiscountStudentIds.length > 0) {
      const autoStudents = await Student.find({
        _id: { $in: autoDiscountStudentIds },
      }).populate('user', 'firstname lastname phone');

      for (const student of autoStudents) {
        const sid = student._id.toString();
        const groups = studentGroupMap[sid] || [];
        for (const group of groups) {
          const autoAmount = Math.round((group.price * 10) / 100);
          totalAutoDiscountSum += autoAmount;

          // Qo'lda chegirma ham bormi tekshirish
          const manualDiscount = discounts.find(
            (d) =>
              d.student?._id?.toString() === sid &&
              d.group?._id?.toString() === group._id.toString()
          );

          autoDiscountEntries.push({
            _id: `auto_${sid}_${group._id}`,
            type: 'AUTO',
            student: student,
            group: group,
            original_price: group.price,
            auto_discount_percent: 10,
            auto_discount_amount: autoAmount,
            manual_discount_amount: manualDiscount
              ? manualDiscount.discount_amount
              : 0,
            total_discount:
              autoAmount + (manualDiscount ? manualDiscount.discount_amount : 0),
            final_price:
              group.price -
              autoAmount -
              (manualDiscount ? manualDiscount.discount_amount : 0),
            reason: manualDiscount ? manualDiscount.reason : null,
            manual_discount_id: manualDiscount ? manualDiscount._id : null,
          });
        }
      }
    }

    // 3) Faqat qo'lda chegirmali o'quvchilar (1 ta guruhda)
    const manualOnlyEntries = discounts
      .filter((d) => {
        const sid = d.student?._id?.toString();
        return !autoDiscountStudentIds.includes(sid);
      })
      .map((d) => ({
        _id: d._id,
        type: 'MANUAL',
        student: d.student,
        group: d.group,
        original_price: d.original_price,
        auto_discount_percent: 0,
        auto_discount_amount: 0,
        manual_discount_amount: d.discount_amount,
        total_discount: d.discount_amount,
        final_price: d.final_price,
        reason: d.reason,
        manual_discount_id: d._id,
      }));

    // 4) Statistika
    const manualDiscountSum = discounts.reduce(
      (sum, d) => sum + d.discount_amount,
      0
    );
    const uniqueManualStudents = [
      ...new Set(discounts.map((d) => d.student?._id?.toString())),
    ];
    const uniqueAutoStudents = autoDiscountStudentIds;

    // Barcha chegirmali o'quvchilar (avto + manual, overlap olib tashlanadi)
    const allDiscountStudents = new Set([
      ...uniqueManualStudents,
      ...uniqueAutoStudents,
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalDiscountStudents: allDiscountStudents.size,
          monthlyDiscountSum: totalAutoDiscountSum + manualDiscountSum,
          autoDiscountStudents: uniqueAutoStudents.length,
          manualDiscountStudents: uniqueManualStudents.length,
        },
        // Birlashtirilgan ro'yxat
        entries: [...autoDiscountEntries, ...manualOnlyEntries],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CALCULATE DISCOUNTS FOR A SPECIFIC STUDENT
// GET /api/v1/finance/discounts/student/:studentId/calculate
// ============================================================
exports.calculateForStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate(
      'user',
      'firstname lastname phone'
    );
    if (!student) {
      return next(new AppError("O'quvchi topilmadi", 404));
    }

    // O'quvchining barcha faol guruhlarini topish
    const studentGroups = await Group.find({
      students: studentId,
      status: 'ACTIVE',
    })
      .populate('course', 'title')
      .select('title price course days start_time end_time');

    // Avto chegirma foizi
    const autoDiscountPercent = studentGroups.length >= 2 ? 10 : 0;

    // Mavjud qo'l chegirmalarni topish
    const manualDiscounts = await Discount.find({ student: studentId });
    const manualMap = {};
    for (const md of manualDiscounts) {
      manualMap[md.group.toString()] = md;
    }

    // Har bir guruh uchun hisoblash
    const calculations = studentGroups.map((group) => {
      const autoDiscountAmount = Math.round(
        (group.price * autoDiscountPercent) / 100
      );
      const manual = manualMap[group._id.toString()];
      const manualDiscountAmount = manual ? manual.discount_amount : 0;
      const totalDiscount = autoDiscountAmount + manualDiscountAmount;
      const finalPrice = Math.max(0, group.price - totalDiscount);

      return {
        group: {
          _id: group._id,
          title: group.title,
          price: group.price,
          course: group.course,
        },
        original_price: group.price,
        auto_discount_percent: autoDiscountPercent,
        auto_discount_amount: autoDiscountAmount,
        manual_discount_amount: manualDiscountAmount,
        manual_discount_id: manual ? manual._id : null,
        manual_discount_reason: manual ? manual.reason : null,
        total_discount: totalDiscount,
        final_price: finalPrice,
      };
    });

    // Jami
    const totalOriginal = calculations.reduce(
      (s, c) => s + c.original_price,
      0
    );
    const totalDiscount = calculations.reduce(
      (s, c) => s + c.total_discount,
      0
    );
    const totalFinal = calculations.reduce((s, c) => s + c.final_price, 0);

    res.status(200).json({
      status: 'success',
      data: {
        student: {
          _id: student._id,
          firstname: student.user?.firstname,
          lastname: student.user?.lastname,
          phone: student.user?.phone,
        },
        groupsCount: studentGroups.length,
        autoDiscountPercent,
        calculations,
        summary: {
          totalOriginal,
          totalDiscount,
          totalFinal,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CREATE MANUAL DISCOUNT
// POST /api/v1/finance/discounts
// ============================================================
exports.create = async (req, res, next) => {
  try {
    const { student_id, group_id, discount_amount, reason } = req.body;

    if (!student_id || !group_id || discount_amount === undefined) {
      return next(
        new AppError('student_id, group_id va discount_amount majburiy', 400)
      );
    }

    // Student mavjudligini tekshirish
    const student = await Student.findById(student_id);
    if (!student) {
      return next(new AppError("O'quvchi topilmadi", 404));
    }

    // Group mavjudligini va narxini tekshirish
    const group = await Group.findById(group_id);
    if (!group) {
      return next(new AppError('Guruh topilmadi', 404));
    }

    // Chegirma summasi narxdan oshmasligi kerak
    if (discount_amount > group.price) {
      return next(
        new AppError(
          `Chegirma summasi guruh narxidan (${group.price}) oshib ketdi`,
          400
        )
      );
    }

    // Mavjud chegirma bormi tekshirish
    const existing = await Discount.findOne({
      student: student_id,
      group: group_id,
    });
    if (existing) {
      return next(
        new AppError(
          "Bu o'quvchiga bu guruhda allaqachon chegirma belgilangan. Tahrirlashni ishlatib ko'ring.",
          400
        )
      );
    }

    const original_price = group.price;
    const final_price = original_price - discount_amount;

    const discount = await Discount.create({
      student: student_id,
      group: group_id,
      original_price,
      discount_amount,
      final_price,
      reason: reason || null,
      created_by: req.user._id,
    });

    // Invoice integratsiya: shu oy UNPAID invoiceni yangilash
    const currentMonth = getCurrentMonth();
    const autoPercent = await getAutoDiscountPercent(student_id);
    const autoAmount = Math.round((group.price * autoPercent) / 100);
    const totalDiscount = autoAmount + discount_amount;

    await Invoice.findOneAndUpdate(
      {
        student: student_id,
        group: group_id,
        month: currentMonth,
        status: 'UNPAID',
      },
      {
        discount: totalDiscount,
        final_amount: Math.max(0, group.price - totalDiscount),
      }
    );

    res.status(201).json({
      status: 'success',
      message: "Chegirma muvaffaqiyatli belgilandi",
      data: { discount },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new AppError(
          "Bu o'quvchiga bu guruhda allaqachon chegirma mavjud",
          400
        )
      );
    }
    next(error);
  }
};

// ============================================================
// UPDATE MANUAL DISCOUNT
// PATCH /api/v1/finance/discounts/:id
// ============================================================
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { discount_amount, reason } = req.body;

    const discount = await Discount.findById(id);
    if (!discount) {
      return next(new AppError('Chegirma topilmadi', 404));
    }

    // Guruh narxini olish
    const group = await Group.findById(discount.group);
    if (!group) {
      return next(new AppError('Guruh topilmadi', 404));
    }

    if (discount_amount !== undefined) {
      if (discount_amount > group.price) {
        return next(
          new AppError(
            `Chegirma summasi guruh narxidan (${group.price}) oshib ketdi`,
            400
          )
        );
      }
      discount.discount_amount = discount_amount;
      discount.original_price = group.price;
      discount.final_price = group.price - discount_amount;
    }

    if (reason !== undefined) {
      discount.reason = reason;
    }

    await discount.save();

    // Invoice integratsiya: yangilash
    const currentMonth = getCurrentMonth();
    const autoPercent = await getAutoDiscountPercent(discount.student);
    const autoAmount = Math.round((group.price * autoPercent) / 100);
    const totalDiscount = autoAmount + discount.discount_amount;

    await Invoice.findOneAndUpdate(
      {
        student: discount.student,
        group: discount.group,
        month: currentMonth,
        status: 'UNPAID',
      },
      {
        discount: totalDiscount,
        final_amount: Math.max(0, group.price - totalDiscount),
      }
    );

    res.status(200).json({
      status: 'success',
      message: "Chegirma muvaffaqiyatli yangilandi",
      data: { discount },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE MANUAL DISCOUNT
// DELETE /api/v1/finance/discounts/:id
// ============================================================
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findById(id);
    if (!discount) {
      return next(new AppError('Chegirma topilmadi', 404));
    }

    const studentId = discount.student;
    const groupId = discount.group;

    await Discount.findByIdAndDelete(id);

    // Invoice integratsiya: chegirma olib tashlanganda invoiceni yangilash
    const currentMonth = getCurrentMonth();
    const group = await Group.findById(groupId);
    if (group) {
      const autoPercent = await getAutoDiscountPercent(studentId);
      const autoAmount = Math.round((group.price * autoPercent) / 100);

      await Invoice.findOneAndUpdate(
        {
          student: studentId,
          group: groupId,
          month: currentMonth,
          status: 'UNPAID',
        },
        {
          discount: autoAmount,
          final_amount: Math.max(0, group.price - autoAmount),
        }
      );
    }

    res.status(200).json({
      status: 'success',
      message: "Chegirma muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    next(error);
  }
};
