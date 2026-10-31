const express = require('express');
const router = express.Router();
const { readDB } = require('../db');

// GET /api/stats
router.get('/', (req, res) => {
  const { role = 'citizen', userId } = req.query;
  const db = readDB();
  let list = db.grievances;

  if (role === 'citizen' && userId) {
    list = list.filter(g => g.userId === userId);
  }

  const stats = {
    total: list.length,
    underReview: list.filter(g => g.status === 'Under Review').length,
    inProgress: list.filter(g => g.status === 'In Progress').length,
    resolved: list.filter(g => g.status === 'Resolved').length,
    escalated: list.filter(g => g.status === 'Escalated').length
  };

  res.json({ success: true, data: stats });
});

module.exports = router;
