const Group = require("../models/Group");
const Course = require("../models/Course");
const Student = require("../models/Student");
const User = require("../models/User");
const Invoice = require("../models/Invoice");
const AppError = require("../utils/appError");

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Create a new group
 * POST /api/v1/groups
 * Restricted to SUPER_ADMIN
 */
exports.createGroup = async (req, res, next) => {
  try {
    const { course, teacher, title, room, start_time, end_time, days, students } = req.body;

    if (!course || !teacher || !title || !days) {
      return next(new AppError("Iltimos, barcha majburiy maydonlarni (course, teacher, title, days) to'ldiring", 400));
    }

    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return next(new AppError("Kurs topilmadi", 404));
    }

    // Determine group price: use provided price or fallback to course price
    const groupPrice = req.body.price !== undefined ? req.body.price : (courseExists.price || 0);

    // Check if teacher exists and has TEACHER role
    const teacherExists = await User.findById(teacher);
    if (!teacherExists || teacherExists.role !== "TEACHER") {
      return next(new AppError("O'qituvchi topilmadi yoki to'g'ri rol bilan emas", 404));
    }

    // Validate students if provided
    let studentIds = [];
    if (students && Array.isArray(students) && students.length > 0) {
      const foundStudents = await Student.find({ _id: { $in: students } });
      if (foundStudents.length !== students.length) {
        return next(new AppError("Bir yoki bir nechta tanlangan talaba topilmadi", 404));
      }
      studentIds = students;
    }

    const group = await Group.create({
      course,
      teacher,
      title,
      room,
      start_time,
      end_time,
      days,
      price: groupPrice,
      students: studentIds,
    });

    // Create initial invoices for all selected students
    if (studentIds.length > 0) {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const dueDate = new Date(now.getFullYear(), now.getMonth(), 1);

      const invoicePromises = studentIds.map(studentId => {
        return Invoice.create({
          student: studentId,
          group: group._id,
          month: currentMonth,
          amount: group.price || 0,
          discount: 0,
          final_amount: group.price || 0,
          status: 'UNPAID',
          due_date: dueDate,
        }).catch(() => null); // Agar allaqachon mavjud bo'lsa — o'tkazib yuboramiz
      });
      await Promise.all(invoicePromises);
    }

    await group.populate([
      { path: "course", select: "title description" },
      { path: "teacher", select: "firstname lastname email phone" },
      {
        path: "students",
        populate: { path: "user", select: "firstname lastname phone email" }
      }
    ]);

    res.status(201).json({
      status: "success",
      data: {
        group,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get all groups (for admins/managers)
 * GET /api/v1/groups
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.getAllGroups = async (req, res, next) => {
  try {
    // status=closed bo'lmagan guruhlarni qaytarish (ACTIVE yoki status yo'q eski yozuvlar)
    const statusFilter = req.query.includeAll === 'true'
      ? {}
      : { $or: [{ status: 'ACTIVE' }, { status: { $exists: false } }] };

    const groups = await Group.find(statusFilter)
      .populate("course", "title description")
      .populate("teacher", "firstname lastname email phone avatar");

    res.status(200).json({
      status: "success",
      results: groups.length,
      data: {
        groups,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get teacher's own groups
 * GET /api/v1/groups/my-groups
 * Restricted to TEACHER
 */
exports.getTeacherGroups = async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    const groups = await Group.find({ teacher: teacherId })
      .populate("course", "title description")
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "firstname lastname phone email",
        },
      });

    res.status(200).json({
      status: "success",
      results: groups.length,
      data: {
        groups,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single group by ID
 * GET /api/v1/groups/:id
 */
exports.getGroupById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id)
      .populate("course", "title description duration price")
      .populate("teacher", "firstname lastname email phone avatar education bio")
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "firstname lastname phone email",
        },
      });

    if (!group) {
      return next(new AppError("Guruh topilmadi", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        group,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update group
 * PATCH /api/v1/groups/:id
 * Restricted to SUPER_ADMIN
 */
exports.updateGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, room, start_time, end_time, days, teacher, course } = req.body;

    if (teacher) {
      const teacherExists = await User.findById(teacher);
      if (!teacherExists || teacherExists.role !== "TEACHER") {
        return next(new AppError("O'qituvchi topilmadi", 404));
      }
    }

    if (course) {
      const courseExists = await Course.findById(course);
      if (!courseExists) {
        return next(new AppError("Kurs topilmadi", 404));
      }
    }

    const group = await Group.findByIdAndUpdate(
      id,
      { title, room, start_time, end_time, days, teacher, course },
      { new: true, runValidators: true }
    )
      .populate("course", "title description")
      .populate("teacher", "firstname lastname email phone");

    if (!group) {
      return next(new AppError("Guruh topilmadi", 404));
    }

    res.status(200).json({
      status: "success",
      data: { group },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add student to group
 * POST /api/v1/groups/:groupId/students/:studentId
 * Restricted to SUPER_ADMIN
 */
exports.addStudentToGroup = async (req, res, next) => {
  try {
    const { groupId, studentId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError("Guruh topilmadi", 404));
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return next(new AppError("Talaba topilmadi", 404));
    }

    // Check if student is already in the group
    if (group.students.includes(studentId)) {
      return next(new AppError("Bu o'quvchi allaqachon aynan mana shu guruhda o'qimoqda!", 400));
    }

    group.students.push(studentId);
    await group.save();

    // 1. Add enrollment tracking
    student.enrollments.push({ group: groupId, joined_at: new Date() });
    await student.save();

    // 2. Prorated Invoice yaratish (haqiqiy kunlar asosida)
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    const dayOfMonth = today.getDate();
    const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    // Oyning haqiqiy kunlari (28/29/30/31)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Bugundan to oy oxirigacha (bugun ham kiritiladi)
    const daysRemaining = daysInMonth - dayOfMonth + 1;

    // Prorated summa: narx / oy kunlari * qolgan kunlar
    const fullPrice = group.price || 0;
    const proratedAmount = dayOfMonth === 1
      ? fullPrice  // Oyning 1-kuni bo'lsa to'liq summa
      : Math.round((fullPrice / daysInMonth) * daysRemaining);

    const existingInvoice = await Invoice.findOne({
      student: studentId,
      group: groupId,
      month: currentMonthStr
    });

    if (!existingInvoice) {
      await Invoice.create({
        student: studentId,
        group: groupId,
        month: currentMonthStr,
        amount: proratedAmount,
        discount: 0,
        final_amount: proratedAmount,
        status: 'UNPAID',
        due_date: today,
        note: dayOfMonth === 1
          ? null
          : `Prorated: ${daysRemaining} kun (${daysInMonth} kunli oyda)`,
      });
    }

    await group.populate([
      { path: "course", select: "title" },
      { path: "teacher", select: "firstname lastname" },
      {
        path: "students",
        populate: {
          path: "user",
          select: "firstname lastname phone",
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      message: "Talaba guruhga muvaffaqiyatli qo'shildi",
      data: {
        group,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove student from group
 * DELETE /api/v1/groups/:groupId/students/:studentId
 * Restricted to SUPER_ADMIN
 */
exports.removeStudentFromGroup = async (req, res, next) => {
  try {
    const { groupId, studentId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError("Guruh topilmadi", 404));
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return next(new AppError("Talaba topilmadi", 404));
    }

    // Check if student is in the group
    if (!group.students.includes(studentId)) {
      return next(new AppError("Bu talaba guruhda mavjud emas", 400));
    }

    group.students = group.students.filter((id) => id.toString() !== studentId);
    await group.save();

    // 7 kunlik imtiyoz (grace period) tekshirish:
    // Agar o'quvchi guruhga qo'shilganidan beri 7 kun o'tmagan bo'lsa — invoice o'chiriladi (DELETE)
    // Aks holda — CANCELLED sifatida saqlanadi (pul bermasdan ketgan)
    const enrollment = student.enrollments?.find(
      en => en.group && en.group.toString() === groupId
    );
    const joinedAt = enrollment?.joined_at ? new Date(enrollment.joined_at) : null;
    const daysSinceJoined = joinedAt
      ? Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceJoined <= 7) {
      // 7 kun ichida o'chirildi → invoice butunlay o'chiriladi (qarzdorlikka hisoblanmaydi)
      await Invoice.deleteMany({
        student: studentId,
        group: groupId,
        status: 'UNPAID',
      });
    } else {
      // 7 kundan oshgan → pul bermay ketgan, CANCELLED sifatida saqlanadi
      const currentMonth = getCurrentMonth();
      await Invoice.updateMany(
        { student: studentId, group: groupId, status: 'UNPAID', month: currentMonth },
        { status: 'CANCELLED' }
      );
    }

    // Remove from enrollment tracking
    student.enrollments = student.enrollments.filter(
      en => en.group && en.group.toString() !== groupId
    );
    await student.save();

    await group.populate([
      { path: "course", select: "title" },
      { path: "teacher", select: "firstname lastname" },
      {
        path: "students",
        populate: {
          path: "user",
          select: "firstname lastname phone",
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      message: "Talaba guruhdan muvaffaqiyatli olib tashlandi",
      data: {
        group,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete group
 * DELETE /api/v1/groups/:id
 * Restricted to SUPER_ADMIN
 */
exports.deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await Group.findByIdAndDelete(id);

    if (!group) {
      return next(new AppError("Guruh topilmadi", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all groups with nested students populated
 * GET /api/v1/groups/students
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.getGroupsWithStudents = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate("course", "title description")
      .populate("teacher", "firstname lastname email phone")
      .populate({
        path: "students",
        populate: {
          path: "user",
          select: "firstname lastname phone email status birthDate",
        },
      });

    res.status(200).json({
      status: "success",
      results: groups.length,
      data: {
        groups,
      },
    });
  } catch (error) {
    next(error);
  }
};
