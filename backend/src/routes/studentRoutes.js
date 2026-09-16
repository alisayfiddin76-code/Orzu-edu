const express = require("express");
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadDoc, setCategory } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get student's own performance comparison - Protected (STUDENT only)
router.get(
  "/performance",
  authMiddleware.protect,
  authMiddleware.restrictTo("STUDENT"),
  studentController.getStudentPerformance
);

// Get registered students (from leads) - SUPER_ADMIN, MANAGER
router.get(
  "/registered-only",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"),
  studentController.getRegisteredStudents
);

// Get student's own assigned groups - Protected (all students)
router.get(
  "/my-groups",
  authMiddleware.protect,
  authMiddleware.restrictTo("STUDENT"),
  studentController.getMyGroups
);

// Get student's own invoices (payment history)
router.get(
  "/my-invoices",
  authMiddleware.protect,
  studentController.getMyInvoices
);

// Get student's own attendance records - Protected (STUDENT only)
router.get(
  "/my-attendance",
  authMiddleware.protect,
  authMiddleware.restrictTo("STUDENT"),
  studentController.getMyAttendance
);

// Get student's own grades - Protected (STUDENT only)
router.get(
  "/my-grades",
  authMiddleware.protect,
  authMiddleware.restrictTo("STUDENT"),
  studentController.getMyGrades
);

// Get student's upcoming and past exams - Protected (STUDENT only)
router.get(
  "/my-exams",
  authMiddleware.protect,
  authMiddleware.restrictTo("STUDENT"),
  studentController.getMyExams
);

// Get student's homework assignments - Protected (STUDENT only)
router.get(
  "/my-homework",
  authMiddleware.protect,
  authMiddleware.restrictTo("STUDENT"),
  studentController.getMyHomework
);

// Submit Homework - Protected (STUDENT only)
router.post(
  "/homework/:lessonPlanId",
  authMiddleware.protect,
  authMiddleware.restrictTo("STUDENT"),
  setCategory("homework-submissions"),
  uploadDoc.array('files', 5),
  studentController.submitHomework
);

// Get student's lesson materials - Protected (STUDENT only)
router.get(
  "/my-materials",
  authMiddleware.protect,
  authMiddleware.restrictTo("STUDENT"),
  studentController.getMyMaterials
);

// Convert lead to student (SUPER_ADMIN only)
router.post(
  "/from-lead/:leadId",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  studentController.convertToStudent
);

// Assign student to group (SUPER_ADMIN only)
router.post(
  "/:studentId/assign-group/:groupId",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  studentController.assignStudentToGroup
);

// Create a student manually (SUPER_ADMIN only)
router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  studentController.createStudent
);

// Get all students (SUPER_ADMIN, MANAGER, FINANCE_ADMIN)
router.get(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER", "FINANCE_ADMIN"),
  studentController.getAllStudents
);

// Get available students (not assigned to any group, optionally filtered by subjectId)
router.get(
  "/available",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"),
  studentController.getAvailableStudents
);

// 2+ marta dars qoldirgan o'quvchilar (SUPER_ADMIN, MANAGER)
router.get(
  "/frequent-absentees",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"),
  studentController.getFrequentAbsentees
);

// Get single student by ID (SUPER_ADMIN, MANAGER, TEACHER, FINANCE_ADMIN)
router.get(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER", "TEACHER", "FINANCE_ADMIN"),
  studentController.getStudentById
);

// Update student (SUPER_ADMIN only)
router.patch(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  studentController.updateStudent
);

// Delete student (SUPER_ADMIN only)
router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  studentController.deleteStudent
);

// Get Student Profile
router.get(
  "/:id/profile",
  authMiddleware.protect,
  studentController.getStudentProfile
);

module.exports = router;
