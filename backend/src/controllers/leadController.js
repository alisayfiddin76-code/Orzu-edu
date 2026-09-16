const Lead = require("../models/Lead");
const AppError = require("../utils/appError");

// Helper to clean and format phone number (+998XXXXXXXXX format)
const cleanPhone = (val) => {
  if (!val) return val;
  let clean = String(val).replace(/[\s\-\(\)]/g, '');
  if (!clean.startsWith('+998')) {
    clean = clean.startsWith('998') ? '+' + clean : '+998' + clean;
  }
  return clean;
};

exports.createLead = async (req, res, next) => {
  try {
    const { fullname, phone, course, source, note, birthDate } = req.body;

    if (!fullname || !phone) {
      return next(new AppError("Ism va telefon raqami majburiy maydonlar", 400));
    }

    const formattedPhone = cleanPhone(phone);

    // Tizimda ushbu telefon raqami bilan foydalanuvchi bor-yo'qligini tekshirish
    const User = require("../models/User");
    const userExists = await User.findOne({ phone: formattedPhone });
    if (userExists) {
      return next(new AppError("Bu telefon raqami bilan foydalanuvchi allaqachon ro'yxatdan o'tgan. Iltimos, boshqa raqam kiriting.", 400));
    }

    let birthDateFormatted = birthDate;
    if (birthDate && String(birthDate).includes('-')) {
      birthDateFormatted = String(birthDate).replace(/-/g, '');
    }

    const lead = await Lead.create({ 
      fullname, 
      phone: formattedPhone, 
      course, 
      source, 
      note, 
      birthDate: birthDateFormatted || null 
    });

    res.status(201).json({
      status: "success",
      data: { lead }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all leads (excluding REGISTERED - those are now students)
 * GET /api/v1/leads
 * Protected: SUPER_ADMIN, MANAGER
 */
exports.getAllLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find({ status: { $ne: "REGISTERED" } }).sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      results: leads.length,
      data: { leads }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update lead status
 * PATCH /api/v1/leads/:id
 * Protected: SUPER_ADMIN, MANAGER
 */
exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!lead) return next(new AppError("Ariza topilmadi", 404));
    res.status(200).json({ status: "success", data: { lead } });
  } catch (error) {
    next(error);
  }
};
