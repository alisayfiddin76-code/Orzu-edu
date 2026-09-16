const express = require("express");
const leadController = require("../controllers/leadController");
const marketingController = require("../controllers/marketingController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Public: anyone can submit a lead from website
router.post("/", leadController.createLead);

// Protected: Only staff can view or update leads
router.use(authMiddleware.protect);
router.get("/marketing/by-source", authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"), marketingController.getLeadsBySource);
router.get("/", authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"), leadController.getAllLeads);
router.patch("/:id", authMiddleware.restrictTo("SUPER_ADMIN", "MANAGER"), leadController.updateLead);

module.exports = router;
