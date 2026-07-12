'use strict';

const Driver = require('../models/Driver');
const AppError = require('../utils/AppError');

/**
 * Retrieve a paginated list of drivers
 */
async function getDrivers(query) {
  const { page = 1, limit = 10, search, status } = query;

  const filter = { isActive: true };

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Driver.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Driver.countDocuments(filter),
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
 * Retrieve a single driver by ID
 */
async function getDriverById(id) {
  const driver = await Driver.findOne({ _id: id, isActive: true }).lean();
  if (!driver) {
    throw new AppError('Driver not found', 404);
  }
  return driver;
}

/**
 * Create a new driver
 */
async function createDriver(data) {
  // Check for uniqueness
  if (data.email) {
    const existingEmail = await Driver.findOne({
      email: data.email.toLowerCase(),
    });
    if (existingEmail) {
      throw new AppError(`Driver with email ${data.email} already exists`, 409);
    }
  }

  if (data.licenseNumber) {
    const existingLicense = await Driver.findOne({
      licenseNumber: data.licenseNumber.toUpperCase(),
    });
    if (existingLicense) {
      throw new AppError(`Driver with license number ${data.licenseNumber} already exists`, 409);
    }
  }

  const driver = await Driver.create(data);
  return driver;
}

/**
 * Update a driver
 */
async function updateDriver(id, data) {
  const driver = await Driver.findOne({ _id: id, isActive: true });
  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  if (data.email && data.email.toLowerCase() !== driver.email) {
    const existingEmail = await Driver.findOne({
      email: data.email.toLowerCase(),
    });
    if (existingEmail) {
      throw new AppError(`Driver with email ${data.email} already exists`, 409);
    }
  }

  if (data.licenseNumber && data.licenseNumber.toUpperCase() !== driver.licenseNumber) {
    const existingLicense = await Driver.findOne({
      licenseNumber: data.licenseNumber.toUpperCase(),
    });
    if (existingLicense) {
      throw new AppError(`Driver with license number ${data.licenseNumber} already exists`, 409);
    }
  }

  const updatedDriver = await Driver.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updatedDriver;
}

/**
 * Soft delete a driver
 */
async function deleteDriver(id) {
  const driver = await Driver.findOne({ _id: id, isActive: true });
  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  if (driver.status === 'on_trip' || driver.currentTrip) {
    throw new AppError('Cannot delete a driver that is currently on a trip', 400);
  }

  driver.isActive = false;
  driver.status = 'retired'; // Since 'retired' is not in the Driver STATUSES, wait, Driver status allows 'available', 'on_trip', 'off_duty', 'suspended'. Let's set it to 'suspended' or remove status update.
  // Actually, 'retired' isn't in STATUSES = ['available', 'on_trip', 'off_duty', 'suspended'].
  // Let's use 'suspended' for soft delete.
  driver.status = 'suspended';
  await driver.save();

  return null;
}

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
};
