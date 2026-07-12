'use strict';

const tripService = require('../services/trip.service');

/**
 * @desc    Get all trips
 * @route   GET /api/trips
 * @access  Private
 */
exports.getTrips = async (req, res, next) => {
  try {
    const result = await tripService.getTrips(req.query);
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
 * @desc    Get trip by ID
 * @route   GET /api/trips/:id
 * @access  Private
 */
exports.getTripById = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id);
    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create draft trip
 * @route   POST /api/trips
 * @access  Private
 */
exports.createTrip = async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.body, req.user._id);
    res.status(201).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update draft trip
 * @route   PUT /api/trips/:id
 * @access  Private
 */
exports.updateTrip = async (req, res, next) => {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dispatch trip
 * @route   PUT /api/trips/:id/dispatch
 * @access  Private (Dispatcher, Fleet Manager, Admin)
 */
exports.dispatchTrip = async (req, res, next) => {
  try {
    const trip = await tripService.dispatchTrip(req.params.id, req.body, req.user._id);
    res.status(200).json({
      success: true,
      data: trip,
      message: 'Trip dispatched successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete trip
 * @route   PUT /api/trips/:id/complete
 * @access  Private (Dispatcher, Fleet Manager, Admin)
 */
exports.completeTrip = async (req, res, next) => {
  try {
    const trip = await tripService.completeTrip(req.params.id, req.body, req.user._id);
    res.status(200).json({
      success: true,
      data: trip,
      message: 'Trip completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel trip
 * @route   PUT /api/trips/:id/cancel
 * @access  Private (Dispatcher, Fleet Manager, Admin)
 */
exports.cancelTrip = async (req, res, next) => {
  try {
    const trip = await tripService.cancelTrip(req.params.id, req.body.cancellationReason, req.user._id);
    res.status(200).json({
      success: true,
      data: trip,
      message: 'Trip cancelled',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete trip (hard delete for drafts/cancelled)
 * @route   DELETE /api/trips/:id
 * @access  Private (Admin)
 */
exports.deleteTrip = async (req, res, next) => {
  try {
    await tripService.deleteTrip(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
      message: 'Trip deleted',
    });
  } catch (error) {
    next(error);
  }
};
