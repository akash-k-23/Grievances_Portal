/**
 * MongoDB Atlas Connection Diagnostics & Test Script
 * Run with: node backend/test-atlas.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testAtlasConnection() {
  console.log('\n======================================================');
  console.log('   MongoDB Atlas Connection Diagnostics');
  console.log('======================================================');

  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.log('⚠️  MONGODB_URI environment variable is NOT set in your .env file.\n');
    console.log('📌 HOW TO CONNECT TO MONGODB ATLAS:');
    console.log('1. Go to https://cloud.mongodb.com and log in.');
    console.log('2. Create a Free Shared Cluster (M0 Sandbox).');
    console.log('3. In "Security" -> "Database Access", create a database user (e.g. user: admin, password: <your-password>).');
    console.log('4. In "Security" -> "Network Access", add IP address: 0.0.0.0/0 (allow access from anywhere) or your current IP.');
    console.log('5. In "Database" -> "Clusters", click "Connect" -> "Drivers" (Node.js).');
    console.log('6. Copy the connection string (format: mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/grievance_portal?retryWrites=true&w=majority).');
    console.log('7. Open /home/sjh/cons_p/.env and add:');
    console.log('   MONGODB_URI=your_copied_connection_string_here\n');
    console.log('Current Fallback: Local JSON database (backend/data/db.json) is active.');
    console.log('======================================================\n');
    process.exit(0);
  }

  // Mask credentials for display
  const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//***:***@');
  console.log(`🔌 Attempting to connect to: ${maskedUri}`);

  const start = Date.now();
  try {
    await mongoose.connect(uri, {
      dbName: 'grievence_portal',
      serverSelectionTimeoutMS: 8000
    });
    const duration = Date.now() - start;

    console.log(`✅ SUCCESS: Connected to MongoDB Atlas in ${duration}ms!`);
    console.log(`📁 Database Name: ${mongoose.connection.name}`);
    console.log(`🌐 Cluster Host: ${mongoose.connection.host}`);

    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Existing Collections: ${collections.map(c => c.name).join(', ') || 'None yet (will be created on first seed)'}`);

    // Ping check
    await mongoose.connection.db.admin().ping();
    console.log('📡 Ping to Atlas server: OK');

    console.log('\n✨ Your Grievances Portal backend is 100% ready to use MongoDB Atlas!');
    console.log('======================================================\n');
  } catch (err) {
    console.error(`\n❌ CONNECTION FAILED: ${err.message}`);
    console.log('\n🔍 Troubleshooting Checklist:');
    console.log('1. Did you replace <password> in the URI with your real database user password?');
    console.log('2. In MongoDB Atlas "Network Access", did you allow your IP address or 0.0.0.0/0?');
    console.log('3. Does the database user have "Read and write to any database" permissions?');
    console.log('======================================================\n');
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  }
}

testAtlasConnection();
