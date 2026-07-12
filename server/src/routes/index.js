'use strict';

const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard.routes');
const vehicleRoutes   = require('./vehicle.routes');
const authRoutes   = require('./auth.routes');

// Mount route modules
router.use('/auth',      authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/vehicles',  vehicleRoutes);

// Future phases — uncomment as implemented:
router.use('/drivers',     require('./driver.routes'));
router.use('/trips',       require('./trip.routes'));
router.use('/maintenance', require('./maintenance.routes'));
router.use('/fuel',        require('./fuel.routes'));
router.use('/expenses',    require('./expense.routes'));
// router.use('/dashboard',   require('./dashboard.routes'));
router.use('/reports',     require('./report.routes'));
router.use('/ai',          require('./ai.routes'));
router.use('/notifications', require('./notification.routes'));

module.exports = router;
