/**
 * Grievances Portal — Dual-Mode Database Layer
 * Supports MongoDB Atlas (via Mongoose) with automatic fallback to local JSON DB.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Mongoose Models
const Grievance = require('./models/Grievance');
const User = require('./models/User');
const Message = require('./models/Message');

// Default seed records matching our portal design
// Pre-hashed passwords using bcrypt (10 rounds):
// User@123 -> $2b$10$l74.KulRuI.RzMz86UWzGexYLsT2oAjPrLGdzYgYTBZqgvpbpp9wm
// Admin@123 -> $2b$10$0FdEJ5Iuh7y0orkSBk2t/e6rjiFvzfpS9RFOW8dNe8C8UX3XRcVbO
const USER_PASSWORD_HASH = '$2b$10$l74.KulRuI.RzMz86UWzGexYLsT2oAjPrLGdzYgYTBZqgvpbpp9wm';
const ADMIN_PASSWORD_HASH = '$2b$10$0FdEJ5Iuh7y0orkSBk2t/e6rjiFvzfpS9RFOW8dNe8C8UX3XRcVbO';

const SEED_DATA = {
  users: [
    {
      id: 'usr-1',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      password: USER_PASSWORD_HASH,
      role: 'citizen',
      phone: '+1 (555) 234-5678',
      address: '42 Pine Crest Avenue, Cityville',
      department: 'Student Affairs',
      avatarInitial: 'S',
      createdAt: '2025-01-10T08:30:00Z'
    },
    {
      id: 'usr-2',
      name: 'Jai Harish',
      email: 'jai@student.tce.edu',
      password: USER_PASSWORD_HASH,
      role: 'citizen',
      phone: '+91 98765 43210',
      address: 'Hostel Block 3, TCE Campus',
      department: 'Computer Science',
      avatarInitial: 'J',
      createdAt: '2025-02-15T09:15:00Z'
    },
    {
      id: 'usr-3',
      name: 'Admin Officer',
      email: 'admin@grievance.gov',
      password: ADMIN_PASSWORD_HASH,
      role: 'officer',
      phone: '+1 (555) 019-2831',
      department: 'Central Grievance Office',
      avatarInitial: 'A',
      createdAt: '2024-10-01T08:00:00Z'
    },
    {
      id: 'usr-4',
      name: 'Officer Marcus Davis',
      email: 'officer.marcus@grievance.gov',
      password: ADMIN_PASSWORD_HASH,
      role: 'officer',
      phone: '+1 (555) 987-6543',
      department: 'Municipal Infrastructure',
      avatarInitial: 'M',
      createdAt: '2024-11-01T09:00:00Z'
    }
  ],
  grievances: [
    {
      id: 'grv-1',
      referenceId: 'GRV20261001001',
      reference: 'GRV20261001001',
      title: 'Water supply interruption in East Wing',
      category: 'Infrastructure',
      priority: 'high',
      status: 'Under Review',
      userId: 'usr-1',
      userName: 'Sarah Jenkins',
      authorName: 'Sarah Jenkins',
      authorEmail: 'sarah.jenkins@example.com',
      officerId: 'usr-4',
      officerName: 'Officer Marcus Davis',
      description: 'The water supply in East Wing residential block has been interrupted since yesterday morning. Multiple students in Block A have low water pressure or no supply.',
      location: 'East Wing, Block A',
      coordinates: { lat: 9.9252, lng: 78.1198 },
      department: 'Facilities & Utilities',
      attachmentName: 'water_leak_site.jpg',
      fileName: 'water_leak_site.jpg',
      attachmentSize: '2.1 MB',
      attachmentType: 'image/jpeg',
      closedAt: null,
      closedBy: null,
      timeTaken: null,
      submittedDate: '01 Oct 2026',
      lastUpdated: '03 Oct 2026',
      createdAt: '2026-10-01T10:15:00Z',
      updatedAt: '2026-10-03T11:02:00Z',
      timeline: [
        { step: 1, title: 'Submitted', description: 'Grievance submitted by citizen', timestamp: '01 Oct 2026 • 10:15 AM', completed: true },
        { step: 2, title: 'Under Review', description: 'Assigned to Facilities & Utilities', timestamp: '03 Oct 2026 • 11:02 AM', completed: true, active: true },
        { step: 3, title: 'In Progress', description: 'Field crew assigned', timestamp: 'Pending', completed: false },
        { step: 4, title: 'Resolution Proposed', description: 'Inspection', timestamp: 'Pending', completed: false },
        { step: 5, title: 'Resolved', description: 'Final signoff', timestamp: 'Pending', completed: false }
      ]
    },
    {
      id: 'grv-2',
      referenceId: 'GRV20261001002',
      reference: 'GRV20261001002',
      title: 'Broken street lamp near Library walkway',
      category: 'Infrastructure',
      priority: 'medium',
      status: 'Resolved',
      userId: 'usr-1',
      userName: 'Sarah Jenkins',
      authorName: 'Sarah Jenkins',
      authorEmail: 'sarah.jenkins@example.com',
      officerId: 'usr-4',
      officerName: 'Officer Marcus Davis',
      description: 'The pole light outside the library entrance has flickered out, creating safety concerns during evening study hours.',
      location: 'Library Pathway South',
      coordinates: { lat: 9.9260, lng: 78.1210 },
      department: 'Electrical Maintenance',
      attachmentName: 'lamp_damage.png',
      fileName: 'lamp_damage.png',
      attachmentSize: '1.2 MB',
      attachmentType: 'image/png',
      closedAt: '02 Oct 2026, 04:30 PM',
      closedBy: 'Officer Marcus Davis',
      timeTaken: '3 days 2 hrs',
      submittedDate: '29 Sep 2026',
      lastUpdated: '02 Oct 2026',
      createdAt: '2026-09-29T14:00:00Z',
      updatedAt: '2026-10-02T16:30:00Z',
      timeline: [
        { step: 1, title: 'Submitted', description: 'Grievance submitted by citizen', timestamp: '29 Sep 2026 • 02:00 PM', completed: true },
        { step: 2, title: 'Under Review', description: 'Inspected by electrical division', timestamp: '30 Sep 2026 • 10:00 AM', completed: true },
        { step: 3, title: 'In Progress', description: 'Bulb fixture replaced', timestamp: '01 Oct 2026 • 03:15 PM', completed: true },
        { step: 4, title: 'Resolution Proposed', description: 'Illumination tested', timestamp: '02 Oct 2026 • 02:00 PM', completed: true },
        { step: 5, title: 'Resolved', description: 'Issue resolved and certified', timestamp: '02 Oct 2026 • 04:30 PM', completed: true, active: true }
      ]
    },
    {
      id: 'grv-3',
      referenceId: 'GRV20261002001',
      reference: 'GRV20261002001',
      title: 'Elective course registration discrepancy',
      category: 'Academic',
      priority: 'high',
      status: 'In Progress',
      userId: 'usr-2',
      userName: 'Jai Harish',
      authorName: 'Jai Harish',
      authorEmail: 'jai@student.tce.edu',
      officerId: 'usr-3',
      officerName: 'Admin Officer',
      description: 'The elective course CS701 does not appear in my registered list even though payment was deducted and confirmation email was received.',
      location: 'Academic Affairs Portal',
      coordinates: { lat: 9.9248, lng: 78.1205 },
      department: 'Academic Administration',
      closedAt: null,
      closedBy: null,
      timeTaken: null,
      submittedDate: '02 Oct 2026',
      lastUpdated: '03 Oct 2026',
      createdAt: '2026-10-02T09:30:00Z',
      updatedAt: '2026-10-03T14:15:00Z',
      timeline: [
        { step: 1, title: 'Submitted', description: 'Grievance submitted by student', timestamp: '02 Oct 2026 • 09:30 AM', completed: true },
        { step: 2, title: 'Under Review', description: 'Academic registrar examining fee transaction', timestamp: '02 Oct 2026 • 02:00 PM', completed: true },
        { step: 3, title: 'In Progress', description: 'Course seat quota override initiated', timestamp: '03 Oct 2026 • 02:15 PM', completed: true, active: true },
        { step: 4, title: 'Resolution Proposed', description: 'Course enrollment pending sync', timestamp: 'Pending', completed: false },
        { step: 5, title: 'Resolved', description: 'Final verification', timestamp: 'Pending', completed: false }
      ]
    },
    {
      id: 'grv-4',
      referenceId: 'GRV20261002002',
      reference: 'GRV20261002002',
      title: 'Library card RFID scan failure',
      category: 'Student Services',
      priority: 'low',
      status: 'Submitted',
      userId: 'usr-2',
      userName: 'Jai Harish',
      authorName: 'Jai Harish',
      authorEmail: 'jai@student.tce.edu',
      officerId: 'usr-3',
      officerName: 'Admin Officer',
      description: 'My student RFID smart ID is rejected at the digital turnstile of the central library with error "Invalid Barcode".',
      location: 'Central Library Entrance',
      coordinates: { lat: 9.9260, lng: 78.1210 },
      department: 'Student Identity & Services',
      closedAt: null,
      closedBy: null,
      timeTaken: null,
      submittedDate: '03 Oct 2026',
      lastUpdated: '03 Oct 2026',
      createdAt: '2026-10-03T11:00:00Z',
      updatedAt: '2026-10-03T11:00:00Z',
      timeline: [
        { step: 1, title: 'Submitted', description: 'Grievance submitted by student', timestamp: '03 Oct 2026 • 11:00 AM', completed: true, active: true },
        { step: 2, title: 'Under Review', description: 'Pending card management review', timestamp: 'Pending', completed: false },
        { step: 3, title: 'In Progress', description: 'Chip re-encoding', timestamp: 'Pending', completed: false },
        { step: 4, title: 'Resolution Proposed', description: 'Access re-validation', timestamp: 'Pending', completed: false },
        { step: 5, title: 'Resolved', description: 'Turnstile access verified', timestamp: 'Pending', completed: false }
      ]
    }
  ],
  messages: [
    {
      id: 'msg-1',
      grievanceId: 'GRV20261001001',
      referenceId: 'GRV20261001001',
      senderId: 'usr-1',
      senderName: 'Sarah Jenkins',
      senderRole: 'citizen',
      text: 'Water supply is still off this morning. Could we know the estimated restoration time?',
      timestamp: '02 Oct 2026, 09:15 AM'
    },
    {
      id: 'msg-2',
      grievanceId: 'GRV20261001001',
      referenceId: 'GRV20261001001',
      senderId: 'usr-4',
      senderName: 'Officer Marcus Davis',
      senderRole: 'officer',
      text: 'Plumbing crew has isolated the mainline valve. Work is actively underway; expected restoration by 4:00 PM.',
      timestamp: '02 Oct 2026, 11:30 AM'
    },
    {
      id: 'msg-3',
      grievanceId: 'GRV20261002001',
      referenceId: 'GRV20261002001',
      senderId: 'usr-2',
      senderName: 'Jai Harish',
      senderRole: 'citizen',
      text: 'Hello, I attached the payment receipt for CS701. Please help verify enrollment before add/drop deadline.',
      timestamp: '02 Oct 2026, 10:00 AM'
    },
    {
      id: 'msg-4',
      grievanceId: 'GRV20261002001',
      referenceId: 'GRV20261002001',
      senderId: 'usr-3',
      senderName: 'Admin Officer',
      senderRole: 'officer',
      text: 'Receipt received and verified. The department coordinator has granted a seat override. Your portal will reflect CS701 by end of today.',
      timestamp: '03 Oct 2026, 02:20 PM'
    }
  ]
};

let isMongoConnected = false;
let mongoDbName = '';

// Local JSON File operations
function initJSONDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
  }
}

function readDB() {
  initJSONDB();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON database file:', err);
    return SEED_DATA;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing JSON database file:', err);
    return false;
  }
}

// Seed MongoDB Atlas from SEED_DATA
async function seedMongoDB(force = false) {
  try {
    if (force) {
      await User.deleteMany({});
      await Grievance.deleteMany({});
      await Message.deleteMany({});
      console.log('  [MongoDB Atlas] Cleared existing collections for fresh seed.');
    }
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(SEED_DATA.users);
      console.log('  [MongoDB Atlas] Initialized seed users.');
    }

    const grvCount = await Grievance.countDocuments();
    if (grvCount === 0) {
      await Grievance.insertMany(SEED_DATA.grievances);
      console.log('  [MongoDB Atlas] Initialized seed grievances.');
    }

    const msgCount = await Message.countDocuments();
    if (msgCount === 0) {
      await Message.insertMany(SEED_DATA.messages);
      console.log('  [MongoDB Atlas] Initialized seed messages.');
    }
  } catch (err) {
    console.error('  [MongoDB Atlas] Seed check warning:', err.message);
  }
}

// Connect to MongoDB Atlas
async function initDB() {
  initJSONDB();

  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    console.log('[Database] MONGODB_URI not set. Using local JSON database (backend/data/db.json).');
    isMongoConnected = false;
    return;
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      dbName: 'grievence_portal',
      serverSelectionTimeoutMS: 5000
    });
    isMongoConnected = true;
    mongoDbName = mongoose.connection.name || 'grievence_portal';
    console.log(`[Database] Connected successfully to MongoDB Atlas! (Database: ${mongoDbName})`);
    await seedMongoDB();
  } catch (err) {
    console.warn(`[Database] MongoDB Atlas connection failed (${err.message}).`);
    console.log('[Database] Gracefully falling back to local JSON database.');
    isMongoConnected = false;
  }
}

function getDBStatus() {
  return {
    type: isMongoConnected ? 'mongodb' : 'json',
    isConnected: isMongoConnected,
    databaseName: isMongoConnected ? mongoDbName : 'local_json_db',
    connectionStringConfigured: Boolean(process.env.MONGODB_URI)
  };
}

// ============================================================================
// Unified Asynchronous Data Operations
// ============================================================================

async function getGrievances(filter = {}) {
  if (isMongoConnected) {
    try {
      const query = {};
      if (filter.role !== 'officer' && filter.role !== 'admin') {
        if (filter.email) {
          query.$or = [
            { authorEmail: new RegExp(`^${filter.email}$`, 'i') },
            { userEmail: new RegExp(`^${filter.email}$`, 'i') }
          ];
        } else if (filter.userId) {
          query.userId = filter.userId;
        }
      }
      if (filter.status && filter.status !== 'all') {
        query.status = new RegExp(`^${filter.status}$`, 'i');
      }
      if (filter.category && filter.category !== 'all') {
        query.category = new RegExp(`^${filter.category}$`, 'i');
      }
      if (filter.priority && filter.priority !== 'all') {
        query.priority = new RegExp(`^${filter.priority}$`, 'i');
      }
      if (filter.search) {
        const sRegex = new RegExp(filter.search, 'i');
        query.$or = [
          { title: sRegex },
          { referenceId: sRegex },
          { reference: sRegex },
          { description: sRegex },
          { category: sRegex }
        ];
      }
      return await Grievance.find(query).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.error('Mongo getGrievances error, fallback to JSON:', e.message);
    }
  }

  // JSON Fallback
  const db = readDB();
  let list = db.grievances || [];
  if (filter.role !== 'officer' && filter.role !== 'admin') {
    if (filter.email) {
      list = list.filter(g => (g.authorEmail || g.userEmail || '').toLowerCase() === filter.email.toLowerCase());
    } else if (filter.userId) {
      list = list.filter(g => g.userId === filter.userId);
    }
  }
  if (filter.status && filter.status !== 'all') {
    list = list.filter(g => g.status.toLowerCase() === filter.status.toLowerCase());
  }
  if (filter.category && filter.category !== 'all') {
    list = list.filter(g => g.category.toLowerCase() === filter.category.toLowerCase());
  }
  if (filter.priority && filter.priority !== 'all') {
    list = list.filter(g => g.priority.toLowerCase() === filter.priority.toLowerCase());
  }
  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(g => 
      g.title.toLowerCase().includes(q) ||
      (g.referenceId && g.referenceId.toLowerCase().includes(q)) ||
      (g.reference && g.reference.toLowerCase().includes(q)) ||
      (g.description && g.description.toLowerCase().includes(q))
    );
  }
  return list;
}

async function getGrievanceById(idOrRef) {
  const clean = idOrRef.trim().toUpperCase();
  const normalized = clean.replace(/[^A-Z0-9]/g, '');

  if (isMongoConnected) {
    try {
      return await Grievance.findOne({
        $or: [
          { referenceId: clean },
          { reference: clean },
          { id: idOrRef },
          { referenceId: new RegExp(`^${clean.replace(/-/g, '[-]?')}$`, 'i') },
          { reference: new RegExp(`^${clean.replace(/-/g, '[-]?')}$`, 'i') }
        ]
      }).lean();
    } catch (e) {
      console.error('Mongo getGrievanceById error:', e.message);
    }
  }

  const db = readDB();
  return (db.grievances || []).find(g => {
    const gRef = (g.referenceId || g.reference || '').toUpperCase();
    const gNorm = gRef.replace(/[^A-Z0-9]/g, '');
    const gId = (g.id || '').toUpperCase();
    return gRef === clean || gNorm === normalized || gId === clean;
  }) || null;
}

async function createGrievance(data) {
  if (isMongoConnected) {
    try {
      const doc = new Grievance(data);
      await doc.save();
      return doc.toObject();
    } catch (e) {
      console.error('Mongo createGrievance error:', e.message);
    }
  }

  const db = readDB();
  db.grievances = db.grievances || [];
  db.grievances.unshift(data);
  writeDB(db);
  return data;
}

async function updateGrievanceStatus(idOrRef, updates = {}) {
  const clean = idOrRef.trim().toUpperCase();
  const normalized = clean.replace(/[^A-Z0-9]/g, '');

  if (isMongoConnected) {
    try {
      const updated = await Grievance.findOneAndUpdate(
        { 
          $or: [
            { referenceId: clean }, 
            { reference: clean }, 
            { id: idOrRef },
            { referenceId: new RegExp(`^${clean.replace(/-/g, '[-]?')}$`, 'i') },
            { reference: new RegExp(`^${clean.replace(/-/g, '[-]?')}$`, 'i') }
          ] 
        },
        { $set: updates },
        { new: true }
      ).lean();
      if (updated) return updated;
    } catch (e) {
      console.error('Mongo updateGrievanceStatus error:', e.message);
    }
  }

  const db = readDB();
  db.grievances = db.grievances || [];
  const idx = db.grievances.findIndex(g => {
    const gRef = (g.referenceId || g.reference || '').toUpperCase();
    const gNorm = gRef.replace(/[^A-Z0-9]/g, '');
    const gId = (g.id || '').toUpperCase();
    return gRef === clean || gNorm === normalized || gId === clean;
  });
  if (idx !== -1) {
    db.grievances[idx] = { ...db.grievances[idx], ...updates };
    writeDB(db);
    return db.grievances[idx];
  }
  return null;
}

async function addGrievanceFeedback(idOrRef, rating, feedback) {
  return await updateGrievanceStatus(idOrRef, { rating: Number(rating), feedback: (feedback || '').trim() });
}

// User Operations
async function findUser(query = {}) {
  if (isMongoConnected) {
    try {
      const mongoQuery = {};
      if (query.email) mongoQuery.email = query.email.toLowerCase();
      if (query.role) {
        if (query.role === 'citizen' || query.role === 'user') {
          mongoQuery.role = { $in: ['citizen', 'user'] };
        } else if (query.role === 'officer' || query.role === 'admin') {
          mongoQuery.role = { $in: ['officer', 'admin'] };
        } else {
          mongoQuery.role = query.role;
        }
      }
      return await User.findOne(mongoQuery).lean();
    } catch (e) {
      console.error('Mongo findUser error:', e.message);
    }
  }

  const db = readDB();
  return (db.users || []).find(u => {
    let match = true;
    if (query.email && u.email.toLowerCase() !== query.email.toLowerCase()) match = false;
    if (query.role) {
      const isCitizenRole = (r) => r === 'citizen' || r === 'user';
      const isOfficerRole = (r) => r === 'officer' || r === 'admin';
      if (isCitizenRole(query.role) && !isCitizenRole(u.role)) match = false;
      else if (isOfficerRole(query.role) && !isOfficerRole(u.role)) match = false;
      else if (!isCitizenRole(query.role) && !isOfficerRole(query.role) && u.role !== query.role) match = false;
    }
    return match;
  }) || null;
}

async function createUser(data) {
  if (isMongoConnected) {
    try {
      const doc = new User(data);
      await doc.save();
      return doc.toObject();
    } catch (e) {
      console.error('Mongo createUser error:', e.message);
    }
  }

  const db = readDB();
  db.users = db.users || [];
  db.users.push(data);
  writeDB(db);
  return data;
}

// Message Operations
async function getMessages(grievanceId) {
  const clean = grievanceId.trim().toUpperCase();
  if (isMongoConnected) {
    try {
      return await Message.find({ grievanceId: clean }).sort({ createdAt: 1 }).lean();
    } catch (e) {
      console.error('Mongo getMessages error:', e.message);
    }
  }

  const db = readDB();
  return (db.messages || []).filter(m => (m.grievanceId || '').toUpperCase() === clean);
}

async function addMessage(data) {
  if (isMongoConnected) {
    try {
      const doc = new Message(data);
      await doc.save();
      return doc.toObject();
    } catch (e) {
      console.error('Mongo addMessage error:', e.message);
    }
  }

  const db = readDB();
  db.messages = db.messages || [];
  db.messages.push(data);
  writeDB(db);
  return data;
}

module.exports = {
  initDB,
  getDBStatus,
  readDB,
  writeDB,
  seedMongoDB,
  SEED_DATA,
  getGrievances,
  getGrievanceById,
  createGrievance,
  updateGrievanceStatus,
  addGrievanceFeedback,
  findUser,
  createUser,
  getMessages,
  addMessage
};
