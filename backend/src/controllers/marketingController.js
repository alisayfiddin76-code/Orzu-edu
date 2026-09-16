const Lead = require("../models/Lead");
const AppError = require("../utils/appError");

/**
 * Get lead distribution and percentages by marketing source
 * GET /api/v1/leads/marketing/by-source
 * Restricted to SUPER_ADMIN, MANAGER
 */
exports.getLeadsBySource = async (req, res, next) => {
  try {
    const totalLeads = await Lead.countDocuments();
    if (totalLeads === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          totalLeads: 0,
          leadsBySource: [],
        },
      });
    }

    const leadsBySource = await Lead.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          source: { $ifNull: ["$_id", "UNSPECIFIED"] },
          _id: 0,
          count: 1,
          percentage: {
            $multiply: [
              { $divide: ["$count", totalLeads] },
              100,
            ],
          },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Round percentage values to 2 decimal places
    const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
    leadsBySource.forEach((item) => {
      item.percentage = roundToTwo(item.percentage);
    });

    res.status(200).json({
      status: "success",
      data: {
        totalLeads,
        leadsBySource,
      },
    });
  } catch (error) {
    next(error);
  }
};
