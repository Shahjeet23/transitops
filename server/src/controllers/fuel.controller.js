'use strict';

const fuelService = require('../services/fuel.service');

/**
 * @desc    Get all fuel logs
 * @route   GET /api/fuel
 * @access  Private
 */
exports.getFuelLogs = async (req, res, next) => {
  try {
    const result = await fuelService.getFuelLogs(req.query);
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
 * @desc    Get fuel log by ID
 * @route   GET /api/fuel/:id
 * @access  Private
 */
exports.getFuelLogById = async (req, res, next) => {
  try {
    const log = await fuelService.getFuelLogById(req.params.id);
    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create fuel log
 * @route   POST /api/fuel
 * @access  Private (Admin, Fleet Manager, Dispatcher)
 */
exports.createFuelLog = async (req, res, next) => {
  try {
    const log = await fuelService.createFuelLog(req.body, req.user._id);
    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update fuel log
 * @route   PUT /api/fuel/:id
 * @access  Private (Admin, Fleet Manager)
 */
exports.updateFuelLog = async (req, res, next) => {
  try {
    const log = await fuelService.updateFuelLog(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete fuel log
 * @route   DELETE /api/fuel/:id
 * @access  Private (Admin)
 */
exports.deleteFuelLog = async (req, res, next) => {
  try {
    await fuelService.deleteFuelLog(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
      message: 'Fuel log deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
