'use strict';

const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Apply authentication to all vehicle routes
router.use(authenticate);

// GET and GET /:id are open to all authenticated roles (or at least those who need to view vehicles)
// In a real app we might restrict 'driver' role from seeing all vehicles, but let's stick to standard for now.
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);

// POST, PUT, DELETE restricted to higher roles
// e.g. admin, fleet_manager, dispatcher
router.use(authorize('admin', 'fleet_manager'));

router.post('/', vehicleController.createVehicle);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
