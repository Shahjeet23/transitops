'use strict';

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Apply authentication to all driver routes
router.use(authenticate);

// GET routes open to all authenticated roles
router.get('/', driverController.getDrivers);
router.get('/:id', driverController.getDriverById);

// POST, PUT, DELETE restricted to higher roles
// e.g., admin, fleet_manager, dispatcher
router.use(authorize('admin', 'fleet_manager', 'dispatcher'));

router.post('/', driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

module.exports = router;
