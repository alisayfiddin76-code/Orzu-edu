const ContactSettings = require('../models/ContactSettings');
const AppError = require('../utils/appError');

/**
 * GET /api/v1/settings/contact
 * Public — hamma o'qiy oladi
 */
exports.getContactSettings = async (req, res, next) => {
  try {
    const settings = await ContactSettings.findOne();

    // Agar bazada hech nima bo'lmasa, null qaytaramiz
    if (!settings) {
      return res.status(200).json({
        status: 'success',
        data: null
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { settings },
    });
  } catch (error) {
    console.error("Contact fetch error:", error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * PATCH /api/v1/settings/contact
 * Protected — faqat SUPER_ADMIN
 */
exports.updateContactSettings = async (req, res, next) => {
  try {
    const { phone_1, phone_2, email, main_address, branch_address, branches, instagram, telegram, youtube,
            weekdays_label, weekdays_hours, weekend_label, weekend_hours } = req.body;

    if (!phone_1 || !main_address) {
      return next(new AppError("Asosiy telefon va manzil talab qilinadi", 400));
    }

    let settings = await ContactSettings.findOne();

    if (!settings) {
      // Birinchi marta yaratish
      settings = await ContactSettings.create({
        phone_1, phone_2, email, main_address, branch_address, branches, instagram, telegram, youtube,
        weekdays_label, weekdays_hours, weekend_label, weekend_hours,
      });
    } else {
      // Mavjud yozuvni yangilash
      settings.phone_1 = phone_1;
      settings.phone_2 = phone_2 || null;
      settings.email = email || null;
      settings.main_address = main_address;
      settings.branch_address = branch_address || null;
      if (branches !== undefined) settings.branches = branches;
      settings.instagram = instagram || null;
      settings.telegram = telegram || null;
      settings.youtube = youtube || null;
      settings.weekdays_label = weekdays_label || 'Dushanba - Shanba';
      settings.weekdays_hours = weekdays_hours || '09:00 - 20:00';
      settings.weekend_label = weekend_label || 'Yakshanba';
      settings.weekend_hours = weekend_hours || 'Dam olish kuni';
      await settings.save();
    }


    res.status(200).json({
      status: 'success',
      message: "Aloqa ma'lumotlari muvaffaqiyatli yangilandi",
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};
