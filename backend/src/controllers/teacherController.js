const User = require("../models/User");
const Group = require("../models/Group");
const AppError = require("../utils/appError");

/**
 * Create a new teacher manually
 * POST /api/v1/teachers
 * Restricted to SUPER_ADMIN
 */
exports.createTeacher = async (req, res, next) => {
  try {
    const { firstname, lastname, phone, email, password, education, bio, status, subject, scoreType, score, experience, studentsCount, telegram } = req.body;

    if (!firstname || !lastname || !phone || !password) {
      return next(new AppError("Iltimos, firstname, lastname, phone, password ni to'ldiring", 400));
    }

    // Check if user already exists
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return next(new AppError("Bu telefon raqami bilan foydalanuvchi allaqachon mavjud", 400));
    }

    // Handle file upload
    let avatarPath = null;
    if (req.file) {
      avatarPath = `/uploads/teachers/${req.file.filename}`;
    }

    // Create User
    const teacher = await User.create({
      firstname,
      lastname,
      phone,
      email: email || null,
      password,
      role: "TEACHER",
      status: status || "ACTIVE",
      education: education || null,
      bio: bio || null,
      subject: subject || null,
      scoreType: scoreType || null,
      score: score || null,
      experience: experience || null,
      studentsCount: studentsCount || null,
      telegram: telegram || null,
      avatar: avatarPath
    });

    // Remove password from response
    teacher.password = undefined;

    res.status(201).json({
      status: "success",
      data: {
        teacher,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all teachers
 * GET /api/v1/teachers
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: "TEACHER" });

    res.status(200).json({
      status: "success",
      results: teachers.length,
      data: {
        teachers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single teacher by ID
 * GET /api/v1/teachers/:id
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const teacher = await User.findOne({ _id: id, role: "TEACHER" });

    if (!teacher) {
      return next(new AppError("O'qituvchi topilmadi", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        teacher,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update teacher details
 * PATCH /api/v1/teachers/:id
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, phone, email, education, bio, subject, scoreType, score, experience, studentsCount, telegram } = req.body;

    // Check unique phone if updated
    if (phone) {
      const existingUser = await User.findOne({ phone, _id: { $ne: id } });
      if (existingUser) {
        return next(new AppError("Bu telefon raqami bilan foydalanuvchi allaqachon mavjud", 400));
      }
    }

    const updateData = { firstname, lastname, phone, email, education, bio, subject, scoreType, score, experience, studentsCount, telegram };

    if (req.file) {
      updateData.avatar = `/uploads/teachers/${req.file.filename}`;
    }

    const teacher = await User.findOneAndUpdate(
      { _id: id, role: "TEACHER" },
      updateData,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return next(new AppError("O'qituvchi topilmadi", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        teacher,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update teacher status
 * PATCH /api/v1/teachers/:id/status
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.updateTeacherStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "INACTIVE", "BANNED"].includes(status)) {
      return next(new AppError("Iltimos, to'g'ri statusni kiriting (ACTIVE, INACTIVE, BANNED)", 400));
    }

    const teacher = await User.findOneAndUpdate(
      { _id: id, role: "TEACHER" },
      { status },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return next(new AppError("O'qituvchi topilmadi", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        teacher,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change teacher password
 * PATCH /api/v1/teachers/:id/password
 * Restricted to SUPER_ADMIN
 */
exports.changeTeacherPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return next(new AppError("Parol kamida 6 ta belgidan iborat bo'lishi kerak", 400));
    }

    const teacher = await User.findOne({ _id: id, role: "TEACHER" });

    if (!teacher) {
      return next(new AppError("O'qituvchi topilmadi", 404));
    }

    // Set new password (this triggers the pre-save bcrypt hook in User model)
    teacher.password = password;
    await teacher.save();

    teacher.password = undefined;

    res.status(200).json({
      status: "success",
      message: "O'qituvchi paroli muvaffaqiyatli o'zgartirildi",
      data: {
        teacher,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete teacher
 * DELETE /api/v1/teachers/:id
 * Restricted to SUPER_ADMIN
 */
exports.deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the teacher exists
    const teacher = await User.findOne({ _id: id, role: "TEACHER" });
    if (!teacher) {
      return next(new AppError("O'qituvchi topilmadi", 404));
    }

    // Check if the teacher is assigned to any groups
    const assignedGroups = await Group.find({ teacher: id });
    if (assignedGroups.length > 0) {
      return next(
        new AppError(
          `Ushbu o'qituvchini o'chirib bo'lmaydi, chunki u ${assignedGroups.length} ta guruhga biriktirilgan.`,
          400
        )
      );
    }

    await User.findByIdAndDelete(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active teachers for public website
 * GET /api/v1/teachers/public
 * Public / Unprotected
 */
exports.getPublicTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: "TEACHER", status: "ACTIVE" })
      .select("firstname lastname education bio avatar subject scoreType score experience studentsCount telegram");

    res.status(200).json({
      status: "success",
      results: teachers.length,
      data: {
        teachers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record bulk student attendance for a group meeting
 * POST /api/v1/teachers/attendance
 * Restricted to TEACHER, SUPER_ADMIN
 */
exports.recordGroupAttendance = async (req, res, next) => {
  try {
    const { group, date, records } = req.body;
    if (!group || !date || !Array.isArray(records)) {
      return next(new AppError("Iltimos, guruh, sana va davomat yozuvlarini (records) kiriting", 400));
    }

    const Attendance = require("../models/Attendance");
    const results = [];
    const attendanceDate = new Date(date);

    for (const rec of records) {
      if (!rec.student || !rec.status) continue;

      // Upsert attendance record for the student in the group on the specified date
      const attend = await Attendance.findOneAndUpdate(
        { student: rec.student, group: group, date: attendanceDate },
        { status: rec.status, reason: rec.reason || '' },
        { new: true, upsert: true, runValidators: true }
      );
      results.push(attend);
    }

    res.status(200).json({
      status: "success",
      message: "Davomat muvaffaqiyatli saqlandi",
      data: {
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record bulk student grades/marks for a group topic
 * POST /api/v1/teachers/grades
 * Restricted to TEACHER, SUPER_ADMIN
 */
exports.recordGroupGrades = async (req, res, next) => {
  try {
    const { group, topic, date, records } = req.body;
    if (!group || !topic || !Array.isArray(records)) {
      return next(new AppError("Iltimos, guruh, mavzu va baholarni (records) kiriting", 400));
    }

    const Grade = require("../models/Grade");
    const results = [];
    const gradeDate = date ? new Date(date) : new Date();

    for (const rec of records) {
      if (!rec.student || rec.value === undefined) continue;

      // Upsert grade for the student in the group on the specified topic and date
      const grade = await Grade.findOneAndUpdate(
        { student: rec.student, group: group, topic: topic, date: gradeDate },
        { value: rec.value },
        { new: true, upsert: true, runValidators: true }
      );
      results.push(grade);
    }

    res.status(200).json({
      status: "success",
      message: "Baholar muvaffaqiyatli saqlandi",
      data: {
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record bulk exam results for a group exam
 * POST /api/v1/teachers/exams
 * Restricted to TEACHER, SUPER_ADMIN
 */
exports.recordExamResults = async (req, res, next) => {
  try {
    const { group, name, date, results } = req.body;
    if (!group || !name || !date || !Array.isArray(results)) {
      return next(new AppError("Iltimos, guruh, imtihon nomi, sana va natijalarni (results) kiriting", 400));
    }

    const Exam = require("../models/Exam");

    // Upsert the exam document for this group and exam name on the date
    const exam = await Exam.findOneAndUpdate(
      { group, name, date: new Date(date) },
      { results },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      message: "Imtihon natijalari muvaffaqiyatli saqlandi",
      data: {
        exam,
      },
    });
  } catch (error) {
    next(error);
  }
};
