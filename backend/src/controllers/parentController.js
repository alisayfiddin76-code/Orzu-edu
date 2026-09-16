const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Invoice = require('../models/Invoice');
const Group = require('../models/Group');
const AppError = require('../utils/appError');

/**
 * GET /api/v1/parent/dashboard
 * Returns all children of the authenticated parent with populated data.
 */
exports.getParentDashboard = async (req, res, next) => {
  try {
    // Assume protect middleware has set req.user
    const parentPhone = req.user.phone;

    // Find students linked by parentPhone
    const students = await Student.find({ parentPhone }).populate('user');

    const children = await Promise.all(
      students.map(async (student) => {
        const [attendance, grades, invoices, groups] = await Promise.all([
          Attendance.find({ student: student._id }).populate('group'),
          Grade.find({ student: student._id }).populate('group'),
          Invoice.find({ student: student._id }).populate('group', 'title'),
          Group.find({ students: student._id }).populate('teacher', 'firstname lastname phone avatar subject telegram')
        ]);
        
        // Extract unique teachers from the groups
        const teacherMap = new Map();
        groups.forEach(group => {
            if (group.teacher && group.teacher._id) {
                teacherMap.set(group.teacher._id.toString(), group.teacher);
            }
        });
        const teachers = Array.from(teacherMap.values());

        return { student, attendance, grades, invoices, teachers };
      })
    );

    res.status(200).json({
      status: 'success',
      data: { children },
    });
  } catch (err) {
    next(err);
  }
};
