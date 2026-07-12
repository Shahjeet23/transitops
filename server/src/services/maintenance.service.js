'use strict';

const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');
const notificationService = require('./notification.service');

/**
 * Retrieve a paginated list of maintenance logs
 */
async function getMaintenances(query) {
  const { page = 1, limit = 10, search, status, type } = query;

  const filter = {};

  if (status) filter.status = status;
  if (type) filter.type = type;

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    MaintenanceLog.find(filter)
      .populate('vehicle', 'plateNumber make model type')
      .populate('createdBy', 'name email')
      .sort({ scheduledDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    MaintenanceLog.countDocuments(filter),
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
 * Retrieve a single maintenance log by ID
 */
async function getMaintenanceById(id) {
  const log = await MaintenanceLog.findById(id)
    .populate('vehicle', 'plateNumber make model type')
    .populate('createdBy', 'name email')
    .populate('closedBy', 'name email')
    .lean();

  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }
  return log;
}

/**
 * Create a new maintenance log (scheduled)
 */
async function createMaintenance(data, userId) {
  data.createdBy = userId;
  data.status = 'scheduled';

  const log = await MaintenanceLog.create(data);

  // Notify Safety Officer
  notificationService.createNotification({
    title: 'Maintenance Scheduled',
    message: `Maintenance scheduled for a vehicle.`,
    type: 'maintenance',
    recipientRole: 'safety_officer'
  }).catch(err => console.error('Notification error:', err));

  return log;
}

/**
 * Update a scheduled maintenance log
 */
async function updateMaintenance(id, data) {
  const log = await MaintenanceLog.findById(id);
  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }

  if (log.status !== 'scheduled') {
    throw new AppError('Can only update maintenance logs in scheduled status', 400);
  }

  const updatedLog = await MaintenanceLog.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updatedLog;
}

/**
 * Start maintenance (transition to in_progress)
 */
async function startMaintenance(id, data, userId) {
  const log = await MaintenanceLog.findById(id);
  
  if (!log) throw new AppError('Maintenance log not found', 404);
  
  if (log.status !== 'scheduled') {
    throw new AppError(`Cannot start maintenance in ${log.status} status`, 400);
  }

  const vehicle = await Vehicle.findById(log.vehicle);
  if (!vehicle) throw new AppError('Vehicle not found', 404);

  // Update Log
  log.status = 'in_progress';
  log.startDate = data.startDate || new Date();
  if (data.mileageAtServiceKm != null) log.mileageAtServiceKm = data.mileageAtServiceKm;
  
  await log.save();

  // Update Vehicle Status
  vehicle.status = 'in_maintenance';
  await vehicle.save();

  // Notify Safety Officer
  notificationService.createNotification({
    title: 'Maintenance Started',
    message: `Maintenance started for vehicle ${vehicle.plateNumber}.`,
    type: 'maintenance',
    recipientRole: 'safety_officer'
  }).catch(err => console.error('Notification error:', err));

  return log;
}

/**
 * Complete maintenance
 */
async function completeMaintenance(id, data, userId) {
  const log = await MaintenanceLog.findById(id);
  
  if (!log) throw new AppError('Maintenance log not found', 404);
  
  if (log.status !== 'in_progress') {
    throw new AppError(`Cannot complete maintenance in ${log.status} status`, 400);
  }

  // Update Log
  log.status = 'completed';
  log.closedBy = userId;
  log.completedDate = data.completedDate || new Date();
  
  if (data.parts) log.parts = data.parts;
  if (data.laborCost != null) log.laborCost = data.laborCost;
  if (data.otherCosts != null) log.otherCosts = data.otherCosts;
  if (data.notes) log.notes = data.notes;
  if (data.nextServiceDate) log.nextServiceDate = data.nextServiceDate;
  if (data.nextServiceKm) log.nextServiceKm = data.nextServiceKm;

  await log.save();

  // Free Vehicle
  const vehicle = await Vehicle.findById(log.vehicle);
  if (vehicle) {
    vehicle.status = 'available';
    // If we have an updated mileage at the time of service completion
    // We could potentially update the vehicle.currentOdometerKm but
    // usually maintenance doesn't add mileage. We leave it as is unless required.
    await vehicle.save();
  }

  // Notify Fleet Manager & Safety Officer (using 'all' for now, or just emit twice)
  notificationService.createNotification({
    title: 'Maintenance Completed',
    message: `Maintenance completed for vehicle.`,
    type: 'maintenance',
    recipientRole: 'safety_officer'
  }).catch(err => console.error('Notification error:', err));
  
  notificationService.createNotification({
    title: 'Maintenance Completed',
    message: `Maintenance completed for vehicle.`,
    type: 'maintenance',
    recipientRole: 'fleet_manager'
  }).catch(err => console.error('Notification error:', err));

  return log;
}

/**
 * Cancel maintenance
 */
async function cancelMaintenance(id, reason, userId) {
  const log = await MaintenanceLog.findById(id);
  
  if (!log) throw new AppError('Maintenance log not found', 404);

  if (log.status === 'completed' || log.status === 'cancelled') {
    throw new AppError(`Cannot cancel maintenance in ${log.status} status`, 400);
  }

  // If it was already in_progress, free the vehicle
  if (log.status === 'in_progress') {
    const vehicle = await Vehicle.findById(log.vehicle);
    if (vehicle) {
      vehicle.status = 'available';
      await vehicle.save();
    }
  }

  log.status = 'cancelled';
  log.notes = log.notes ? `${log.notes}\nCancellation Reason: ${reason}` : `Cancellation Reason: ${reason}`;
  log.closedBy = userId;
  await log.save();

  return log;
}

/**
 * Delete maintenance (hard delete for scheduled only)
 */
async function deleteMaintenance(id) {
  const log = await MaintenanceLog.findById(id);
  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }

  if (log.status !== 'scheduled' && log.status !== 'cancelled') {
    throw new AppError('Can only delete maintenance logs in scheduled or cancelled status', 400);
  }

  await log.deleteOne();
  return null;
}

module.exports = {
  getMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance,
  deleteMaintenance,
};
