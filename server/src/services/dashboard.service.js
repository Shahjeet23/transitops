'use strict';

const Vehicle        = require('../models/Vehicle');
const Driver         = require('../models/Driver');
const Trip           = require('../models/Trip');
const FuelLog        = require('../models/FuelLog');
const Expense        = require('../models/Expense');
const MaintenanceLog = require('../models/MaintenanceLog');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayStart() {
  return startOfDay(new Date());
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}



async function getDashboardSummary() {
  const [
    vehicleStats,
    driverStats,
    tripKpis,
    financialKpis,
    tripsChart,
    revenueExpenseChart,
    fuelChart,
    expenseCategoryChart,
    alerts,
    recentTrips,
    recentExpenses,
  ] = await Promise.all([
    _vehicleStats(),
    _driverStats(),
    _tripKpis(),
    _financialKpis(),
    _tripsChart(),
    _revenueExpenseChart(),
    _fuelChart(),
    _expenseCategoryChart(),
    _alerts(),
    _recentTrips(),
    _recentExpenses(),
  ]);

  // ── Compose KPI block ────────────────────────────────────────────────────
  const fleetUtilization =
    vehicleStats.total > 0
      ? parseFloat(((vehicleStats.on_trip / vehicleStats.total) * 100).toFixed(1))
      : 0;

  const profit = financialKpis.monthRevenue - financialKpis.monthExpenses;

  return {
    kpis: {
      // Fleet
      totalVehicles:     vehicleStats.total,
      fleetUtilization,
      // Drivers
      totalDrivers:      driverStats.total,
      activeDrivers:     driverStats.available + driverStats.on_trip,
      // Trips
      activeTrips:       tripKpis.active,
      tripsToday:        tripKpis.today,
      tripsThisMonth:    tripKpis.thisMonth,
      tripsCompleted:    tripKpis.completed,
      // Financials (current month)
      monthRevenue:      financialKpis.monthRevenue,
      monthExpenses:     financialKpis.monthExpenses,
      monthFuelCost:     financialKpis.monthFuelCost,
      profit,
      pendingExpenses:   financialKpis.pendingExpenses,
    },
    vehicleStatusBreakdown: vehicleStats,
    driverStatusBreakdown:  driverStats,
    tripsChart,
    revenueExpenseChart,
    fuelChart,
    expenseCategoryChart,
    alerts,
    recentTrips,
    recentExpenses,
  };
}

// ─── Sub-queries ──────────────────────────────────────────────────────────────

async function _vehicleStats() {
  const rows = await Vehicle.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const stats = { total: 0, available: 0, on_trip: 0, in_maintenance: 0, retired: 0 };
  for (const r of rows) {
    const key = r._id.replace('-', '_');
    stats[key] = r.count;
    stats.total += r.count;
  }
  return stats;
}

async function _driverStats() {
  const rows = await Driver.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const stats = { total: 0, available: 0, on_trip: 0, off_duty: 0, suspended: 0 };
  for (const r of rows) {
    const key = r._id.replace('-', '_');
    stats[key] = r.count;
    stats.total += r.count;
  }
  return stats;
}

async function _tripKpis() {
  const [active, today, thisMonth, completed] = await Promise.all([
    Trip.countDocuments({ status: { $in: ['dispatched', 'in_progress'] } }),
    Trip.countDocuments({ createdAt: { $gte: todayStart() } }),
    Trip.countDocuments({ createdAt: { $gte: startOfMonth() } }),
    Trip.countDocuments({ status: 'completed' }),
  ]);
  return { active, today, thisMonth, completed };
}

async function _financialKpis() {
  const monthStart = startOfMonth();

  const [revenueRows, expenseRows, fuelRows, pendingExpenses] = await Promise.all([
    Trip.aggregate([
      { $match: { status: 'completed', updatedAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$revenue' } } },
    ]),
    Expense.aggregate([
      { $match: { status: 'approved', date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    FuelLog.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } },
    ]),
    Expense.countDocuments({ status: 'pending' }),
  ]);

  return {
    monthRevenue:    revenueRows[0]?.total  ?? 0,
    monthExpenses:   expenseRows[0]?.total  ?? 0,
    monthFuelCost:   fuelRows[0]?.total     ?? 0,
    pendingExpenses,
  };
}

/** Trips completed per day — last 30 days */
async function _tripsChart() {
  const since = daysAgo(29);
  const rows = await Trip.aggregate([
    { $match: { status: 'completed', updatedAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);
  return rows;
}

/** Daily revenue (completed trips) + daily approved expenses — last 30 days */
async function _revenueExpenseChart() {
  const since = daysAgo(29);

  const [revRows, expRows] = await Promise.all([
    Trip.aggregate([
      { $match: { status: 'completed', updatedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          revenue: { $sum: '$revenue' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Expense.aggregate([
      { $match: { status: 'approved', date: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          expenses: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Merge by date
  const map = {};
  for (const r of revRows)  map[r._id] = { date: r._id, revenue: r.revenue, expenses: 0 };
  for (const r of expRows) {
    if (map[r._id]) map[r._id].expenses = r.expenses;
    else map[r._id] = { date: r._id, revenue: 0, expenses: r.expenses };
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

/** Daily fuel cost — last 30 days */
async function _fuelChart() {
  const since = daysAgo(29);
  return FuelLog.aggregate([
    { $match: { date: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        cost: { $sum: '$totalCost' },
        liters: { $sum: '$liters' },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', cost: 1, liters: 1 } },
  ]);
}

/** Expense breakdown by category (all time approved) */
async function _expenseCategoryChart() {
  return Expense.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$category', amount: { $sum: '$amount' } } },
    { $sort: { amount: -1 } },
    { $project: { _id: 0, category: '$_id', amount: 1 } },
  ]);
}

/** Compliance alerts */
async function _alerts() {
  const today    = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  const [
    licenseExpired,
    licenseExpiring,
    insuranceExpiring,
    registrationExpiring,
    vehiclesInMaintenance,
    pendingExpenses,
  ] = await Promise.all([
    Driver.find({ isActive: true, licenseExpiry: { $lt: today } })
      .select('name licenseNumber licenseExpiry').lean(),
    Driver.find({ isActive: true, licenseExpiry: { $gte: today, $lte: in30Days } })
      .select('name licenseNumber licenseExpiry').lean(),
    Vehicle.find({ isActive: true, insuranceExpiry: { $gte: today, $lte: in30Days } })
      .select('plateNumber make model insuranceExpiry').lean(),
    Vehicle.find({ isActive: true, registrationExpiry: { $gte: today, $lte: in30Days } })
      .select('plateNumber make model registrationExpiry').lean(),
    Vehicle.find({ isActive: true, status: 'in_maintenance' })
      .select('plateNumber make model').lean(),
    Expense.countDocuments({ status: 'pending' }),
  ]);

  return {
    licenseExpired,
    licenseExpiring,
    insuranceExpiring,
    registrationExpiring,
    vehiclesInMaintenance,
    pendingExpensesCount: pendingExpenses,
  };
}

/** Last 5 trips with vehicle + driver populated */
async function _recentTrips() {
  return Trip.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('vehicle', 'plateNumber make model')
    .populate('driver', 'name')
    .lean();
}

/** Last 5 approved/pending expenses with vehicle populated */
async function _recentExpenses() {
  return Expense.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('vehicle', 'plateNumber make model')
    .lean();
}

module.exports = { getDashboardSummary };
