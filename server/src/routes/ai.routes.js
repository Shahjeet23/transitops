'use strict';

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.use(authorize('admin', 'fleet_manager', 'financial_analyst')); // Same roles as reports

router.post('/ask', aiController.askAssistant);

module.exports = router;
