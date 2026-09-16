const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const User = require('../models/User');

/**
 * Avtomatik reyting hisoblash algoritmi:
 *   - Davomat bali    : (PRESENT soni / jami davomat yozuvlari) × 40
 *   - Baholar o'rtachasi: (o'rtacha baho / 5) × 35
 *   - Uy vazifalari   : (GRADED submissions / jami topshiriqlar) × 25
 *   - Jami             : max 100 ball
 */

// Sanani hisoblash yordamchi funksiya
function getPeriodRange(period) {
  const now = new Date();
  let start, end;

  if (period === 'week') {
    const day = now.getDay(); // 0=Sun, 1=Mon...
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    end = new Date();
    end.setHours(23, 59, 59, 999);
  } else {
    // month (default)
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

// ─────────────────────────────────────────────
// GET /api/v1/student-of-month?period=month&limit=10
// ─────────────────────────────────────────────
exports.getAutoRanking = async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const limit  = Math.min(parseInt(req.query.limit) || 10, 20);
    const { start, end } = getPeriodRange(period);

    // 1. Faol o'quvchilarni olish (user bilan birga)
    const students = await Student.find({ status: 'ACTIVE' })
      .populate('user', 'firstname lastname photo role')
      .populate({ path: 'enrollments.group', select: 'title course', populate: { path: 'course', select: 'title' } })
      .lean();

    if (!students.length) {
      return res.status(200).json({
        success: true,
        data: { period, generatedAt: new Date(), rankings: [] }
      });
    }

    const studentIds = students.map(s => s._id);

    // 2. Davomat – davr ichida
    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
      date: { $gte: start, $lte: end }
    }).lean();

    // 3. Baholar – davr ichida
    const gradeRecords = await Grade.find({
      student: { $in: studentIds },
      date: { $gte: start, $lte: end }
    }).lean();

    // 4. Uy vazifalari – davr ichida
    const homeworkRecords = await HomeworkSubmission.find({
      student: { $in: studentIds },
      submittedAt: { $gte: start, $lte: end }
    }).lean();

    // 5. Har bir o'quvchi uchun ball hisoblash
    const rankings = students.map(student => {
      const sid = student._id.toString();

      // --- Davomat ---
      const myAttendance = attendanceRecords.filter(a => a.student.toString() === sid);
      const totalLessons  = myAttendance.length;
      const presentCount  = myAttendance.filter(a => a.status === 'PRESENT').length;
      const attendanceScore = totalLessons > 0 ? (presentCount / totalLessons) * 40 : 0;
      const attendancePct = totalLessons > 0 ? Math.round((presentCount / totalLessons) * 100) : null;

      // --- Baholar ---
      const myGrades = gradeRecords.filter(g => g.student.toString() === sid);
      const avgGrade  = myGrades.length > 0
        ? myGrades.reduce((sum, g) => sum + (g.value || 0), 0) / myGrades.length
        : 0;
      const gradeScore = (avgGrade / 5) * 35;

      // --- Uy vazifalari ---
      const myHomework  = homeworkRecords.filter(h => h.student.toString() === sid);
      const totalHW     = myHomework.length;
      const gradedHW    = myHomework.filter(h => h.status === 'GRADED').length;
      const hwScore     = totalHW > 0 ? (gradedHW / totalHW) * 25 : 0;
      const hwPct       = totalHW > 0 ? Math.round((gradedHW / totalHW) * 100) : null;

      const totalScore = Math.round((attendanceScore + gradeScore + hwScore) * 10) / 10;

      // Guruh nomi (birinchi aktiv guruh)
      const groupTitle = student.enrollments?.[0]?.group?.title || null;
      const courseName = student.enrollments?.[0]?.group?.course?.title || null;

      return {
        student: {
          _id:       student._id,
          firstname: student.user?.firstname || 'Noma\'lum',
          lastname:  student.user?.lastname  || '',
          photo:     student.user?.photo     || null,
        },
        group: groupTitle,
        course: courseName,
        scores: {
          attendance:    Math.round(attendanceScore * 10) / 10,
          grades:        Math.round(gradeScore * 10) / 10,
          homework:      Math.round(hwScore * 10) / 10,
          total:         totalScore,
        },
        meta: {
          totalLessons,
          presentCount,
          attendancePct,
          avgGrade:    myGrades.length > 0 ? Math.round(avgGrade * 10) / 10 : null,
          gradeCount:  myGrades.length,
          hwTotal:     totalHW,
          hwGraded:    gradedHW,
          hwPct,
        }
      };
    });

    // 6. Ballga ko'ra saralash va raqam berish
    const sorted = rankings
      .sort((a, b) => b.scores.total - a.scores.total)
      .slice(0, limit)
      .map((item, idx) => ({ rank: idx + 1, ...item }));

    // Davr label
    const periodLabel = period === 'week'
      ? `${start.toLocaleDateString('uz-UZ')} – ${new Date().toLocaleDateString('uz-UZ')}`
      : `${start.toLocaleString('uz-UZ', { month: 'long', year: 'numeric' })}`;

    res.status(200).json({
      success: true,
      data: {
        period,
        periodLabel,
        generatedAt: new Date(),
        total: sorted.length,
        rankings: sorted
      }
    });

  } catch (error) {
    console.error('[StudentOfMonth] getAutoRanking xatolik:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/student-of-month/teachers?period=month&limit=10
// O'qituvchilar reytingi: guruhlarining o'quvchilar o'rtacha bali asosida
// ─────────────────────────────────────────────
exports.getTeacherRanking = async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const limit  = Math.min(parseInt(req.query.limit) || 10, 20);
    const { start, end } = getPeriodRange(period);

    const Group = require('../models/Group');

    // Faol guruhlarni o'qituvchilari bilan (kurs narxi ham kerak)
    const groups = await Group.find({ status: 'ACTIVE' })
      .populate('teacher', 'firstname lastname photo')
      .populate('course', 'title')
      .lean();

    if (!groups.length) {
      return res.status(200).json({
        success: true,
        data: { period, generatedAt: new Date(), rankings: [] }
      });
    }

    // O'qituvchi bo'yicha guruhlarni birlashtirish
    const teacherMap = new Map();
    for (const group of groups) {
      if (!group.teacher) continue;
      const tid = group.teacher._id.toString();
      if (!teacherMap.has(tid)) {
        teacherMap.set(tid, {
          teacher:    group.teacher,
          studentIds: [],
          groupCount: 0,
          totalPrice: 0,
        });
      }
      const entry = teacherMap.get(tid);
      entry.groupCount++;
      entry.totalPrice += (group.price || 0);
      // students field might be array of IDs from Group.students[]
      const ids = (group.students || []).map(s => s._id || s);
      entry.studentIds.push(...ids);
    }

    // Eng ko'p o'quvchisi bor o'qituvchini topamiz (normalizatsiya uchun)
    const maxStudents = Math.max(...Array.from(teacherMap.values()).map(e => [...new Set(e.studentIds)].length), 1);
    const maxGroups   = Math.max(...Array.from(teacherMap.values()).map(e => e.groupCount), 1);

    // Har o'qituvchi uchun ball hisoblash
    const rankings = await Promise.all(
      Array.from(teacherMap.values()).map(async ({ teacher, studentIds, groupCount, totalPrice }) => {
        const uniqueIds = [...new Set(studentIds.map(id => id.toString()))];
        const studentCount = uniqueIds.length;

        // ── Faoliyat ko'rsatkichlari (activity data) ──
        const [attendanceRecords, gradeRecords, homeworkRecords] = await Promise.all([
          Attendance.find({ student: { $in: uniqueIds }, date: { $gte: start, $lte: end } }).lean(),
          Grade.find({ student: { $in: uniqueIds }, date: { $gte: start, $lte: end } }).lean(),
          HomeworkSubmission.find({ student: { $in: uniqueIds }, submittedAt: { $gte: start, $lte: end } }).lean(),
        ]);

        const totalLessons = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
        const attendanceScore = totalLessons > 0 ? (presentCount / totalLessons) * 40 : 0;
        const attendancePct   = totalLessons > 0 ? Math.round((presentCount / totalLessons) * 100) : null;

        const avgGrade    = gradeRecords.length > 0
          ? gradeRecords.reduce((s, g) => s + g.value, 0) / gradeRecords.length : 0;
        const gradeScore  = (avgGrade / 5) * 35;

        const totalHW  = homeworkRecords.length;
        const gradedHW = homeworkRecords.filter(h => h.status === 'GRADED').length;
        const hwScore  = totalHW > 0 ? (gradedHW / totalHW) * 25 : 0;
        const hwPct    = totalHW > 0 ? Math.round((gradedHW / totalHW) * 100) : null;

        const activityTotal = Math.round((attendanceScore + gradeScore + hwScore) * 10) / 10; // max 100

        // ── Tizimiy ko'rsatkichlar (structural score) ──
        // O'quvchilar soni (max 50 ball, normalizatsiya bilan)
        const studentScore = (studentCount / maxStudents) * 50;
        // Guruhlar soni (max 30 ball)
        const groupScore   = (groupCount / maxGroups) * 30;
        // Bonus: faoliyat ma'lumoti bor bo'lsa qo'shimcha 20 ball
        const activityBonus = activityTotal > 0 ? Math.min(activityTotal * 0.2, 20) : 0;

        const structuralTotal = Math.round((studentScore + groupScore + activityBonus) * 10) / 10; // max 100

        // ── Yakuniy ball ──
        // Agar faoliyat ma'lumoti mavjud bo'lsa: faoliyat × 0.6 + tizimiy × 0.4
        // Agar yo'q bo'lsa: faqat tizimiy ball
        const hasActivity = activityTotal > 0;
        const totalScore  = hasActivity
          ? Math.round((activityTotal * 0.6 + structuralTotal * 0.4) * 10) / 10
          : Math.round(structuralTotal * 10) / 10;

        return {
          teacher: {
            _id:       teacher._id,
            firstname: teacher.firstname || 'Noma\'lum',
            lastname:  teacher.lastname  || '',
            photo:     teacher.photo     || null,
          },
          groupCount,
          studentCount,
          hasActivity,
          scores: {
            attendance: Math.round(attendanceScore * 10) / 10,
            grades:     Math.round(gradeScore * 10) / 10,
            homework:   Math.round(hwScore * 10) / 10,
            total:      totalScore,
          },
          meta: {
            attendancePct,
            avgGrade:   gradeRecords.length > 0 ? Math.round(avgGrade * 10) / 10 : null,
            gradeCount: gradeRecords.length,
            hwTotal:    totalHW,
            hwGraded:   gradedHW,
            hwPct,
          }
        };
      })
    );

    const sorted = rankings
      .sort((a, b) => b.scores.total - a.scores.total)
      .slice(0, limit)
      .map((item, idx) => ({ rank: idx + 1, ...item }));

    const periodLabel = period === 'week'
      ? `${start.toLocaleDateString('uz-UZ')} – ${new Date().toLocaleDateString('uz-UZ')}`
      : `${start.toLocaleString('uz-UZ', { month: 'long', year: 'numeric' })}`;

    res.status(200).json({
      success: true,
      data: { period, periodLabel, generatedAt: new Date(), total: sorted.length, rankings: sorted }
    });

  } catch (error) {
    console.error('[StudentOfMonth] getTeacherRanking xatolik:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
