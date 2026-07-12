'use strict';

require('../config/env'); // Validates required env vars
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@transitops.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'System Admin';

async function seed() {
  try {
    await connectDB();

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`[Seeder] Master admin already exists: ${ADMIN_EMAIL}`);
      await disconnectDB();
      process.exit(0);
    }

    // Create master admin — bypasses the registerUser service (which blocks admin role)
    const user = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // hashed by pre-save hook
      role: 'admin',
      isActive: true,
    });

    console.log('\n[Seeder] ✓ Master admin created');
    console.log(`  Name    : ${user.name}`);
    console.log(`  Email   : ${user.email}`);
    console.log(`  Role    : ${user.role}`);
    console.log(`  Role    : ${user.password}`);
    console.log('\n  ⚠  Change ADMIN_PASSWORD in .env after first login!\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Error:', err.message);
    await disconnectDB();
    process.exit(1);
  }
}

seed();
