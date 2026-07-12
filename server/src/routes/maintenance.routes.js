'use strict';

const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

// View routes open to all authenticated users
router.get('/', maintenanceController.getMaintenances);
router.get('/:id', maintenanceController.getMaintenanceById);

// Create / Update scheduled maintenance (admin, managers)
router.use(authorize('admin', 'fleet_manager'));

router.post('/', maintenanceController.createMaintenance);
router.put('/:id', maintenanceController.updateMaintenance);

// Lifecycle actions
router.put('/:id/start', maintenanceController.startMaintenance);
router.put('/:id/complete', maintenanceController.completeMaintenance);
router.put('/:id/cancel', maintenanceController.cancelMaintenance);

// Delete (admin only)
router.delete('/:id', authorize('admin'), maintenanceController.deleteMaintenance);

module.exports = router;
