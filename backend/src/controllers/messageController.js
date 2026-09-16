const Message = require('../models/Message');
const AppError = require('../utils/appError');

/**
 * POST /api/v1/messages
 * Public: Aloqa formasidan xabar yuborish
 */
exports.create = async (req, res, next) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !message) {
      return next(new AppError('Ism, telefon va xabar matni talab qilinadi', 400));
    }

    const newMessage = await Message.create({
      name,
      phone,
      email: email || null,
      subject: subject || 'Umumiy savol',
      message,
    });

    res.status(201).json({
      status: 'success',
      message: "Xabaringiz qabul qilindi. Tez orada siz bilan bog'lanamiz!",
      data: { message: newMessage },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/messages
 * Admin: Barcha xabarlar (o'qilmagan birinchi)
 */
exports.getAll = async (req, res, next) => {
  try {
    const { read } = req.query;
    const filter = {};
    if (read === 'true') filter.read = true;
    if (read === 'false') filter.read = false;

    const messages = await Message.find(filter).sort({ read: 1, createdAt: -1 });
    const unreadCount = await Message.countDocuments({ read: false });

    res.status(200).json({
      status: 'success',
      results: messages.length,
      unreadCount,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/messages/:id/read
 * Admin: Xabarni o'qilgan deb belgilash
 */
exports.markRead = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!message) return next(new AppError('Xabar topilmadi', 404));

    res.status(200).json({ status: 'success', data: { message } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/messages/:id
 * Admin: Xabarni o'chirish
 */
exports.delete = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return next(new AppError('Xabar topilmadi', 404));

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};
