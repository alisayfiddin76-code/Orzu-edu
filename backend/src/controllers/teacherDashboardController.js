const Group = require("../models/Group");
const LessonPlan = require("../models/LessonPlan");
const HomeworkSubmission = require("../models/HomeworkSubmission");
const Exam = require("../models/Exam");
const AppError = require("../utils/appError");

/**
 * Get dashboard summary for teacher (Today's classes, unchecked homework count, 12-hour deadline alerts, upcoming exams)
 * GET /api/teacher/dashboard/summary
 * Restricted to TEACHER, SUPER_ADMIN
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    // 1) Find all groups assigned to this teacher
    const teacherGroups = await Group.find({ teacher: teacherId });
    const groupIds = teacherGroups.map((g) => g._id);

    // 2) Get today's classes schedule
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    let targetDays = [];
    
    // Monday, Wednesday, Friday are ODD days. Tuesday, Thursday, Saturday are EVEN.
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      targetDays = ["ODD", "EVERYDAY"];
    } else if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
      targetDays = ["EVEN", "EVERYDAY"];
    }

    let todaysClasses = [];
    if (targetDays.length > 0) {
      todaysClasses = await Group.find({
        _id: { $in: groupIds },
        days: { $in: targetDays },
      }).populate("course", "title duration price");
    }

    // 3) Find all lesson plans in the teacher's groups
    const lessonPlans = await LessonPlan.find({ group: { $in: groupIds } });
    const lessonPlanIds = lessonPlans.map((lp) => lp._id);

    // 4) Count unchecked homework submissions
    const pendingHomeworksCount = await HomeworkSubmission.countDocuments({
      lessonPlan: { $in: lessonPlanIds },
      status: "PENDING",
    });

    // 5) Check for 12-Hour Deadline alert
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const overdueLessonPlans = await LessonPlan.find({
      group: { $in: groupIds },
      homeworkDeadline: { $lte: twelveHoursAgo },
    });
    const overdueLpIds = overdueLessonPlans.map((lp) => lp._id);

    const hasPendingOverdue = await HomeworkSubmission.exists({
      lessonPlan: { $in: overdueLpIds },
      status: "PENDING",
    });
    const showHomeworkAlert = !!hasPendingOverdue;

    // 6) Get upcoming exams for the teacher's groups
    const upcomingExams = await Exam.find({
      group: { $in: groupIds },
      date: { $gte: new Date() },
    })
      .populate("group", "title")
      .sort({ date: 1 });

    res.status(200).json({
      status: "success",
      data: {
        summary: {
          todaysClassesCount: todaysClasses.length,
          pendingHomeworksCount,
          showHomeworkAlert,
          upcomingExamsCount: upcomingExams.length,
        },
        todaysClasses,
        upcomingExams,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Lesson Plan (Upload materials and details)
 * POST /api/teacher/dashboard/lesson-plans
 * Restricted to TEACHER, SUPER_ADMIN
 */
exports.createLessonPlan = async (req, res, next) => {
  try {
    const { group, topic, homeworkDetails, homeworkDeadline } = req.body;

    if (!group || !topic || !homeworkDetails || !homeworkDeadline) {
      return next(
        new AppError(
          "Iltimos, guruh, dars mavzusi, uyga vazifa tavsifi va muddatini kiriting",
          400
        )
      );
    }

    // Check if group belongs to this teacher or user is SUPER_ADMIN
    if (req.user.role !== "SUPER_ADMIN") {
      const targetGroup = await Group.findById(group);
      if (!targetGroup || targetGroup.teacher.toString() !== req.user._id.toString()) {
        return next(new AppError("Ushbu guruh uchun dars rejasi yaratish huquqiga ega emassiz", 403));
      }
    }

    const materials = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        materials.push(`/uploads/lesson-plans/${file.filename}`);
      });
    }

    const lessonPlan = await LessonPlan.create({
      group,
      topic,
      materials,
      homeworkDetails,
      homeworkDeadline: new Date(homeworkDeadline),
      date: new Date(),
    });

    res.status(201).json({
      status: "success",
      message: "Dars rejasi muvaffaqiyatli saqlandi",
      data: {
        lessonPlan,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get lesson plans history for a specific group
 * GET /api/teacher/dashboard/groups/:groupId/lesson-plans
 * Restricted to TEACHER, SUPER_ADMIN
 */
exports.getGroupLessonPlans = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // Check if group belongs to this teacher or user is SUPER_ADMIN
    if (req.user.role !== "SUPER_ADMIN") {
      const targetGroup = await Group.findById(groupId);
      if (!targetGroup || targetGroup.teacher.toString() !== req.user._id.toString()) {
        return next(new AppError("Ushbu guruh ma'lumotlarini ko'rish huquqiga ega emassiz", 403));
      }
    }

    const lessonPlans = await LessonPlan.find({ group: groupId }).sort({ date: -1 });

    res.status(200).json({
      status: "success",
      results: lessonPlans.length,
      data: {
        lessonPlans,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pending (unchecked) homework submissions for the teacher's groups
 * GET /api/teacher/dashboard/homework-submissions/pending
 * Restricted to TEACHER, SUPER_ADMIN
 */
exports.getPendingSubmissions = async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    const groups = await Group.find({ teacher: teacherId });
    const groupIds = groups.map((g) => g._id);

    const lessonPlans = await LessonPlan.find({ group: { $in: groupIds } });
    const lessonPlanIds = lessonPlans.map((lp) => lp._id);

    const pendingSubmissions = await HomeworkSubmission.find({
      lessonPlan: { $in: lessonPlanIds },
      status: "PENDING",
    })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "firstname lastname phone",
        },
      })
      .populate({
        path: "lessonPlan",
        select: "topic homeworkDetails group homeworkDeadline",
        populate: {
          path: "group",
          select: "title",
        },
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: "success",
      results: pendingSubmissions.length,
      data: {
        submissions: pendingSubmissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Grade a student's homework submission
 * POST /api/teacher/dashboard/homework-submissions/:submissionId/grade
 * Restricted to TEACHER, SUPER_ADMIN
 */
exports.gradeHomework = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade === undefined) {
      return next(new AppError("Iltimos, bahoni kiriting (grade)", 400));
    }

    const submission = await HomeworkSubmission.findById(submissionId).populate("lessonPlan");
    if (!submission) {
      return next(new AppError("Uyga vazifa topshirig'i topilmadi", 404));
    }

    // Verify teacher owns this submission group
    if (req.user.role !== "SUPER_ADMIN") {
      const targetGroup = await Group.findById(submission.lessonPlan.group);
      if (!targetGroup || targetGroup.teacher.toString() !== req.user._id.toString()) {
        return next(new AppError("Ushbu topshiriqni baholash huquqiga ega emassiz", 403));
      }
    }

    submission.grade = grade;
    submission.feedback = feedback || "";
    submission.status = "GRADED";
    await submission.save();

    // Sync to Grade Model (for overall calculations)
    const Grade = require("../models/Grade");
    await Grade.findOneAndUpdate(
      {
        student: submission.student,
        group: submission.lessonPlan.group,
        topic: `Homework: ${submission.lessonPlan.topic}`,
      },
      {
        value: grade,
        date: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      message: "Uyga vazifa muvaffaqiyatli baholandi",
      data: {
        submission,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full detail of a single group: students list + recent attendance + avg grades
 * GET /api/teacher/dashboard/groups/:groupId
 * Restricted to TEACHER (must own group), SUPER_ADMIN
 *
 * SECURITY: Group.findOne({ _id: groupId, teacher: teacherId }) → 403 if not owner
 */
exports.getGroupDetail = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const teacherId = req.user._id;

    // Ownership check — SUPER_ADMIN bypasses
    let group;
    if (req.user.role === "SUPER_ADMIN") {
      group = await Group.findById(groupId)
        .populate("course", "title duration")
        .populate({
          path: "students",
          populate: { path: "user", select: "firstname lastname phone email" },
        });
    } else {
      group = await Group.findOne({ _id: groupId, teacher: teacherId })
        .populate("course", "title duration")
        .populate({
          path: "students",
          populate: { path: "user", select: "firstname lastname phone email" },
        });
    }

    if (!group) {
      return next(new AppError("Guruh topilmadi yoki sizga tegishli emas", 403));
    }

    const studentIds = group.students.map((s) => s._id);

    // Recent attendance (last 30 days)
    const Attendance = require("../models/Attendance");
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attendance = await Attendance.find({
      group: groupId,
      student: { $in: studentIds },
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    // Grade averages per student
    const Grade = require("../models/Grade");
    const grades = await Grade.find({
      group: groupId,
      student: { $in: studentIds },
    });

    // Build per-student summary
    const studentSummary = group.students.map((student) => {
      const sId = student._id.toString();

      const studentGrades = grades.filter((g) => g.student.toString() === sId);
      const avgGrade =
        studentGrades.length > 0
          ? (studentGrades.reduce((sum, g) => sum + g.value, 0) / studentGrades.length).toFixed(1)
          : null;

      const lastAttendance = attendance.find((a) => a.student.toString() === sId);

      return {
        _id: student._id,
        user: student.user,
        avgGrade,
        lastAttendance: lastAttendance ? { date: lastAttendance.date, status: lastAttendance.status } : null,
      };
    });

    // Lesson plans for this group (most recent 10)
    const lessonPlans = await LessonPlan.find({ group: groupId })
      .sort({ date: -1 })
      .limit(10);

    // Upcoming exams
    const upcomingExams = await Exam.find({
      group: groupId,
      date: { $gte: new Date() },
    }).sort({ date: 1 });

    res.status(200).json({
      status: "success",
      data: {
        group: {
          _id: group._id,
          title: group.title,
          course: group.course,
          room: group.room,
          start_time: group.start_time,
          end_time: group.end_time,
          days: group.days,
        },
        students: studentSummary,
        recentAttendance: attendance,
        lessonPlans,
        upcomingExams,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule an exam for a group
 * POST /api/teacher/dashboard/groups/:groupId/exams
 * Restricted to TEACHER (must own group), SUPER_ADMIN
 */
exports.scheduleExam = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name, date, description } = req.body;

    if (!name || !date) {
      return next(new AppError("Iltimos, imtihon nomi va sanasini kiriting", 400));
    }

    // Ownership check
    if (req.user.role !== "SUPER_ADMIN") {
      const group = await Group.findOne({ _id: groupId, teacher: req.user._id });
      if (!group) {
        return next(new AppError("Guruh topilmadi yoki sizga tegishli emas", 403));
      }
    }

    const exam = await Exam.create({
      group: groupId,
      name,
      date: new Date(date),
      description: description || "",
      results: [],
    });

    res.status(201).json({
      status: "success",
      message: "Imtihon muvaffaqiyatli rejalashtirildi",
      data: { exam },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save exam results for a group exam
 * PATCH /api/teacher/dashboard/exams/:examId/results
 * Restricted to TEACHER (must own group), SUPER_ADMIN
 */
exports.saveExamResults = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { results } = req.body; // [{ student: id, score: number }]

    if (!Array.isArray(results) || results.length === 0) {
      return next(new AppError("Iltimos, natijalar (results) massivini kiriting", 400));
    }

    const exam = await Exam.findById(examId).populate("group");
    if (!exam) {
      return next(new AppError("Imtihon topilmadi", 404));
    }

    // Ownership check
    if (req.user.role !== "SUPER_ADMIN") {
      if (!exam.group || exam.group.teacher.toString() !== req.user._id.toString()) {
        return next(new AppError("Bu imtihon uchun natija kiritish huquqiga ega emassiz", 403));
      }
    }

    exam.results = results;
    await exam.save();

    res.status(200).json({
      status: "success",
      message: "Imtihon natijalari saqlandi",
      data: { exam },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record bulk attendance for a group
 * POST /api/teacher/dashboard/groups/:groupId/attendance
 * Body: { date, records: [{ student, status, reason? }] }
 * SECURITY: Group must belong to teacher
 */
exports.recordAttendance = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { date, records } = req.body;

    if (!date || !Array.isArray(records) || records.length === 0) {
      return next(new AppError("Iltimos, sana va davomat yozuvlarini kiriting", 400));
    }

    // Ownership check
    if (req.user.role !== "SUPER_ADMIN") {
      const group = await Group.findOne({ _id: groupId, teacher: req.user._id });
      if (!group) {
        return next(new AppError("Guruh topilmadi yoki sizga tegishli emas", 403));
      }
    }

    const Attendance = require("../models/Attendance");
    const attendanceDate = new Date(date);
    const saved = [];

    for (const rec of records) {
      if (!rec.student || !rec.status) continue;
      const doc = await Attendance.findOneAndUpdate(
        { student: rec.student, group: groupId, date: attendanceDate },
        { status: rec.status, reason: rec.reason || "" },
        { new: true, upsert: true, runValidators: true }
      );
      saved.push(doc);
    }

    res.status(200).json({
      status: "success",
      message: "Davomat muvaffaqiyatli saqlandi",
      data: { results: saved },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record bulk grades for a group
 * POST /api/teacher/dashboard/groups/:groupId/grades
 * Body: { topic, date?, records: [{ student, value }] }
 */
exports.recordGrades = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { topic, date, records } = req.body;

    if (!topic || !Array.isArray(records) || records.length === 0) {
      return next(new AppError("Iltimos, mavzu va baholarni kiriting", 400));
    }

    // Ownership check
    if (req.user.role !== "SUPER_ADMIN") {
      const group = await Group.findOne({ _id: groupId, teacher: req.user._id });
      if (!group) {
        return next(new AppError("Guruh topilmadi yoki sizga tegishli emas", 403));
      }
    }

    const GradeModel = require("../models/Grade");
    const gradeDate = date ? new Date(date) : new Date();
    const saved = [];

    for (const rec of records) {
      if (!rec.student || rec.value === undefined) continue;
      const doc = await GradeModel.findOneAndUpdate(
        { student: rec.student, group: groupId, topic, date: gradeDate },
        { value: rec.value },
        { new: true, upsert: true, runValidators: true }
      );
      saved.push(doc);
    }

    res.status(200).json({
      status: "success",
      message: "Baholar muvaffaqiyatli saqlandi",
      data: { results: saved },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a lesson plan (topic, homeworkDetails, homeworkDeadline, materials)
 * PATCH /api/teacher/dashboard/lesson-plans/:lessonPlanId
 * Restricted to TEACHER (must own group), SUPER_ADMIN
 */
exports.updateLessonPlan = async (req, res, next) => {
  try {
    const { lessonPlanId } = req.params;
    const { topic, homeworkDetails, homeworkDeadline } = req.body;

    const lessonPlan = await LessonPlan.findById(lessonPlanId);
    if (!lessonPlan) {
      return next(new AppError("Dars rejasi topilmadi", 404));
    }

    // Ownership check
    if (req.user.role !== "SUPER_ADMIN") {
      const targetGroup = await Group.findById(lessonPlan.group);
      if (!targetGroup || targetGroup.teacher.toString() !== req.user._id.toString()) {
        return next(new AppError("Ushbu dars rejasini tahrirlash huquqiga ega emassiz", 403));
      }
    }

    if (topic) lessonPlan.topic = topic;
    if (homeworkDetails) lessonPlan.homeworkDetails = homeworkDetails;
    if (homeworkDeadline) lessonPlan.homeworkDeadline = new Date(homeworkDeadline);

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newMaterials = req.files.map((file) => `/uploads/lesson-plans/${file.filename}`);
      lessonPlan.materials = [...lessonPlan.materials, ...newMaterials];
    }

    await lessonPlan.save();

    res.status(200).json({
      status: "success",
      message: "Dars rejasi muvaffaqiyatli yangilandi",
      data: { lessonPlan },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an exam (name, date, description)
 * PATCH /api/teacher/dashboard/exams/:examId
 * Restricted to TEACHER (must own group), SUPER_ADMIN
 */
exports.updateExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { name, date, description } = req.body;

    const exam = await Exam.findById(examId).populate("group");
    if (!exam) {
      return next(new AppError("Imtihon topilmadi", 404));
    }

    // Ownership check
    if (req.user.role !== "SUPER_ADMIN") {
      if (!exam.group || exam.group.teacher.toString() !== req.user._id.toString()) {
        return next(new AppError("Bu imtihonni tahrirlash huquqiga ega emassiz", 403));
      }
    }

    if (name) exam.name = name;
    if (date) exam.date = new Date(date);
    if (description !== undefined) exam.description = description;

    await exam.save();

    res.status(200).json({
      status: "success",
      message: "Imtihon muvaffaqiyatli yangilandi",
      data: { exam },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save Midterm and Final percentages for students in a group
 * POST /api/teacher/dashboard/groups/:groupId/exam-percentages
 * Restricted to TEACHER (must own group), SUPER_ADMIN
 */
exports.saveExamPercentages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { grades } = req.body; // Array of { studentId, midtermScore, finalScore }

    const targetGroup = await Group.findById(groupId);
    if (!targetGroup) return next(new AppError("Guruh topilmadi", 404));

    if (req.user.role !== "SUPER_ADMIN" && targetGroup.teacher.toString() !== req.user._id.toString()) {
      return next(new AppError("Ushbu guruh baholarini kiritish huquqiga ega emassiz", 403));
    }

    const Grade = require("../models/Grade");
    
    for (const item of grades) {
      if (item.midtermScore !== undefined && item.midtermScore !== null) {
        await Grade.findOneAndUpdate(
          { student: item.studentId, group: groupId, gradeType: 'MIDTERM' },
          { value: item.midtermScore, topic: 'Oraliq Imtihon', date: new Date() },
          { upsert: true, new: true }
        );
      }
      if (item.finalScore !== undefined && item.finalScore !== null) {
        await Grade.findOneAndUpdate(
          { student: item.studentId, group: groupId, gradeType: 'FINAL' },
          { value: item.finalScore, topic: 'Yakuniy Imtihon', date: new Date() },
          { upsert: true, new: true }
        );
      }
    }

    res.status(200).json({ status: "success", message: "Imtihon baholari saqlandi" });
  } catch (error) {
    next(error);
  }
};

/**
 * Preview Final Results (before closing)
 * GET /api/teacher/dashboard/groups/:groupId/preview-results
 * Restricted to TEACHER, SUPER_ADMIN
 */
exports.previewFinalResults = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    
    const targetGroup = await Group.findById(groupId).populate('students');
    if (!targetGroup) return next(new AppError("Guruh topilmadi", 404));

    if (req.user.role !== "SUPER_ADMIN" && targetGroup.teacher.toString() !== req.user._id.toString()) {
      return next(new AppError("Ushbu guruh ma'lumotlarini ko'rish huquqiga ega emassiz", 403));
    }

    const Grade = require("../models/Grade");
    const Attendance = require("../models/Attendance");
    const allGrades = await Grade.find({ group: groupId });
    
    // Calculate Attendance parameters
    const distinctDates = await Attendance.distinct('date', { group: groupId });
    const total_classes = distinctDates.length;
    const allAttendances = await Attendance.find({ group: groupId });
    
    let results = [];

    for (const student of targetGroup.students) {
      const studentGrades = allGrades.filter(g => g.student.toString() === student._id.toString());
      
      // 1. Daily Grades (Classwork + Homework combined)
      const dailyGrades = studentGrades.filter(g => 
        g.gradeType === 'CLASSWORK' || 
        g.gradeType === 'HOMEWORK' || 
        (!g.gradeType && (!g.topic || !g.topic.startsWith("Exam:")))
      );
      
      let daily_percentage = 0;
      if (dailyGrades.length > 0) {
        const dailyAvg = dailyGrades.reduce((acc, g) => acc + g.value, 0) / dailyGrades.length;
        daily_percentage = (dailyAvg / 5) * 100;
      }
      
      // 2. Exams
      const midterm = studentGrades.find(g => g.gradeType === 'MIDTERM');
      const final = studentGrades.find(g => g.gradeType === 'FINAL');
      
      const midterm_score = midterm ? midterm.value : 0;
      const final_score = final ? final.value : 0;
      const exam_percentage = (midterm_score * 0.40) + (final_score * 0.60);
      
      // 3. Attendance
      const studentAttendances = allAttendances.filter(a => a.student.toString() === student._id.toString());
      const attended_classes = studentAttendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      
      let attendance_percentage = 100; // If no classes held, default to 100% to avoid penalizing
      if (total_classes > 0) {
        attendance_percentage = (attended_classes / total_classes) * 100;
      }
      
      // 4. Final Total Percentage
      let totalPercentage = (daily_percentage * 0.20) + (exam_percentage * 0.70) + (attendance_percentage * 0.10);
      totalPercentage = parseFloat(totalPercentage.toFixed(2));

      results.push({
        student: student._id,
        dailyScore: parseFloat(daily_percentage.toFixed(2)),
        attendanceScore: parseFloat(attendance_percentage.toFixed(2)),
        midtermScore: midterm_score,
        finalScore: final_score,
        totalPercentage: totalPercentage,
        rank: 0
      });
    }

    results.sort((a, b) => b.totalPercentage - a.totalPercentage);
    results.forEach((r, idx) => r.rank = idx + 1);

    res.status(200).json({ status: "success", data: { preview: results } });
  } catch (error) {
    next(error);
  }
};

/**
 * Close Group Stage and Calculate Final Results
 * POST /api/teacher/dashboard/groups/:groupId/close
 * Restricted to TEACHER (must own group), SUPER_ADMIN
 */
exports.closeGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    
    const targetGroup = await Group.findById(groupId).populate('students');
    if (!targetGroup) return next(new AppError("Guruh topilmadi", 404));

    if (req.user.role !== "SUPER_ADMIN" && targetGroup.teacher.toString() !== req.user._id.toString()) {
      return next(new AppError("Ushbu guruhni yopish huquqiga ega emassiz", 403));
    }

    const Grade = require("../models/Grade");
    const Attendance = require("../models/Attendance");
    const allGrades = await Grade.find({ group: groupId });
    
    // Calculate Attendance parameters
    const distinctDates = await Attendance.distinct('date', { group: groupId });
    const total_classes = distinctDates.length;
    const allAttendances = await Attendance.find({ group: groupId });
    
    let results = [];

    for (const student of targetGroup.students) {
      const studentGrades = allGrades.filter(g => g.student.toString() === student._id.toString());
      
      // 1. Daily Grades (Classwork + Homework combined)
      const dailyGrades = studentGrades.filter(g => 
        g.gradeType === 'CLASSWORK' || 
        g.gradeType === 'HOMEWORK' || 
        (!g.gradeType && (!g.topic || !g.topic.startsWith("Exam:")))
      );
      
      let daily_percentage = 0;
      if (dailyGrades.length > 0) {
        const dailyAvg = dailyGrades.reduce((acc, g) => acc + g.value, 0) / dailyGrades.length;
        daily_percentage = (dailyAvg / 5) * 100;
      }
      
      // 2. Exams
      const midterm = studentGrades.find(g => g.gradeType === 'MIDTERM');
      const final = studentGrades.find(g => g.gradeType === 'FINAL');
      
      const midterm_score = midterm ? midterm.value : 0;
      const final_score = final ? final.value : 0;
      const exam_percentage = (midterm_score * 0.40) + (final_score * 0.60);
      
      // 3. Attendance
      const studentAttendances = allAttendances.filter(a => a.student.toString() === student._id.toString());
      const attended_classes = studentAttendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      
      let attendance_percentage = 100; // Default if no classes held
      if (total_classes > 0) {
        attendance_percentage = (attended_classes / total_classes) * 100;
      }
      
      // 4. Final Total Percentage
      let totalPercentage = (daily_percentage * 0.20) + (exam_percentage * 0.70) + (attendance_percentage * 0.10);
      totalPercentage = parseFloat(totalPercentage.toFixed(2));

      results.push({
        student: student._id,
        dailyScore: parseFloat(daily_percentage.toFixed(2)),
        attendanceScore: parseFloat(attendance_percentage.toFixed(2)),
        midtermScore: midterm_score,
        finalScore: final_score,
        totalPercentage: totalPercentage,
        rank: 0
      });
    }

    // Sort and assign rank
    results.sort((a, b) => b.totalPercentage - a.totalPercentage);
    results.forEach((r, idx) => r.rank = idx + 1);

    targetGroup.status = 'CLOSED';
    targetGroup.finalResults = results;
    await targetGroup.save();

    res.status(200).json({ status: "success", message: "Guruh muvaffaqiyatli yopildi va natijalar hisoblandi", data: { finalResults: results } });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all homework submissions for a lesson plan (including students who haven't submitted)
 * GET /api/teacher/dashboard/lesson-plans/:lessonPlanId/hw-submissions
 */
exports.getHomeworkSubmissions = async (req, res, next) => {
  try {
    const { lessonPlanId } = req.params;
    
    const LessonPlan = require("../models/LessonPlan");
    const lessonPlan = await LessonPlan.findById(lessonPlanId);
    if (!lessonPlan) return next(new AppError("Dars rejasi topilmadi", 404));

    const Group = require("../models/Group");
    const group = await Group.findById(lessonPlan.group).populate('students');
    if (!group) return next(new AppError("Guruh topilmadi", 404));

    if (req.user.role !== "SUPER_ADMIN" && group.teacher.toString() !== req.user._id.toString()) {
      return next(new AppError("Sizda ushbu ma'lumotlarni ko'rish huquqi yo'q", 403));
    }

    const HomeworkSubmission = require("../models/HomeworkSubmission");
    const Grade = require("../models/Grade");

    const submissions = await HomeworkSubmission.find({ lessonPlan: lessonPlanId });
    const grades = await Grade.find({ 
      group: group._id, 
      topic: "Homework: " + lessonPlan.topic, 
      gradeType: 'HOMEWORK' 
    });

    const results = group.students.map(student => {
      const sub = submissions.find(s => s.student.toString() === student._id.toString());
      const grade = grades.find(g => g.student.toString() === student._id.toString());

      return {
        student: student._id,
        submission: sub ? { _id: sub._id, status: sub.status, files: sub.submittedFiles, note: sub.studentNote } : null,
        grade: grade ? grade.value : null
      };
    });

    res.status(200).json({ status: "success", data: { results } });
  } catch (error) {
    next(error);
  }
};

/**
 * Grade homework submissions in bulk for a lesson plan
 * POST /api/teacher/dashboard/lesson-plans/:lessonPlanId/grade-homeworks
 * Body: { grades: [{ studentId, score }] }
 */
exports.gradeHomeworkSubmissions = async (req, res, next) => {
  try {
    const { lessonPlanId } = req.params;
    const { grades } = req.body;

    if (!grades || !Array.isArray(grades)) {
      return next(new AppError("Noto'g'ri so'rov formati", 400));
    }

    const LessonPlan = require("../models/LessonPlan");
    const lessonPlan = await LessonPlan.findById(lessonPlanId);
    if (!lessonPlan) return next(new AppError("Dars rejasi topilmadi", 404));

    const Group = require("../models/Group");
    const group = await Group.findById(lessonPlan.group);
    if (!group) return next(new AppError("Guruh topilmadi", 404));

    if (req.user.role !== "SUPER_ADMIN" && group.teacher.toString() !== req.user._id.toString()) {
      return next(new AppError("Baholash huquqi yo'q", 403));
    }

    const Grade = require("../models/Grade");
    const HomeworkSubmission = require("../models/HomeworkSubmission");

    const topic = "Homework: " + lessonPlan.topic;
    const gradeDate = new Date();

    for (const g of grades) {
      if (!g.studentId || g.score === undefined || g.score === null) continue;

      // Create or update grade document
      await Grade.findOneAndUpdate(
        { student: g.studentId, group: group._id, topic, gradeType: 'HOMEWORK' },
        { value: g.score, date: gradeDate },
        { new: true, upsert: true, runValidators: true }
      );

      // Update homework submission if it exists
      await HomeworkSubmission.findOneAndUpdate(
        { lessonPlan: lessonPlanId, student: g.studentId },
        { status: 'GRADED', grade: g.score },
        { runValidators: true }
      );
    }

    res.status(200).json({ status: "success", message: "Uyga vazifa baholari saqlandi" });
  } catch (error) {
    next(error);
  }
};
