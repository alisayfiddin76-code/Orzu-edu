const Achievement = require('../models/Achievement');
const AppError = require('../utils/appError');

/**
 * GET /api/v1/achievements
 * Hammaga ochiq
 */
exports.getAll = async (req, res, next) => {
  try {
    const achievements = await Achievement.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: achievements.length,
      data: { achievements },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/achievements
 * Admin: Yangi natija yaratish
 */
exports.create = async (req, res, next) => {
  try {
    const { studentName, course, description, year, order } = req.body;

    if (!studentName || !course) {
      return next(new AppError("O'quvchi ismi va kurs nomi talab qilinadi", 400));
    }

    const certificateImage = req.file
      ? `/uploads/achievements/${req.file.filename}`
      : null;

    const achievement = await Achievement.create({
      studentName,
      course,
      certificateImage,
      description: description || '',
      year: year ? Number(year) : new Date().getFullYear(),
      order: order ? Number(order) : 0,
    });

    res.status(201).json({ status: 'success', data: { achievement } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/achievements/:id
 * Admin: Natijani tahrirlash
 */
exports.update = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.certificateImage = `/uploads/achievements/${req.file.filename}`;
    if (updateData.year) updateData.year = Number(updateData.year);
    if (updateData.order) updateData.order = Number(updateData.order);

    const achievement = await Achievement.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!achievement) return next(new AppError('Natija topilmadi', 404));

    res.status(200).json({ status: 'success', data: { achievement } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/achievements/:id
 * Admin: Natijani o'chirish
 */
exports.delete = async (req, res, next) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) return next(new AppError('Natija topilmadi', 404));

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};
