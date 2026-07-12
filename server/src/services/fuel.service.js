'use strict';

const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

/**
 * Get all fuel logs with pagination and filters
 */
async function getFuelLogs(query) {
  const { page = 1, limit = 10, vehicleId, startDate, endDate } = query;

  const filter = {};

  if (vehicleId) filter.vehicle = vehicleId;
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    FuelLog.find(filter)
      .populate('vehicle', 'plateNumber make model')
      .populate('driver', 'name')
      .populate('createdBy', 'name')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    FuelLog.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get fuel log by ID
 */
async function getFuelLogById(id) {
  const log = await FuelLog.findById(id)
    .populate('vehicle', 'plateNumber make model')
    .populate('driver', 'name')
    .populate('createdBy', 'name')
    .lean();

  if (!log) {
    throw new AppError('Fuel log not found', 404);
  }
  return log;
}

/**
 * Create a new fuel log
 */
async function createFuelLog(data, userId) {
  data.createdBy = userId;

  const log = await FuelLog.create(data);

  // Update vehicle odometer if this fill-up odometer is greater
  if (log.odometerKm) {
    const vehicle = await Vehicle.findById(log.vehicle);
    if (vehicle && log.odometerKm > vehicle.currentOdometerKm) {
      vehicle.currentOdometerKm = log.odometerKm;
      await vehicle.save();
    }
  }

  return log;
}

/**
 * Update an existing fuel log
 */
async function updateFuelLog(id, data) {
  const log = await FuelLog.findById(id);
  
  if (!log) {
    throw new AppError('Fuel log not found', 404);
  }

  // Assign updated fields
  Object.assign(log, data);

  // Mongoose pre-save hook will recalculate totalCost automatically
  await log.save();

  // We could theoretically check if odometerKm changed and if we need to update Vehicle,
  // but for simplicity, we assume primary odometer tracking happens via trips/initial fuel create.
  
  return log;
}

/**
 * Delete a fuel log
 */
async function deleteFuelLog(id) {
  const log = await FuelLog.findById(id);
  if (!log) {
    throw new AppError('Fuel log not found', 404);
  }

  await log.deleteOne();
  return null;
}

module.exports = {
  getFuelLogs,
  getFuelLogById,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
};
