/**
<<<<<<< HEAD
 * Grievances Portal — Express Backend Server
 * Serves static files from the ../frontend folder and exposes RESTful API endpoints.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const grievanceRoutes = require('./routes/grievances');
const messageRoutes = require('./routes/messages');
const statRoutes = require('./routes/stats');
const profileRoutes = require('./routes/profile');
const { initDB, getDBStatus } = require('./db');
=======
 * Grievances Portal — static frontend server.
 * All app data is stored locally in the browser; no API or database is started.
 */
const express = require('express');
const path = require('path');
>>>>>>> b9c6af472f454f32b2ee0db4ffaeb31923f4b6b9

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

<<<<<<< HEAD
// Initialize database (MongoDB Atlas or JSON fallback)
initDB().catch(err => console.error('Database initialization error:', err));

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request logger for API calls
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Grievances Portal Backend',
    database: getDBStatus()
  });
});

// Serve frontend static assets from ../frontend
app.use(express.static(FRONTEND_DIR));

// Root route
=======
app.use(express.static(FRONTEND_DIR));

>>>>>>> b9c6af472f454f32b2ee0db4ffaeb31923f4b6b9
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
<<<<<<< HEAD
    console.log(`  Grievances Portal Server running!`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`  API Health: http://localhost:${PORT}/api/health`);
=======
    console.log(`  Grievances Portal frontend running!`);
    console.log(`  Local URL: http://localhost:${PORT}`);
>>>>>>> b9c6af472f454f32b2ee0db4ffaeb31923f4b6b9
    console.log(`  Serving frontend from: ${FRONTEND_DIR}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
