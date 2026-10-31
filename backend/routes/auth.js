const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { findUser, createUser } = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, expectedRole = 'citizen' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Find user by email and expected role
    const user = await findUser({ email: cleanEmail, role: expectedRole });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials or selected account role.' 
      });
    }

    // Compare with bcrypt hash
    let isMatch = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      isMatch = await bcrypt.compare(cleanPass, user.password);
    } else {
      // Legacy plain-text fallback during transition
      isMatch = (user.password === cleanPass);
    }

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials or selected account role.' 
      });
    }

    const sessionUser = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      department: user.department || '',
      avatarInitial: user.avatarInitial || user.name.charAt(0).toUpperCase()
    };

    res.json({ success: true, user: sessionUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'citizen', phone = '', address = '', department = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await findUser({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Hash the password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const newUser = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'citizen',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      department: department ? department.trim() : (role === 'officer' ? 'Municipal Services' : ''),
      avatarInitial: name.trim().charAt(0).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    const saved = await createUser(newUser);

    const sessionUser = {
      id: saved.id || saved._id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      phone: saved.phone || '',
      address: saved.address || '',
      department: saved.department || '',
      avatarInitial: saved.avatarInitial
    };

    res.status(201).json({ success: true, user: sessionUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
