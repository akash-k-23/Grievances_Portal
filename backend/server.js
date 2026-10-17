/**
 * Grievances Portal — static frontend server.
 * All app data is stored locally in the browser; no API or database is started.
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

app.use(express.static(FRONTEND_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  Grievances Portal frontend running!`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`  Serving frontend from: ${FRONTEND_DIR}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
