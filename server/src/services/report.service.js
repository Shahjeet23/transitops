'use strict';

const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

/**
 * Get date filters for aggregation
 */
function getDateMatch(startDate, endDate, dateField = 'date') {
  const match = {};
  if (startDate || endDate) {
    match[dateField] = {};
    if (startDate) match[dateField].$gte = new Date(startDate);
    if (endDate) match[dateField].$lte = new Date(endDate);
  }
  return match;
}

/**
 * Calculates Fleet-wide Financial Summary (Revenue, Costs, Profit)
 */
async function getFinancialSummary(startDate, endDate) {
  // 1. Revenue (Completed Trips only)
  const tripMatch = { status: 'completed', ...getDateMatch(startDate, endDate, 'endDate') };
  const trips = await Trip.aggregate([
    { $match: tripMatch },
    { $group: { _id: null, totalRevenue: { $sum: '$revenue' } } },
  ]);
  const revenue = trips[0]?.totalRevenue || 0;

  // 2. General Expenses (Approved only)
  const expenseMatch = { status: 'approved', ...getDateMatch(startDate, endDate) };
  const expenses = await Expense.aggregate([
    { $match: expenseMatch },
    { $group: { _id: null, totalExpense: { $sum: '$amount' } } },
  ]);
  const generalExpenseCost = expenses[0]?.totalExpense || 0;

  // 3. Fuel Costs
  const fuelMatch = getDateMatch(startDate, endDate);
  const fuels = await FuelLog.aggregate([
    { $match: fuelMatch },
    { $group: { _id: null, totalFuel: { $sum: '$totalCost' } } },
  ]);
  const fuelCost = fuels[0]?.totalFuel || 0;

  // 4. Maintenance Costs (Completed only)
  const maintMatch = { status: 'completed', ...getDateMatch(startDate, endDate, 'completionDate') };
  const maint = await MaintenanceLog.aggregate([
    { $match: maintMatch },
    { $group: { _id: null, totalMaintenance: { $sum: '$cost' } } },
  ]);
  const maintenanceCost = maint[0]?.totalMaintenance || 0;

  const totalCosts = generalExpenseCost + fuelCost + maintenanceCost;
  const netProfit = revenue - totalCosts;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return {
    revenue,
    costs: {
      total: totalCosts,
      breakdown: {
        expenses: generalExpenseCost,
        fuel: fuelCost,
        maintenance: maintenanceCost,
      },
    },
    netProfit,
    profitMargin,
  };
}

/**
 * Calculates ROI per Vehicle
 */
async function getVehicleROI(startDate, endDate) {
  const vehicles = await Vehicle.find().select('_id plateNumber make model').lean();
  
  // Batch queries for all vehicles
  const roiData = await Promise.all(
    vehicles.map(async (vehicle) => {
      const vId = vehicle._id;

      // Revenue
      const trips = await Trip.aggregate([
        { $match: { vehicle: vId, status: 'completed', ...getDateMatch(startDate, endDate, 'endDate') } },
        { $group: { _id: null, revenue: { $sum: '$revenue' } } },
      ]);
      const revenue = trips[0]?.revenue || 0;

      // Expenses
      const expenses = await Expense.aggregate([
        { $match: { vehicle: vId, status: 'approved', ...getDateMatch(startDate, endDate) } },
        { $group: { _id: null, cost: { $sum: '$amount' } } },
      ]);
      const expCost = expenses[0]?.cost || 0;

      // Fuel
      const fuels = await FuelLog.aggregate([
        { $match: { vehicle: vId, ...getDateMatch(startDate, endDate) } },
        { $group: { _id: null, cost: { $sum: '$totalCost' } } },
      ]);
      const fuelCost = fuels[0]?.cost || 0;

      // Maintenance
      const maint = await MaintenanceLog.aggregate([
        { $match: { vehicle: vId, status: 'completed', ...getDateMatch(startDate, endDate, 'completionDate') } },
        { $group: { _id: null, cost: { $sum: '$cost' } } },
      ]);
      const maintCost = maint[0]?.cost || 0;

      const totalCosts = expCost + fuelCost + maintCost;
      const netProfit = revenue - totalCosts;

      return {
        vehicle: {
          id: vehicle._id,
          plateNumber: vehicle.plateNumber,
          name: `${vehicle.make} ${vehicle.model}`,
        },
        revenue,
        totalCosts,
        netProfit,
      };
    })
  );

  return roiData.sort((a, b) => b.netProfit - a.netProfit);
}

/**
 * Calculates Fuel Efficiency per Vehicle (km/L)
 */
async function getFuelEfficiency(startDate, endDate) {
  const vehicles = await Vehicle.find().select('_id plateNumber make model').lean();

  const efficiencyData = await Promise.all(
    vehicles.map(async (vehicle) => {
      const vId = vehicle._id;

      // Total Fuel consumed
      const fuels = await FuelLog.aggregate([
        { $match: { vehicle: vId, ...getDateMatch(startDate, endDate) } },
        { $group: { _id: null, totalLiters: { $sum: '$liters' }, count: { $sum: 1 } } },
      ]);
      
      const totalLiters = fuels[0]?.totalLiters || 0;
      const fillUps = fuels[0]?.count || 0;

      // Distance covered (from Trips or Odometer deltas). 
      // Using trips for exact range distance:
      const trips = await Trip.aggregate([
        { $match: { vehicle: vId, status: 'completed', ...getDateMatch(startDate, endDate, 'endDate') } },
        { $group: { _id: null, totalDistance: { $sum: '$distanceKm' } } },
      ]);
      
      const distance = trips[0]?.totalDistance || 0;
      const efficiency = totalLiters > 0 ? distance / totalLiters : 0;

      return {
        vehicle: {
          id: vehicle._id,
          plateNumber: vehicle.plateNumber,
          name: `${vehicle.make} ${vehicle.model}`,
        },
        distance,
        totalLiters,
        fillUps,
        efficiency, // km/L
      };
    })
  );

  return efficiencyData.filter(d => d.totalLiters > 0 || d.distance > 0).sort((a, b) => b.efficiency - a.efficiency);
}

module.exports = {
  getFinancialSummary,
  getVehicleROI,
  getFuelEfficiency,
};
