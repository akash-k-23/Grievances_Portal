const express = require('express');
const router = express.Router();
const { getMessages, addMessage, getGrievanceById } = require('../db');

// GET /api/messages
router.get('/', async (req, res) => {
  try {
    const { grievanceId, ref } = req.query;
    const targetIdOrRef = (grievanceId || ref || '').trim();
    if (!targetIdOrRef) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const g = await getGrievanceById(targetIdOrRef);
    const lookupRef = g ? (g.referenceId || g.reference || g.id) : targetIdOrRef;
    const msgs = await getMessages(lookupRef);

    res.json({ success: true, count: msgs.length, data: msgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/messages
router.post('/', async (req, res) => {
  try {
    const { grievanceId, ref, senderId, senderName, senderRole, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const targetId = (grievanceId || ref || '').trim();
    const g = targetId ? await getGrievanceById(targetId) : null;
    const resolvedGrievanceId = g ? (g.referenceId || g.reference || g.id) : targetId;

    const nowDisplay = new Intl.DateTimeFormat('en-US', {
      month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date());

    const newMsg = {
      id: 'msg-' + Date.now(),
      grievanceId: resolvedGrievanceId,
      referenceId: g ? (g.referenceId || g.reference) : resolvedGrievanceId,
      senderId: senderId || 'usr-1',
      senderName: senderName || 'User',
      senderRole: senderRole || 'citizen',
      text: text.trim(),
      timestamp: nowDisplay
    };

    const saved = await addMessage(newMsg);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
