const express = require("express");
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", courseController.getAllCourses);
router.get("/:courseId/teachers", courseController.getCourseTeachers);

// Protected routes (Only SUPER_ADMIN)
router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  courseController.createCourse
);

router.patch(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  courseController.updateCourse
);

router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("SUPER_ADMIN"),
  courseController.deleteCourse
);

module.exports = router;
