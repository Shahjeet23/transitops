'use strict';

const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const AppError = require('../utils/AppError');
const notificationService = require('./notification.service');

/**
 * Retrieve a paginated list of trips
 */
async function getTrips(query) {
  const { page = 1, limit = 10, search, status } = query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.tripNumber = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Trip.find(filter)
      .populate('vehicle', 'plateNumber make model type capacityKg status')
      .populate('driver', 'name email phone licenseNumber status')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Trip.countDocuments(filter),
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
 * Retrieve a single trip by ID
 */
async function getTripById(id) {
  const trip = await Trip.findById(id)
    .populate('vehicle', 'plateNumber make model type capacityKg status')
    .populate('driver', 'name email phone licenseNumber status')
    .populate('createdBy', 'name email')
    .populate('dispatchedBy', 'name email')
    .populate('completedBy', 'name email')
    .lean();

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }
  return trip;
}

/**
 * Create a new trip
 */
async function createTrip(data, userId) {
  data.createdBy = userId;
  data.status = 'draft';

  const trip = await Trip.create(data);
  return trip;
}

/**
 * Update a draft trip
 */
async function updateTrip(id, data) {
  const trip = await Trip.findById(id);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.status !== 'draft') {
    throw new AppError('Can only update trips in draft status', 400);
  }

  const updatedTrip = await Trip.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updatedTrip;
}

/**
 * Dispatch a trip
 */
async function dispatchTrip(id, data, userId) {
  const trip = await Trip.findById(id);
  
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }
  
  if (trip.status !== 'draft') {
    throw new AppError(`Cannot dispatch trip in ${trip.status} status`, 400);
  }

  // Check vehicle and driver availability
  const vehicle = await Vehicle.findById(trip.vehicle);
  if (!vehicle || vehicle.status !== 'available') {
    throw new AppError('Assigned vehicle is not available', 400);
  }

  const driver = await Driver.findById(trip.driver);
  if (!driver || driver.status !== 'available') {
    throw new AppError('Assigned driver is not available', 400);
  }

  // Update Trip
  trip.status = 'dispatched';
  trip.dispatchedBy = userId;
  if (data.actualDeparture) {
    trip.actualDeparture = data.actualDeparture;
    trip.status = 'in_progress';
  }
  if (data.odometerStart != null) trip.odometerStart = data.odometerStart;
  
  await trip.save();

  // Update Vehicle and Driver
  vehicle.status = 'on_trip';
  vehicle.currentTrip = trip._id;
  await vehicle.save();

  driver.status = 'on_trip';
  driver.currentTrip = trip._id;
  driver.currentVehicle = vehicle._id;
  await driver.save();

  // Notify Fleet Manager
  notificationService.createNotification({
    title: 'Trip Dispatched',
    message: `Trip ${trip.tripNumber || id} has been dispatched for vehicle ${vehicle.plateNumber}.`,
    type: 'trip',
    recipientRole: 'fleet_manager'
  }).catch(err => console.error('Notification error:', err));

  return trip;
}

/**
 * Complete a trip
 */
async function completeTrip(id, data, userId) {
  const trip = await Trip.findById(id);
  
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }
  
  if (trip.status !== 'dispatched' && trip.status !== 'in_progress') {
    throw new AppError(`Cannot complete trip in ${trip.status} status`, 400);
  }

  // Update Trip
  trip.status = 'completed';
  trip.completedBy = userId;
  trip.actualArrival = data.actualArrival || new Date();
  
  if (data.odometerEnd != null) trip.odometerEnd = data.odometerEnd;
  if (data.revenue != null) trip.revenue = data.revenue;
  if (data.notes) trip.notes = data.notes;

  await trip.save();

  // Free Vehicle and Driver
  const vehicle = await Vehicle.findById(trip.vehicle);
  if (vehicle) {
    vehicle.status = 'available';
    vehicle.currentTrip = null;
    if (data.odometerEnd != null) {
      vehicle.currentOdometerKm = data.odometerEnd;
    }
    await vehicle.save();
  }

  const driver = await Driver.findById(trip.driver);
  if (driver) {
    driver.status = 'available';
    driver.currentTrip = null;
    driver.currentVehicle = null;
    await driver.save();
  }

  // Notify Fleet Manager
  notificationService.createNotification({
    title: 'Trip Completed',
    message: `Trip ${trip.tripNumber || id} has been completed.`,
    type: 'trip',
    recipientRole: 'fleet_manager'
  }).catch(err => console.error('Notification error:', err));

  return trip;
}

/**
 * Cancel a trip
 */
async function cancelTrip(id, reason, userId) {
  const trip = await Trip.findById(id);
  
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.status === 'completed' || trip.status === 'cancelled') {
    throw new AppError(`Cannot cancel trip in ${trip.status} status`, 400);
  }

  // If it was already dispatched, we need to free the assets
  if (trip.status === 'dispatched' || trip.status === 'in_progress') {
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle) {
      vehicle.status = 'available';
      vehicle.currentTrip = null;
      await vehicle.save();
    }

    const driver = await Driver.findById(trip.driver);
    if (driver) {
      driver.status = 'available';
      driver.currentTrip = null;
      driver.currentVehicle = null;
      await driver.save();
    }
  }

  trip.status = 'cancelled';
  trip.cancellationReason = reason;
  await trip.save();

  // Notify Fleet Manager
  notificationService.createNotification({
    title: 'Trip Cancelled',
    message: `Trip ${trip.tripNumber || id} was cancelled. Reason: ${reason}`,
    type: 'trip',
    recipientRole: 'fleet_manager'
  }).catch(err => console.error('Notification error:', err));

  return trip;
}

/**
 * Delete a trip (hard delete for drafts only)
 */
async function deleteTrip(id) {
  const trip = await Trip.findById(id);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.status !== 'draft' && trip.status !== 'cancelled') {
    throw new AppError('Can only delete trips in draft or cancelled status', 400);
  }

  await trip.deleteOne();
  return null;
}

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
};
