'use strict';

const vehicleService = require('../services/vehicle.service');
const { sendSuccess } = require('../utils/response.util');
const asyncHandler = require('../utils/asyncHandler');

const getVehicles = asyncHandler(async (req, res) => {
  const result = await vehicleService.getVehicles(req.query);
  return sendSuccess(res, result, 'Vehicles retrieved successfully');
});

const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  return sendSuccess(res, vehicle, 'Vehicle retrieved successfully');
});

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  return sendSuccess(res, vehicle, 'Vehicle created successfully', 201);
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  return sendSuccess(res, vehicle, 'Vehicle updated successfully');
});

const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id);
  return sendSuccess(res, null, 'Vehicle deleted successfully');
});

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
