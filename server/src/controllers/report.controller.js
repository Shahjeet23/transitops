'use strict';

const reportService = require('../services/report.service');

/**
 * @desc    Get financial summary (Revenue, Costs, Profit)
 * @route   GET /api/reports/financial-summary
 * @access  Private (Admin, Fleet Manager, Financial Analyst)
 */
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await reportService.getFinancialSummary(startDate, endDate);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Vehicle ROI
 * @route   GET /api/reports/vehicle-roi
 * @access  Private (Admin, Fleet Manager, Financial Analyst)
 */
exports.getVehicleROI = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const roiData = await reportService.getVehicleROI(startDate, endDate);
    res.status(200).json({
      success: true,
      data: roiData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Fuel Efficiency
 * @route   GET /api/reports/fuel-efficiency
 * @access  Private (Admin, Fleet Manager, Financial Analyst)
 */
exports.getFuelEfficiency = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const efficiencyData = await reportService.getFuelEfficiency(startDate, endDate);
    res.status(200).json({
      success: true,
      data: efficiencyData,
    });
  } catch (error) {
    next(error);
  }
};
