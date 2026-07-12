'use strict';

const driverService = require('../services/driver.service');

/**
 * @desc    Get all drivers (paginated)
 * @route   GET /api/drivers
 * @access  Private
 */
exports.getDrivers = async (req, res, next) => {
  try {
    const result = await driverService.getDrivers(req.query);
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
 * @desc    Get driver by ID
 * @route   GET /api/drivers/:id
 * @access  Private
 */
exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new driver
 * @route   POST /api/drivers
 * @access  Private (Admin, Fleet Manager, Dispatcher)
 */
exports.createDriver = async (req, res, next) => {
  try {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update driver
 * @route   PUT /api/drivers/:id
 * @access  Private (Admin, Fleet Manager, Dispatcher)
 */
exports.updateDriver = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete driver (soft delete)
 * @route   DELETE /api/drivers/:id
 * @access  Private (Admin, Fleet Manager)
 */
exports.deleteDriver = async (req, res, next) => {
  try {
    await driverService.deleteDriver(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
      message: 'Driver retired successfully',
    });
  } catch (error) {
    next(error);
  }
};
