'use strict';

const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

/**
 * Retrieve a paginated list of vehicles
 */
async function getVehicles(query) {
  const { page = 1, limit = 10, search, status, type } = query;

  const filter = { isActive: true };

  if (status) {
    filter.status = status;
  }
  if (type) {
    filter.type = type;
  }

  if (search) {
    filter.$or = [
      { plateNumber: { $regex: search, $options: 'i' } },
      { make: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Vehicle.countDocuments(filter),
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
 * Retrieve a single vehicle by ID
 */
async function getVehicleById(id) {
  const vehicle = await Vehicle.findOne({ _id: id, isActive: true }).lean();
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }
  return vehicle;
}

/**
 * Create a new vehicle
 */
async function createVehicle(data) {
  // Check for uniqueness
  const existingPlate = await Vehicle.findOne({
    plateNumber: data.plateNumber.toUpperCase(),
  });
  if (existingPlate) {
    throw new AppError(`Vehicle with plate number ${data.plateNumber} already exists`, 409);
  }

  if (data.vin) {
    const existingVin = await Vehicle.findOne({ vin: data.vin.toUpperCase() });
    if (existingVin) {
      throw new AppError(`Vehicle with VIN ${data.vin} already exists`, 409);
    }
  }

  const vehicle = await Vehicle.create(data);
  return vehicle;
}

/**
 * Update a vehicle
 */
async function updateVehicle(id, data) {
  const vehicle = await Vehicle.findOne({ _id: id, isActive: true });
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (data.plateNumber && data.plateNumber.toUpperCase() !== vehicle.plateNumber) {
    const existingPlate = await Vehicle.findOne({
      plateNumber: data.plateNumber.toUpperCase(),
    });
    if (existingPlate) {
      throw new AppError(`Vehicle with plate number ${data.plateNumber} already exists`, 409);
    }
  }

  if (data.vin && data.vin.toUpperCase() !== vehicle.vin) {
    const existingVin = await Vehicle.findOne({ vin: data.vin.toUpperCase() });
    if (existingVin) {
      throw new AppError(`Vehicle with VIN ${data.vin} already exists`, 409);
    }
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updatedVehicle;
}

/**
 * Soft delete a vehicle
 */
async function deleteVehicle(id) {
  const vehicle = await Vehicle.findOne({ _id: id, isActive: true });
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (vehicle.status === 'on_trip' || vehicle.currentTrip) {
    throw new AppError('Cannot delete a vehicle that is currently on a trip', 400);
  }

  vehicle.isActive = false;
  vehicle.status = 'retired';
  await vehicle.save();

  return null;
}

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
