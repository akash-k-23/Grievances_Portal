/**
 * Grievances Portal — Database Seeding Script
 * Seeds users, admin/officer, grievances, and messages into MongoDB Atlas (database: grievence_portal)
 * and synchronizes the local fallback JSON database (backend/data/db.json).
 *
 * Run with: node backend/seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const { SEED_DATA } = require('./db');
const User = require('./models/User');
const Grievance = require('./models/Grievance');
const Message = require('./models/Message');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

async function runSeed() {
  console.log('\n======================================================');
  console.log('   Grievances Portal — Database Seeding');
  console.log('======================================================\n');

  // 1. Sync Local JSON DB
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
    console.log('✅ Local JSON database (backend/data/db.json) synchronized with seed data.');
  } catch (err) {
    console.error('❌ Failed writing to local JSON DB:', err.message);
  }

  // 2. Sync MongoDB Atlas
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    console.log('\n⚠️  MONGODB_URI is not set. MongoDB Atlas seed skipped.');
    console.log('   Local JSON database is fully seeded and ready.');
    process.exit(0);
  }

  try {
    console.log('\n🔌 Connecting to MongoDB Atlas (database: grievence_portal)...');
    await mongoose.connect(uri, {
      dbName: 'grievence_portal',
      serverSelectionTimeoutMS: 8000
    });

    console.log(`✅ Connected to MongoDB Atlas! (Database: ${mongoose.connection.name})`);

    // Clear old test data
    console.log('🧹 Clearing old collections in grievence_portal...');
    await User.deleteMany({});
    await Grievance.deleteMany({});
    await Message.deleteMany({});

    // Insert fresh clean seed data
    console.log('🌱 Inserting fresh seed data...');
    const insertedUsers = await User.insertMany(SEED_DATA.users);
    const insertedGrievances = await Grievance.insertMany(SEED_DATA.grievances);
    const insertedMessages = await Message.insertMany(SEED_DATA.messages);

    console.log(`\n🎉 SEED SUCCESSFUL!`);
    console.log(`   - Users seeded: ${insertedUsers.length}`);
    console.log(`     • Citizen: sarah.jenkins@example.com (Password: User@123)`);
    console.log(`     • Citizen: jai@student.tce.edu (Password: User@123)`);
    console.log(`     • Admin: admin@grievance.gov (Password: Admin@123)`);
    console.log(`     • Officer: officer.marcus@grievance.gov (Password: Admin@123)`);
    console.log(`   - Grievances seeded: ${insertedGrievances.length}`);
    console.log(`     • GRV20261001001 (Sarah Jenkins - Under Review)`);
    console.log(`     • GRV20261001002 (Sarah Jenkins - Resolved)`);
    console.log(`     • GRV20261002001 (Jai Harish - In Progress)`);
    console.log(`     • GRV20261002002 (Jai Harish - Submitted)`);
    console.log(`   - Messages seeded: ${insertedMessages.length}`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.warn(`\n⚠️  Atlas seed notice: ${err.message}`);
    console.log('   Local JSON database is already up to date with seed data.');
    console.log('   When your Atlas cluster is reachable, run: node backend/seed.js');
    process.exit(0);
  }
}

runSeed();
