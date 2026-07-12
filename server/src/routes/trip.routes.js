'use strict';

const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

// View routes open to all authenticated
router.get('/', tripController.getTrips);
router.get('/:id', tripController.getTripById);

// Create / Update draft trips (dispatchers, managers)
router.use(authorize('admin', 'fleet_manager', 'dispatcher'));

router.post('/', tripController.createTrip);
router.put('/:id', tripController.updateTrip);

// Lifecycle actions
router.put('/:id/dispatch', tripController.dispatchTrip);
router.put('/:id/complete', tripController.completeTrip);
router.put('/:id/cancel', tripController.cancelTrip);

// Delete (admin only)
router.delete('/:id', authorize('admin'), tripController.deleteTrip);

module.exports = router;
