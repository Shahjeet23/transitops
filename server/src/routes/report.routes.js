'use strict';

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.use(authorize('admin', 'fleet_manager', 'financial_analyst'));

router.get('/financial-summary', reportController.getFinancialSummary);
router.get('/vehicle-roi', reportController.getVehicleROI);
router.get('/fuel-efficiency', reportController.getFuelEfficiency);

module.exports = router;
