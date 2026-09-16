const express = require("express");
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Create a new group (SUPER_ADMIN only)
router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  groupController.createGroup
);

// Get all groups (SUPER_ADMIN, MANAGER, FINANCE_ADMIN)
router.get(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER", "FINANCE_ADMIN"),
  groupController.getAllGroups
);

// Get all groups with nested students (SUPER_ADMIN, MANAGER)
router.get(
  "/students",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"),
  groupController.getGroupsWithStudents
);

// Get teacher's own groups (TEACHER)
router.get(
  "/my-groups",
  authMiddleware.protect,
  authMiddleware.restrictTo("TEACHER"),
  groupController.getTeacherGroups
);

// Get single group by ID (all authenticated users)
router.get(
  "/:id",
  authMiddleware.protect,
  groupController.getGroupById
);

// Update group (SUPER_ADMIN only)
router.patch(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  groupController.updateGroup
);

// Add student to group (SUPER_ADMIN only)
router.post(
  "/:groupId/students/:studentId",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  groupController.addStudentToGroup
);

// Remove student from group (SUPER_ADMIN only)
router.delete(
  "/:groupId/students/:studentId",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  groupController.removeStudentFromGroup
);

// Delete group (SUPER_ADMIN only)
router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  groupController.deleteGroup
);

module.exports = router;
