'use strict';

const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuel.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

// View routes open to all authenticated users
router.get('/', fuelController.getFuelLogs);
router.get('/:id', fuelController.getFuelLogById);

// Create route (Admin, Fleet Manager, Dispatcher)
router.post('/', authorize('admin', 'fleet_manager', 'dispatcher'), fuelController.createFuelLog);

// Update route (Admin, Fleet Manager)
router.put('/:id', authorize('admin', 'fleet_manager'), fuelController.updateFuelLog);

// Delete (Admin only)
router.delete('/:id', authorize('admin'), fuelController.deleteFuelLog);

module.exports = router;
