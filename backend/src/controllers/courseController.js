const Course = require("../models/Course");
const Group = require("../models/Group");
const AppError = require("../utils/appError");

/**
 * Create a new course
 * POST /api/v1/courses
 * Restricted to SUPER_ADMIN
 */
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, duration, price, slug, status } = req.body;

    if (!title || !description || !duration || price === undefined) {
      return next(new AppError("Iltimos, barcha majburiy maydonlarni (title, description, duration, price) to'ldiring", 400));
    }

    // Generate slug from title if not provided
    const courseSlug = slug || title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Check if course with slug already exists
    const existingCourse = await Course.findOne({ slug: courseSlug });
    if (existingCourse) {
      return next(new AppError("Ushbu nomdagi yoki slugga ega kurs allaqachon mavjud", 400));
    }

    const course = await Course.create({
      title,
      slug: courseSlug,
      description,
      duration,
      price,
      status,
    });

    res.status(201).json({
      status: "success",
      data: {
        course,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all courses (filtered by status)
 * GET /api/v1/courses?status=ACTIVE or ?status=INACTIVE or ?all=true
 * Public endpoint - defaults to ACTIVE status only
 * Admin can use ?all=true to see all courses
 */
exports.getAllCourses = async (req, res, next) => {
  try {
    const { status, all } = req.query;

    let filter = {};
    if (all === 'true') {
      // Admin: show all courses
      filter = {};
    } else if (status) {
      // Show specific status
      filter = { status };
    } else {
      // Default: only ACTIVE courses
      filter = { status: "ACTIVE" };
    }

    const courses = await Course.find(filter);

    res.status(200).json({
      status: "success",
      results: courses.length,
      data: {
        courses,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get teachers assigned to a course
 * GET /api/v1/courses/:courseId/teachers
 * Public endpoint
 */
exports.getCourseTeachers = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if course exists first
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError("Kurs topilmadi", 404));
    }

    // Find all groups assigned to this course, populate their teacher details
    const groups = await Group.find({ course: courseId }).populate({
      path: "teacher",
      select: "firstname lastname email phone avatar education bio status",
    });

    // Group and filter unique teachers
    const teachersMap = new Map();
    groups.forEach((group) => {
      if (group.teacher && group.teacher.status === "ACTIVE") {
        teachersMap.set(group.teacher._id.toString(), group.teacher);
      }
    });

    const teachers = Array.from(teachersMap.values());

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
 * Update a course
 * PATCH /api/v1/courses/:id
 * Restricted to SUPER_ADMIN
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const { title, description, duration, price, status } = req.body;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, duration, price, status },
      { new: true, runValidators: true }
    );

    if (!course) {
      return next(new AppError("Kurs topilmadi", 404));
    }

    res.status(200).json({
      status: "success",
      data: { course }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a course
 * DELETE /api/v1/courses/:id
 * Restricted to SUPER_ADMIN
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return next(new AppError("Kurs topilmadi", 404));
    }

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    next(error);
  }
};

