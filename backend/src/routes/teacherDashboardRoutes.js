const express = require('express');
const teacherDashboardController = require('../controllers/teacherDashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadDoc, setCategory } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Protect all routes — restrict to TEACHER or SUPER_ADMIN
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('TEACHER', 'SUPER_ADMIN'));

// ─────────────────────────────────────────────
// DASHBOARD SUMMARY
// ─────────────────────────────────────────────
router.get('/summary', teacherDashboardController.getDashboardSummary);

// ─────────────────────────────────────────────
// LESSON PLANS (materials upload)
// ─────────────────────────────────────────────
router.post(
  '/lesson-plans',
  setCategory('lesson-plans'),
  uploadDoc.array('materials', 5),
  teacherDashboardController.createLessonPlan
);

// ─────────────────────────────────────────────
// GROUP DETAIL + INNER ACTIONS
// ─────────────────────────────────────────────
// Get full group detail: students, recent attendance, avg grades, lesson plans, exams
router.get('/groups/:groupId', teacherDashboardController.getGroupDetail);

// Get lesson plans history for a group
router.get('/groups/:groupId/lesson-plans', teacherDashboardController.getGroupLessonPlans);

// ⚠️ BREAKING CHANGE: New attendance endpoint (replaces old teacher/attendance format)
// Body: { date: "YYYY-MM-DD", records: [{ student, status, reason? }] }
// (Previously frontend was sending statusMap — this is now records[])
router.post('/groups/:groupId/attendance', teacherDashboardController.recordAttendance);

// Grades for a group
// Body: { topic, date?, records: [{ student, value }] }
router.post('/groups/:groupId/grades', teacherDashboardController.recordGrades);

// Save Midterm and Final Exam Percentages
// Body: { grades: [{ studentId, midtermScore, finalScore }] }
router.post('/groups/:groupId/exam-percentages', teacherDashboardController.saveExamPercentages);

// Preview Final Ranking
router.get('/groups/:groupId/preview-results', teacherDashboardController.previewFinalResults);

// Close Group and Calculate Final Ranking
router.post('/groups/:groupId/close', teacherDashboardController.closeGroup);

// Get Homework Submissions for a Lesson Plan
router.get('/lesson-plans/:lessonPlanId/hw-submissions', teacherDashboardController.getHomeworkSubmissions);

// Grade Homework Submissions
router.post('/lesson-plans/:lessonPlanId/grade-homeworks', teacherDashboardController.gradeHomeworkSubmissions);

// Schedule a new exam
// Body: { name, date, description? }
router.post('/groups/:groupId/exams', teacherDashboardController.scheduleExam);

// Save/update exam results
// Body: { results: [{ student, score }] }
router.patch('/exams/:examId/results', teacherDashboardController.saveExamResults);

// ─────────────────────────────────────────────
// HOMEWORK SUBMISSIONS
// ─────────────────────────────────────────────
router.get('/homework-submissions/pending', teacherDashboardController.getPendingSubmissions);
router.post('/homework-submissions/:submissionId/grade', teacherDashboardController.gradeHomework);

// ─────────────────────────────────────────────
// EDIT / UPDATE
// ─────────────────────────────────────────────
// Update a lesson plan (topic, deadline, materials)
router.patch(
  '/lesson-plans/:lessonPlanId',
  setCategory('lesson-plans'),
  uploadDoc.array('materials', 5),
  teacherDashboardController.updateLessonPlan
);

// Update an exam (name, date, description)
router.patch('/exams/:examId', teacherDashboardController.updateExam);

module.exports = router;

