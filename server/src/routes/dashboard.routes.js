'use strict';

const express    = require('express');
const router     = express.Router();
const { getSummary } = require('../controllers/dashboard.controller');
const authenticate   = require('../middleware/authenticate');

// GET /api/dashboard/summary — all authenticated roles
router.get('/summary', authenticate, getSummary);

module.exports = router;
