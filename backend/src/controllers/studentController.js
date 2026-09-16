const Lead = require("../models/Lead");
const Student = require("../models/Student");
const User = require("../models/User");
const AppError = require("../utils/appError");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");
const Exam = require("../models/Exam");
const LessonPlan = require("../models/LessonPlan");
const Group = require("../models/Group");
const Invoice = require("../models/Invoice");


/**
 * Convert Lead to Student (after registration confirmation)
 * POST /api/v1/students/from-lead/:leadId
 * Restricted to SUPER_ADMIN
 */
// Helper to clean and format phone number (+998XXXXXXXXX format)
const cleanPhone = (val) => {
  if (!val) return val;
  let clean = String(val).replace(/[\s\-\(\)]/g, '');
  if (!clean.startsWith('+998')) {
    clean = clean.startsWith('998') ? '+' + clean : '+998' + clean;
  }
  return clean;
};

exports.convertLeadToStudent = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { firstname, lastname, phone, email, password, birthDate, parentPhone } = req.body;

    if (!firstname || !lastname || !phone) {
      return next(new AppError("Iltimos, firstname, lastname va phone ni to'ldiring", 400));
    }

    // Lead mavjudligini tekshirish
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return next(new AppError("Lead topilmadi", 404));
    }

    if (lead.status === "REJECTED") {
      return next(new AppError("Rad qilingan arizalarni studentga aylantirish mumkin emas", 400));
    }

    const formattedPhone = cleanPhone(phone);

    // BirthDate mantig'i
    let resolvedBirthdate = null;
    let resolvedPassword = password;

    const rawBirthDate = birthDate || lead.birthDate;
    if (rawBirthDate) {
      resolvedBirthdate = String(rawBirthDate).replace(/-/g, '');
      resolvedPassword = resolvedBirthdate;
    }

    if (!resolvedPassword) {
      return next(new AppError("Tug'ilgan sana (parol) kiritilishi shart", 400));
    }

    // ✅ ASOSIY TUZATISH: Agar User allaqachon mavjud bo'lsa — qayta yaratmaymiz, mavjudini ishlatamiz
    let user = await User.findOne({ phone: formattedPhone });
    let isNewUser = false;

    if (!user) {
      // Yangi User yaratamiz
      user = await User.create({
        firstname,
        lastname,
        phone: formattedPhone,
        email: email || null,
        password: resolvedPassword,
        role: "STUDENT",
        status: "ACTIVE",
        birthDate: resolvedBirthdate,
      });
      isNewUser = true;
    } else {
      // Mavjud userning ma'lumotlarini yangilaymiz (agar kerak bo'lsa)
      if (resolvedBirthdate && !user.birthDate) {
        user.birthDate = resolvedBirthdate;
        await user.save();
      }
    }

    // Ushbu User uchun Student record allaqachon bormi?
    const existingStudent = await Student.findOne({ user: user._id });

    let student;
    if (existingStudent) {
      // Allaqachon student — Lead ni bog'laymiz
      student = existingStudent;
      if (!student.lead) {
        student.lead = lead._id;
        student.source = lead.source || 'WEBSITE';
        await student.save();
      }
    } else {
      // Yangi Student record yaratamiz
      student = await Student.create({
        user: user._id,
        lead: lead._id,
        source: lead.source || 'WEBSITE',
        joined_date: new Date(),
        status: "ACTIVE",
        parentPhone: parentPhone ? cleanPhone(parentPhone) : null,
      });
    }

    // Leadni o'chirmaymiz, statusini REGISTERED qilamiz
    lead.status = "REGISTERED";
    await lead.save();

    // Populate student data
    await student.populate({
      path: "user",
      select: "firstname lastname phone email role birthDate",
    });

    res.status(201).json({
      status: "success",
      message: "Lead muvaffaqiyatli talabaga aylantirildi",
      data: {
        student,
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          phone: user.phone,
          role: user.role,
          birthDate: user.birthDate,
          isNewUser,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.convertToStudent = exports.convertLeadToStudent;


/**
 * Create a student manually
 * POST /api/v1/students
 * Restricted to SUPER_ADMIN
 */
exports.createStudent = async (req, res, next) => {
  try {
    const { firstname, lastname, phone, email, password, birth_date, birthDate, school, address, source, parentPhone } = req.body;

    if (!firstname || !lastname || !phone || !password || !parentPhone) {
      return next(new AppError("Iltimos, firstname, lastname, phone, password va parentPhone ni to'ldiring", 400));
    }

    const formattedPhone = cleanPhone(phone);

    // Check if user already exists
    const userExists = await User.findOne({ phone: formattedPhone });
    if (userExists) {
      return next(new AppError("Bu telefon raqami bilan foydalanuvchi allaqachon mavjud", 400));
    }

    // Unify birthDate
    const rawBirthDate = birthDate || birth_date;
    let resolvedBirthdate = null;
    if (rawBirthDate) {
      resolvedBirthdate = String(rawBirthDate).replace(/-/g, '');
    }

    // Create User
    const user = await User.create({
      firstname,
      lastname,
      phone: formattedPhone,
      email: email || null,
      password,
      role: "STUDENT",
      status: "ACTIVE",
      birthDate: resolvedBirthdate,
    });

    const formattedParentPhone = parentPhone ? cleanPhone(parentPhone) : null;
    
    // Create Student with parentPhone
    const student = await Student.create({
      user: user._id,
      school: school || null,
      address: address || null,
      source: source || 'WEBSITE',
      parentPhone: formattedParentPhone,
    });

    // Agar group_id berilgan bo'lsa — darhol guruhga qo'shamiz va prorated invoice yaratamiz
    const { group_id } = req.body;
    if (group_id) {
      const group = await Group.findById(group_id);
      if (group) {
        // Guruhga student qo'shish
        if (!group.students.includes(student._id)) {
          group.students.push(student._id);
          await group.save();
        }

        // Enrollment tracking
        student.enrollments = student.enrollments || [];
        student.enrollments.push({ group: group._id, joined_at: new Date() });
        await student.save();

        // Prorated Invoice yaratish
        const today = new Date();
        const yr = today.getFullYear();
        const mn = today.getMonth(); // 0-indexed
        const dayOfMonth = today.getDate();
        const currentMonthStr = `${yr}-${String(mn + 1).padStart(2, '0')}`;
        const daysInMonth = new Date(yr, mn + 1, 0).getDate();
        const daysRemaining = daysInMonth - dayOfMonth + 1;
        const fullPrice = group.price || 0;
        const proratedAmount = dayOfMonth === 1
          ? fullPrice
          : Math.round((fullPrice / daysInMonth) * daysRemaining);

        const existingInvoice = await Invoice.findOne({
          student: student._id,
          group: group._id,
          month: currentMonthStr,
        });

        if (!existingInvoice) {
          await Invoice.create({
            student: student._id,
            group: group._id,
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
      }
    }

    await student.populate({
      path: "user",
      select: "firstname lastname phone email role birthDate",
    });

    res.status(201).json({
      status: "success",
      data: {
        student,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all students
 * GET /api/v1/students
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate({
        path: "user",
        select: "firstname lastname phone email role status birthDate",
      })
      .populate({
        path: "parent",
        select: "firstname lastname phone email",
      });

    res.status(200).json({
      status: "success",
      results: students.length,
      data: {
        students,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single student by ID
 * GET /api/v1/students/:id
 */
exports.getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate({
        path: "user",
        select: "firstname lastname phone email role status birthDate",
      })
      .populate({
        path: "parent",
        select: "firstname lastname phone email",
      });

    if (!student) {
      return next(new AppError("Talaba topilmadi", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        student,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update student
 * PATCH /api/v1/students/:id
 * Restricted to SUPER_ADMIN
 */
exports.updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { birth_date, birthDate, school, address, status, parent, firstname, lastname, phone, groupId, source, parentPhone } = req.body;

    // Find student first to check if they exist and get user reference
    const studentExists = await Student.findById(id);
    if (!studentExists) {
      return next(new AppError("Talaba topilmadi", 404));
    }

    const birthDateInput = birthDate || birth_date;

    // Update associated User if firstname/lastname/birthDate/phone are provided
    if ((firstname !== undefined || lastname !== undefined || birthDateInput !== undefined || phone !== undefined) && studentExists.user) {
      const userUpdate = {};
      if (firstname) userUpdate.firstname = firstname;
      if (lastname) userUpdate.lastname = lastname;
      if (birthDateInput) {
        userUpdate.birthDate = String(birthDateInput).replace(/-/g, '');
      }
      if (phone) {
        const formattedPhone = cleanPhone(phone);
        const existingUser = await User.findOne({ phone: formattedPhone, _id: { $ne: studentExists.user } });
        if (existingUser) {
          return next(new AppError("Bu telefon raqami boshqa foydalanuvchiga tegishli", 400));
        }
        userUpdate.phone = formattedPhone;
      }
      await User.findByIdAndUpdate(studentExists.user, userUpdate, { runValidators: true });
    }

    // Handle group change if groupId is provided (can be a string group ID or empty string to unassign)
    const Group = require("../models/Group");
    if (groupId !== undefined) {
      // First, remove student from all current groups
      await Group.updateMany({ students: id }, { $pull: { students: id } });

      // If a valid new group ID is provided, add the student to that group
      if (groupId) {
        const targetGroup = await Group.findById(groupId);
        if (!targetGroup) {
          return next(new AppError("Belgilangan yangi guruh topilmadi", 404));
        }
        if (!targetGroup.students.map(sId => sId.toString()).includes(id.toString())) {
          targetGroup.students.push(id);
          await targetGroup.save();
        }
      }
    }

    const studentUpdate = { school, address, status, parent };
    if (source) studentUpdate.source = source;
    if (parentPhone) studentUpdate.parentPhone = cleanPhone(parentPhone);

    const student = await Student.findByIdAndUpdate(
      id,
      studentUpdate,
      { new: true, runValidators: true }
    )
      .populate({
        path: "user",
        select: "firstname lastname phone email role birthDate",
      })
      .populate({
        path: "parent",
        select: "firstname lastname phone email",
      });

    res.status(200).json({
      status: "success",
      data: {
        student,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete student
 * DELETE /api/v1/students/:id
 * Restricted to SUPER_ADMIN
 */
exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return next(new AppError("Talaba topilmadi", 404));
    }

    // Cascade delete associated User record
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }

    // Clean up student from all groups
    const Group = require("../models/Group");
    await Group.updateMany({ students: id }, { $pull: { students: id } });

    // Cascade delete UNPAID invoices
    const Invoice = require("../models/Invoice");
    await Invoice.deleteMany({ student: id, status: 'UNPAID' });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get registered students (from leads)
 * GET /api/v1/students/registered-only
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.getRegisteredStudents = async (req, res, next) => {
  try {
    const Group = require('../models/Group');

    // Barcha guruhlardagi o'quvchilar ID'larini yig'amiz
    // Bu — haqiqiy manba (enrollments ishonchsiz, eski ma'lumotlarda bo'sh bo'lishi mumkin)
    const allGroups = await Group.find({}, { students: 1 });
    const enrolledStudentIds = new Set();
    for (const group of allGroups) {
      for (const sid of (group.students || [])) {
        enrolledStudentIds.add(sid.toString());
      }
    }

    // Lead'i bor va hali birorta guruhga qo'shilmagan o'quvchilarni topamiz
    const allLeadStudents = await Student.find({ lead: { $ne: null } })
      .populate({
        path: 'user',
        select: 'firstname lastname phone email role status birthDate',
      })
      .populate({
        path: 'lead',
        select: 'fullname phone course source',
      });

    // Guruhda borlarni chiqarib tashlaymiz
    const students = allLeadStudents.filter(
      (s) => !enrolledStudentIds.has(s._id.toString())
    );

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: { students },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign student to group
 * POST /api/v1/students/:studentId/assign-group/:groupId
 * Restricted to SUPER_ADMIN
 */
exports.assignStudentToGroup = async (req, res, next) => {
  try {
    const { studentId, groupId } = req.params;

    const student = await Student.findById(studentId).populate("user");
    if (!student) {
      return next(new AppError("Talaba topilmadi", 404));
    }

    const Group = require("../models/Group");
    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError("Guruh topilmadi", 404));
    }

    // Check if student is already in the group
    if (group.students.includes(studentId)) {
      return next(new AppError("Bu talaba allaqachon guruhga qo'shilgan", 400));
    }

    // Add student to group
    group.students.push(studentId);
    await group.save();

    // Enrollment tracking
    student.enrollments = student.enrollments || [];
    const alreadyEnrolled = student.enrollments.some(
      en => en.group && en.group.toString() === groupId.toString()
    );
    if (!alreadyEnrolled) {
      student.enrollments.push({ group: group._id, joined_at: new Date() });
      await student.save();
    }

    // Prorated Invoice yaratish (createStudent bilan bir xil mantiq)
    const today = new Date();
    const yr = today.getFullYear();
    const mn = today.getMonth(); // 0-indexed
    const dayOfMonth = today.getDate();
    const currentMonthStr = `${yr}-${String(mn + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(yr, mn + 1, 0).getDate();
    const daysRemaining = daysInMonth - dayOfMonth + 1;
    const fullPrice = group.price || 0;
    const proratedAmount = dayOfMonth === 1
      ? fullPrice
      : Math.round((fullPrice / daysInMonth) * daysRemaining);

    const existingInvoice = await Invoice.findOne({
      student: student._id,
      group: group._id,
      month: currentMonthStr,
    });

    if (!existingInvoice) {
      await Invoice.create({
        student: student._id,
        group: group._id,
        month: currentMonthStr,
        amount: proratedAmount,
        discount: 0,
        final_amount: proratedAmount,
        status: 'UNPAID',
        due_date: today,
        invoice_type: dayOfMonth === 1 ? 'FULL' : 'PRORATED',
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
        prorated_invoice: {
          month: currentMonthStr,
          amount: proratedAmount,
          days_remaining: daysRemaining,
          is_prorated: dayOfMonth !== 1,
        },
        credentials: {
          phone: student.user.phone,
          note: "Parol studentning email yoki SMS orqali yuboriladi",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's assigned groups
 * GET /api/v1/students/my-groups
 * Protected - Students can see their own groups
 */
exports.getMyGroups = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find student by user ID
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return next(new AppError("Talaba ma'lumoti topilmadi", 404));
    }

    // Find groups that contain this student
    const Group = require("../models/Group");
    const Invoice = require("../models/Invoice");

    const groups = await Group.find({ students: student._id })
      .populate("course", "title description duration")
      .populate("teacher", "firstname lastname email phone avatar")
      .lean(); // lean() for plain objects so we can add custom fields

    // Joriy oy
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Har guruh uchun invoice statusini qo'shamiz
    const groupsWithInvoice = await Promise.all(
      groups.map(async (group) => {
        const invoice = await Invoice.findOne({
          student: student._id,
          group: group._id,
          month: currentMonth,
        });

        let invoiceInfo = null;
        if (invoice) {
          const dueDate = new Date(invoice.due_date);
          const diffMs = dueDate - now;
          const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          invoiceInfo = {
            _id: invoice._id,
            status: invoice.status,
            amount: invoice.final_amount || invoice.amount,
            due_date: invoice.due_date,
            paid_at: invoice.paid_at,
            days_until_due: daysUntilDue,
            is_overdue: daysUntilDue < 0,
            // 5 kun yoki undan kam qoldi va hali to'lanmagan
            needs_attention: daysUntilDue <= 5 && invoice.status === 'UNPAID',
          };
        } else {
          // Invoice hali yaratilmagan — guruh narxini ko'rsatamiz
          invoiceInfo = {
            status: 'NO_INVOICE',
            amount: group.price || 0,
            due_date: null,
            days_until_due: null,
            is_overdue: false,
            needs_attention: false,
          };
        }

        return { ...group, invoice: invoiceInfo };
      })
    );

    res.status(200).json({
      status: "success",
      results: groupsWithInvoice.length,
      data: {
        groups: groupsWithInvoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available students (who are active and not currently assigned to any group)
 * Optionally filtered by course/subject ID if provided (matching their lead's course interest)
 * GET /api/v1/students/available
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.getAvailableStudents = async (req, res, next) => {
  try {
    const { subjectId } = req.query;

    // Find all groups to get assigned students
    const Group = require("../models/Group");
    const groups = await Group.find({}, "students");
    const assignedStudentIds = [];
    groups.forEach((g) => {
      if (g.students) {
        g.students.forEach((sId) => {
          if (sId) assignedStudentIds.push(sId.toString());
        });
      }
    });

    // Build query for students not in any group
    const studentQuery = {
      _id: { $nin: assignedStudentIds },
      status: "ACTIVE"
    };

    let students = await Student.find(studentQuery)
      .populate({
        path: "user",
        select: "firstname lastname phone email status birthDate"
      })
      .populate("lead");

    // Filter by subject/course if subjectId is provided
    if (subjectId) {
      const Course = require("../models/Course");
      const course = await Course.findById(subjectId);
      if (course) {
        students = students.filter(student => {
          // Keep manually created students (no lead/no course preference) as general candidates
          if (!student.lead || !student.lead.course) return true;
          
          const leadCourseName = student.lead.course.toLowerCase();
          const targetCourseName = course.title.toLowerCase();
          return leadCourseName.includes(targetCourseName) || targetCourseName.includes(leadCourseName);
        });
      }
    }

    res.status(200).json({
      status: "success",
      results: students.length,
      data: {
        students
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student performance (grades and attendance) compared to last week
 * GET /api/student/performance
 * GET /api/v1/students/performance
 * Restricted to STUDENT
 */
exports.getStudentPerformance = async (req, res, next) => {
  try {
    // 1) Find student profile corresponding to the logged in user
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return next(new AppError("Talaba profili topilmadi", 404));
    }

    const Grade = require("../models/Grade");
    const Attendance = require("../models/Attendance");

    // 2) Define date ranges for current week (last 7 days) and previous week (7 to 14 days ago)
    const now = new Date();
    const currentWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 3) Fetch grades
    const currentWeekGrades = await Grade.find({
      student: student._id,
      date: { $gte: currentWeekStart, $lte: now }
    });

    const previousWeekGrades = await Grade.find({
      student: student._id,
      date: { $gte: previousWeekStart, $lt: currentWeekStart }
    });

    // 4) Fetch attendance
    const currentWeekAttendance = await Attendance.find({
      student: student._id,
      date: { $gte: currentWeekStart, $lte: now }
    });

    const previousWeekAttendance = await Attendance.find({
      student: student._id,
      date: { $gte: previousWeekStart, $lt: currentWeekStart }
    });

    // 5) Calculate grade metrics
    const avgGradeCurrent = currentWeekGrades.length > 0
      ? (currentWeekGrades.reduce((sum, g) => sum + g.value, 0) / currentWeekGrades.length)
      : 0;

    const avgGradePrevious = previousWeekGrades.length > 0
      ? (previousWeekGrades.reduce((sum, g) => sum + g.value, 0) / previousWeekGrades.length)
      : 0;

    let gradeChangePercent = 0;
    if (avgGradePrevious > 0) {
      gradeChangePercent = ((avgGradeCurrent - avgGradePrevious) / avgGradePrevious) * 100;
    } else if (avgGradePrevious === 0 && avgGradeCurrent > 0) {
      gradeChangePercent = 100;
    }

    // 6) Calculate attendance metrics
    const getAttendanceRate = (records) => {
      if (records.length === 0) return 0;
      const attended = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      return (attended / records.length) * 100;
    };

    const attendanceRateCurrent = getAttendanceRate(currentWeekAttendance);
    const attendanceRatePrevious = getAttendanceRate(previousWeekAttendance);

    let attendanceChangePercent = 0;
    if (attendanceRatePrevious > 0) {
      attendanceChangePercent = ((attendanceRateCurrent - attendanceRatePrevious) / attendanceRatePrevious) * 100;
    } else if (attendanceRatePrevious === 0 && attendanceRateCurrent > 0) {
      attendanceChangePercent = 100;
    }

    // Round values to 2 decimal places
    const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    res.status(200).json({
      status: "success",
      data: {
        performance: {
          grades: {
            currentWeekAverage: roundToTwo(avgGradeCurrent),
            previousWeekAverage: roundToTwo(avgGradePrevious),
            changePercent: roundToTwo(gradeChangePercent),
            changeFormatted: (gradeChangePercent >= 0 ? "+" : "") + roundToTwo(gradeChangePercent) + "%"
          },
          attendance: {
            currentWeekRate: roundToTwo(attendanceRateCurrent),
            previousWeekRate: roundToTwo(attendanceRatePrevious),
            changePercent: roundToTwo(attendanceChangePercent),
            changeFormatted: (attendanceChangePercent >= 0 ? "+" : "") + roundToTwo(attendanceChangePercent) + "%"
          }
        },
        records: {
          currentWeekGrades,
          currentWeekAttendance
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: resolve Student doc from req.user._id (STUDENT role)
 * Ensures strict per-user isolation — no other student's data can be fetched.
 */
const resolveStudent = async (userId, next) => {
  const student = await Student.findOne({ user: userId });
  if (!student) {
    next(new AppError("Talaba ma'lumoti topilmadi", 404));
    return null;
  }
  return student;
};

/**
 * Get student's own attendance records (all groups, newest first)
 * GET /api/v1/students/my-attendance
 * Protected — STUDENT only. Filters strictly by resolved student._id.
 */
exports.getMyAttendance = async (req, res, next) => {
  try {
    const student = await resolveStudent(req.user._id, next);
    if (!student) return;

    const records = await Attendance.find({ student: student._id })
      .populate({ path: "group", select: "title start_time end_time days" })
      .sort({ date: -1 });

    res.status(200).json({
      status: "success",
      results: records.length,
      data: { attendance: records },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's own grades (all groups, newest first)
 * GET /api/v1/students/my-grades
 * Protected — STUDENT only.
 */
exports.getMyGrades = async (req, res, next) => {
  try {
    const student = await resolveStudent(req.user._id, next);
    if (!student) return;

    const grades = await Grade.find({ student: student._id })
      .populate({ path: "group", select: "title" })
      .sort({ date: -1 });

    res.status(200).json({
      status: "success",
      results: grades.length,
      data: { grades },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's upcoming and past exams (via their groups).
 * GET /api/v1/students/my-exams
 * Protected — STUDENT only.
 * Only this student's own score is included in the response, not all results.
 */
exports.getMyExams = async (req, res, next) => {
  try {
    const student = await resolveStudent(req.user._id, next);
    if (!student) return;

    const groups = await Group.find({ students: student._id }).select("_id");
    const groupIds = groups.map((g) => g._id);

    const exams = await Exam.find({ group: { $in: groupIds } })
      .populate({ path: "group", select: "title" })
      .sort({ date: 1 });

    // Expose only this student's own result score
    const examsWithMyResult = exams.map((exam) => {
      const myResult = exam.results.find(
        (r) => r.student && r.student.toString() === student._id.toString()
      );
      return {
        _id: exam._id,
        name: exam.name,
        date: exam.date,
        group: exam.group,
        myScore: myResult ? myResult.score : null,
      };
    });

    res.status(200).json({
      status: "success",
      results: examsWithMyResult.length,
      data: { exams: examsWithMyResult },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's homework assignments (via LessonPlans for their groups)
 * GET /api/v1/students/my-homework
 * Protected — STUDENT only.
 */
exports.getMyHomework = async (req, res, next) => {
  try {
    const student = await resolveStudent(req.user._id, next);
    if (!student) return;

    const groups = await Group.find({ students: student._id }).select("_id");
    const groupIds = groups.map((g) => g._id);

    const lessonPlans = await LessonPlan.find({
      group: { $in: groupIds },
      homeworkDetails: { $exists: true, $ne: "" },
    })
      .populate({ path: "group", select: "title" })
      .select("group topic homeworkDetails homeworkDeadline date materials")
      .sort({ date: -1 })
      .lean();

    const HomeworkSubmission = require("../models/HomeworkSubmission");
    const submissions = await HomeworkSubmission.find({
      student: student._id,
      lessonPlan: { $in: lessonPlans.map((lp) => lp._id) },
    }).lean();

    const submissionMap = {};
    submissions.forEach((sub) => {
      submissionMap[sub.lessonPlan.toString()] = sub;
    });

    const homeworkWithSubmissions = lessonPlans.map((lp) => ({
      ...lp,
      submission: submissionMap[lp._id.toString()] || null,
    }));

    res.status(200).json({
      status: "success",
      results: homeworkWithSubmissions.length,
      data: { homework: homeworkWithSubmissions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's lesson materials (LessonPlans with uploaded files, for their groups)
 * GET /api/v1/students/my-materials
 * Protected — STUDENT only.
 */
exports.getMyMaterials = async (req, res, next) => {
  try {
    const student = await resolveStudent(req.user._id, next);
    if (!student) return;

    const groups = await Group.find({ students: student._id }).select("_id");
    const groupIds = groups.map((g) => g._id);

    const lessonPlans = await LessonPlan.find({
      group: { $in: groupIds },
      "materials.0": { $exists: true }, // Only plans that have at least 1 material
    })
      .populate({ path: "group", select: "title" })
      .select("group topic materials date")
      .sort({ date: -1 });

    res.status(200).json({
      status: "success",
      results: lessonPlans.length,
      data: { materials: lessonPlans },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student Profile (All details + Enrollments + optionally Grades if Teacher)
 * GET /api/v1/students/:id/profile
 */
exports.getStudentProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate('user', '-password')
      .populate({
        path: 'enrollments.group',
        select: 'title course teacher price',
        populate: [
          { path: 'course', select: 'title' },
          { path: 'teacher', select: 'firstname lastname phone' }
        ]
      });

    if (!student) {
      return next(new AppError("Talaba topilmadi", 404));
    }

    // 1. Get legacy groups (groups the student is in, but not in enrollments array)
    const allGroups = await Group.find({ students: student._id })
      .populate('course', 'title')
      .populate('teacher', 'firstname lastname phone');

    // 2. Map enrollments by group ID for quick lookup
    const enrollmentMap = {};
    if (student.enrollments && student.enrollments.length > 0) {
      student.enrollments.forEach(en => {
        if (en.group && en.group._id) {
          enrollmentMap[en.group._id.toString()] = en.joined_at;
        }
      });
    }

    // 3. Build unified groups array
    const studentGroups = allGroups.map(g => ({
      group: g,
      joined_at: enrollmentMap[g._id.toString()] || student.joined_date || student.createdAt
    }));

    const data = {
      student,
      groups: studentGroups,
      grades: []
    };
    if (req.user && req.user.role === 'TEACHER') {
      const teacherGroups = await Group.find({ teacher: req.user._id, students: student._id }).select('_id title');
      const teacherGroupIds = teacherGroups.map(g => g._id);

      if (teacherGroupIds.length > 0) {
        const grades = await Grade.find({
          student: student._id,
          group: { $in: teacherGroupIds }
        })
        .populate('lesson', 'title date')
        .populate('group', 'title')
        .sort({ createdAt: -1 });

        data.grades = grades;
      }
    }

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student's own Invoice/payment history
 * GET /api/v1/students/my-invoices?month=2026-07
 * Protected (STUDENT only)
 */
exports.getMyInvoices = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(200).json({
        status: 'success',
        data: { invoices: [] }
      });
    }

    const query = { student: student._id };
    if (req.query.month) {
      query.month = req.query.month;
    }

    const invoices = await Invoice.find(query)
      .populate({
        path: 'group',
        select: 'title',
        populate: { path: 'course', select: 'title' }
      })
      .sort({ month: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { 
        invoices,
        joinedDate: student.joined_date || student.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Homework
 * POST /api/v1/students/homework/:lessonPlanId
 * Protected (STUDENT only)
 */
exports.submitHomework = async (req, res, next) => {
  try {
    const student = await resolveStudent(req.user._id, next);
    if (!student) return;

    const { lessonPlanId } = req.params;
    const { studentNote } = req.body;
    const HomeworkSubmission = require("../models/HomeworkSubmission");
    const LessonPlan = require("../models/LessonPlan");

    // Check if lesson plan exists
    const lessonPlan = await LessonPlan.findById(lessonPlanId);
    if (!lessonPlan) {
      return next(new AppError("Dars rejasi topilmadi", 404));
    }

    // Process uploaded files
    let submittedFiles = [];
    if (req.files && req.files.length > 0) {
      submittedFiles = req.files.map(file => `/uploads/homework-submissions/${file.filename}`);
    }

    // Check if submission already exists
    let submission = await HomeworkSubmission.findOne({
      lessonPlan: lessonPlanId,
      student: student._id
    });

    if (submission) {
      // Update existing submission
      if (studentNote) submission.studentNote = studentNote;
      if (submittedFiles.length > 0) {
        submission.submittedFiles = [...submission.submittedFiles, ...submittedFiles];
      }
      // If resubmitting, we can set status back to PENDING if it was GRADED, or keep it.
      // Usually resubmitting means it needs grading again.
      submission.status = "PENDING";
      submission.submittedAt = Date.now();
      await submission.save();
    } else {
      // Create new submission
      submission = await HomeworkSubmission.create({
        lessonPlan: lessonPlanId,
        student: student._id,
        submittedFiles,
        studentNote,
        status: new Date() > new Date(lessonPlan.homeworkDeadline) ? "LATE_SUBMISSION" : "PENDING"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Uyga vazifa muvaffaqiyatli yuborildi",
      data: {
        submission
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 2 va undan ko'p marta dars qoldirgan o'quvchilar ro'yxati
 * GET /api/v1/students/frequent-absentees?minAbsences=2&days=30
 * SUPER_ADMIN, MANAGER
 */
exports.getFrequentAbsentees = async (req, res, next) => {
  try {
    const Attendance = require('../models/Attendance');

    const minAbsences = parseInt(req.query.minAbsences) || 2;
    const days = parseInt(req.query.days) || 30; // so'nggi necha kun

    // So'nggi N kun oralig'ini aniqlaymiz
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    fromDate.setHours(0, 0, 0, 0);

    // ABSENT yozuvlarini student+group bo'yicha guruhlаб sanab chiqamiz
    const absentGroups = await Attendance.aggregate([
      {
        $match: {
          status: 'ABSENT',
          date: { $gte: fromDate }
        }
      },
      {
        $group: {
          _id: '$student',
          totalAbsences: { $sum: 1 },
          groups: { $addToSet: '$group' },
          lastAbsentDate: { $max: '$date' },
          absentDates: { $push: '$date' }
        }
      },
      {
        $match: { totalAbsences: { $gte: minAbsences } }
      },
      {
        $sort: { totalAbsences: -1 }
      }
    ]);

    if (absentGroups.length === 0) {
      return res.status(200).json({
        status: 'success',
        count: 0,
        data: { absentees: [] }
      });
    }

    // Student ID'larini olib, batafsil ma'lumot yuklaymiz
    const studentIds = absentGroups.map(a => a._id);

    const students = await Student.find({ _id: { $in: studentIds } })
      .populate({ path: 'user', select: 'firstname lastname phone status' })
      .populate({ path: 'enrollments.group', select: 'title' })
      .select('user parentPhone enrollments status');

    // Guruh modelini chiqarish uchun
    const Group = require('../models/Group');

    // Ma'lumotlarni birlashtirish
    const absentees = absentGroups.map(ag => {
      const student = students.find(s => s._id.toString() === ag._id.toString());
      if (!student) return null;

      // Oxirgi N kun ichidagi absent sanalarini saralash
      const sortedDates = (ag.absentDates || [])
        .sort((a, b) => new Date(b) - new Date(a))
        .slice(0, 10) // faqat so'nggi 10 ta
        .map(d => new Date(d).toLocaleDateString('uz-UZ'));

      return {
        _id: student._id,
        student: {
          _id: student._id,
          user: student.user,
          parentPhone: student.parentPhone,
          enrollments: student.enrollments,
          status: student.status
        },
        totalAbsences: ag.totalAbsences,
        lastAbsentDate: ag.lastAbsentDate,
        recentAbsentDates: sortedDates,
        groupIds: ag.groups
      };
    }).filter(Boolean);

    res.status(200).json({
      status: 'success',
      count: absentees.length,
      data: { absentees }
    });
  } catch (error) {
    next(error);
  }
};

