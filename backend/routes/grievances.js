const express = require('express');
const router = express.Router();
const { 
  getGrievances, 
  getGrievanceById, 
  createGrievance, 
  updateGrievanceStatus, 
  addGrievanceFeedback 
} = require('../db');

// GET /api/grievances
router.get('/', async (req, res) => {
  try {
    const { userId, email, role, status, category, priority, search } = req.query;
    const list = await getGrievances({ userId, email, role, status, category, priority, search });
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/grievances/:id
router.get('/:id', async (req, res) => {
  try {
    const idOrRef = req.params.id.trim();
    const found = await getGrievanceById(idOrRef);

    if (!found) {
      return res.status(404).json({ success: false, message: 'Grievance not found.' });
    }

    // Access Control: If requesting in user mode, citizens can only access their own grievance
    const { role, email } = req.query;
    if (role && (role.toLowerCase() === 'citizen' || role.toLowerCase() === 'user')) {
      const userEmail = (email || '').toLowerCase().trim();
      const authorEmail = (found.authorEmail || found.createdBy || found.userEmail || '').toLowerCase().trim();
      if (!userEmail || authorEmail !== userEmail) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only track or view grievances submitted by your account.'
        });
      }
    }

    res.json({ success: true, data: found });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/grievances
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      category, 
      priority = 'medium', 
      description, 
      location = '', 
      coordinates = null,
      attachmentName = null, 
      attachmentSize = null, 
      attachmentType = null,
      attachmentData = null,
      fileName = null,
      userId = '', 
      userName = '',
      authorName = '',
      authorEmail = ''
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ success: false, message: 'Title, category, and description are required.' });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `GRV202610${randomNum}`;
    const nowIso = new Date().toISOString();
    const nowDisplay = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date());

    const finalAttachmentName = attachmentName || fileName || null;

    const newGrievance = {
      id: 'grv-' + Date.now(),
      referenceId,
      reference: referenceId,
      title: title.trim(),
      category: category.trim(),
      priority: priority.toLowerCase(),
      status: 'Submitted',
      userId: userId || 'usr-' + Date.now(),
      userName: userName || authorName || 'Citizen',
      authorName: authorName || userName || 'Citizen',
      authorEmail: authorEmail || 'citizen@example.com',
      officerId: 'usr-4',
      officerName: 'Officer Marcus Davis',
      description: description.trim(),
      location: location ? location.trim() : 'Campus site',
      coordinates: coordinates || null,
      department: category.trim(),
      attachmentName: finalAttachmentName,
      fileName: finalAttachmentName,
      attachmentSize: attachmentSize || null,
      attachmentType: attachmentType || null,
      attachmentData: attachmentData || null,
      closedAt: null,
      closedBy: null,
      timeTaken: null,
      submittedDate: nowDisplay,
      lastUpdated: nowDisplay,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [
        { step: 1, title: 'Submitted', description: 'Grievance submitted by citizen', timestamp: nowDisplay, completed: true, active: true },
        { step: 2, title: 'Under Review', description: 'Pending department intake', timestamp: 'Pending', completed: false },
        { step: 3, title: 'In Progress', description: 'Assigned to field team', timestamp: 'Pending', completed: false },
        { step: 4, title: 'Resolution Proposed', description: 'Remediation under evaluation', timestamp: 'Pending', completed: false },
        { step: 5, title: 'Resolved', description: 'Final signoff and verification', timestamp: 'Pending', completed: false }
      ]
    };

    const saved = await createGrievance(newGrievance);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/grievances/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const idOrRef = req.params.id.trim();
    const { status, remarks = '', closedBy = null, closedAt = null } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'New status is required.' });
    }

    const grievance = await getGrievanceById(idOrRef);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found.' });
    }

    const nowIso = new Date().toISOString();
    const nowDisplay = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    }).format(new Date());

    const statusMap = {
      'Submitted': 1,
      'Under Review': 2,
      'Assigned': 2,
      'In Progress': 3,
      'Resolution Proposed': 4,
      'Escalated': 4,
      'Resolved': 5
    };

    const currentStep = statusMap[status] || 2;
    const timeline = (grievance.timeline || []).map(stepItem => {
      const copy = { ...stepItem };
      if (copy.step < currentStep) {
        copy.completed = true;
        copy.active = false;
      } else if (copy.step === currentStep) {
        copy.completed = true;
        copy.active = true;
        copy.timestamp = nowDisplay;
        if (remarks) copy.description = remarks;
        if (status === 'Escalated') {
          copy.title = 'Escalated';
          copy.escalated = true;
        }
      } else {
        copy.completed = false;
        copy.active = false;
      }
      return copy;
    });

    const updates = {
      status,
      lastUpdated: nowDisplay,
      updatedAt: nowIso,
      timeline
    };

    if (status === 'Resolved') {
      updates.closedAt = closedAt || nowDisplay;
      updates.closedBy = closedBy || 'Officer Marcus Davis';
      
      const start = grievance.createdAt || grievance.submittedDate;
      if (start) {
        try {
          const sDate = new Date(start);
          const diffMs = Math.max(0, new Date() - sDate);
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const days = Math.floor(hours / 24);
          const remHours = hours % 24;
          updates.timeTaken = days > 0 ? `${days}d ${remHours}h` : `${hours}h 15m`;
        } catch (e) {
          updates.timeTaken = '1 day';
        }
      } else {
        updates.timeTaken = '1 day';
      }
    }

    const updated = await updateGrievanceStatus(idOrRef, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/grievances/:id/feedback
router.post('/:id/feedback', async (req, res) => {
  try {
    const idOrRef = req.params.id.trim();
    const { rating, feedback = '' } = req.body;

    const updated = await addGrievanceFeedback(idOrRef, rating, feedback);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Grievance not found.' });
    }

    res.json({ success: true, message: 'Feedback recorded successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
