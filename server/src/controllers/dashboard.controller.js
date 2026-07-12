'use strict';

const dashboardService = require('../services/dashboard.service');
const { sendSuccess }  = require('../utils/response.util');
const asyncHandler     = require('../utils/asyncHandler');

/**
 * GET /api/dashboard/summary
 * Returns the full dashboard payload — KPIs, charts, alerts, recent activity.
 */
const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardSummary();
  return sendSuccess(res, data, 'Dashboard data retrieved successfully');
});

module.exports = { getSummary };
