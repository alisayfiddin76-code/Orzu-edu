const Partner = require('../models/Partner');
const AppError = require('../utils/appError');

/**
 * GET /api/v1/partners
 * Hammaga ochiq — faqat active hamkorlar
 */
exports.getAll = async (req, res, next) => {
  try {
    const partners = await Partner.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.status(200).json({
      status: 'success',
      results: partners.length,
      data: { partners },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/partners/admin
 * Admin: Barcha hamkorlar (active + inactive)
 */
exports.getAllAdmin = async (req, res, next) => {
  try {
    const partners = await Partner.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json({
      status: 'success',
      results: partners.length,
      data: { partners },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/partners
 * Admin: Yangi hamkor qo'shish
 */
exports.create = async (req, res, next) => {
  try {
    const { name, website, order, active } = req.body;

    if (!name) return next(new AppError('Hamkor nomi talab qilinadi', 400));

    const logo = req.file ? `/uploads/partners/${req.file.filename}` : null;

    const partner = await Partner.create({
      name,
      logo,
      website: website || null,
      order: order ? Number(order) : 0,
      active: active !== 'false' && active !== false,
    });

    res.status(201).json({ status: 'success', data: { partner } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/partners/:id
 * Admin: Hamkorni tahrirlash
 */
exports.update = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.logo = `/uploads/partners/${req.file.filename}`;
    if (updateData.order) updateData.order = Number(updateData.order);
    if (updateData.active !== undefined) {
      updateData.active = updateData.active !== 'false' && updateData.active !== false;
    }

    const partner = await Partner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!partner) return next(new AppError('Hamkor topilmadi', 404));

    res.status(200).json({ status: 'success', data: { partner } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/partners/:id
 * Admin: Hamkorni o'chirish
 */
exports.delete = async (req, res, next) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return next(new AppError('Hamkor topilmadi', 404));

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};
