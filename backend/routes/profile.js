const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');

// PUT /api/profile
router.put('/', (req, res) => {
  const { id, name, phone } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (name) db.users[index].name = name.trim();
  if (phone !== undefined) db.users[index].phone = phone.trim();
  db.users[index].avatarInitial = db.users[index].name.charAt(0).toUpperCase();

  writeDB(db);

  const updatedUser = {
    id: db.users[index].id,
    name: db.users[index].name,
    email: db.users[index].email,
    role: db.users[index].role,
    phone: db.users[index].phone,
    department: db.users[index].department,
    avatarInitial: db.users[index].avatarInitial
  };

  res.json({ success: true, user: updatedUser });
});

module.exports = router;
