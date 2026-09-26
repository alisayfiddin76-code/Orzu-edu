const express = require("express");
const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Get active teachers for public site (Unprotected)
router.get("/public", teacherController.getPublicTeachers);

// Create a new teacher (SUPER_ADMIN only)
router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  teacherController.createTeacher
);

// Get all teachers (SUPER_ADMIN, MANAGER)
router.get(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"),
  teacherController.getAllTeachers
);

// Get single teacher by ID (SUPER_ADMIN, MANAGER)
router.get(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"),
  teacherController.getTeacherById
);

// Update teacher details (SUPER_ADMIN, MANAGER)
router.patch(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"),
  teacherController.updateTeacher
);

// Update teacher status (SUPER_ADMIN, MANAGER)
router.patch(
  "/:id/status",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"),
  teacherController.updateTeacherStatus
);

// Change teacher password (SUPER_ADMIN only)
router.patch(
  "/:id/password",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  teacherController.changeTeacherPassword
);

// Delete teacher (SUPER_ADMIN only)
router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  teacherController.deleteTeacher
);

// Record bulk attendance for a group
router.post(
  "/attendance",
  authMiddleware.protect,
  authMiddleware.restrictTo("TEACHER", "SUPER_ADMIN"),
  teacherController.recordGroupAttendance
);

// Record bulk grades by topic for a group
router.post(
  "/grades",
  authMiddleware.protect,
  authMiddleware.restrictTo("TEACHER", "SUPER_ADMIN"),
  teacherController.recordGroupGrades
);

// Record bulk exam results for a group
router.post(
  "/exams",
  authMiddleware.protect,
  authMiddleware.restrictTo("TEACHER", "SUPER_ADMIN"),
  teacherController.recordExamResults
);

module.exports = router;
