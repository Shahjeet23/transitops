'use strict';

const maintenanceService = require('../services/maintenance.service');

/**
 * @desc    Get all maintenance logs
 * @route   GET /api/maintenance
 * @access  Private
 */
exports.getMaintenances = async (req, res, next) => {
  try {
    const result = await maintenanceService.getMaintenances(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get maintenance log by ID
 * @route   GET /api/maintenance/:id
 * @access  Private
 */
exports.getMaintenanceById = async (req, res, next) => {
  try {
    const log = await maintenanceService.getMaintenanceById(req.params.id);
    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create scheduled maintenance
 * @route   POST /api/maintenance
 * @access  Private (Admin, Fleet Manager)
 */
exports.createMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.createMaintenance(req.body, req.user._id);
    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update scheduled maintenance
 * @route   PUT /api/maintenance/:id
 * @access  Private (Admin, Fleet Manager)
 */
exports.updateMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.updateMaintenance(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start maintenance
 * @route   PUT /api/maintenance/:id/start
 * @access  Private (Admin, Fleet Manager)
 */
exports.startMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.startMaintenance(req.params.id, req.body, req.user._id);
    res.status(200).json({
      success: true,
      data: log,
      message: 'Maintenance started',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete maintenance
 * @route   PUT /api/maintenance/:id/complete
 * @access  Private (Admin, Fleet Manager)
 */
exports.completeMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.completeMaintenance(req.params.id, req.body, req.user._id);
    res.status(200).json({
      success: true,
      data: log,
      message: 'Maintenance completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel maintenance
 * @route   PUT /api/maintenance/:id/cancel
 * @access  Private (Admin, Fleet Manager)
 */
exports.cancelMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.cancelMaintenance(req.params.id, req.body.cancellationReason, req.user._id);
    res.status(200).json({
      success: true,
      data: log,
      message: 'Maintenance cancelled',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete maintenance log (hard delete for scheduled/cancelled)
 * @route   DELETE /api/maintenance/:id
 * @access  Private (Admin)
 */
exports.deleteMaintenance = async (req, res, next) => {
  try {
    await maintenanceService.deleteMaintenance(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
      message: 'Maintenance record deleted',
    });
  } catch (error) {
    next(error);
  }
};
