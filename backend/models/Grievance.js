const mongoose = require('mongoose');

const TimelineStepSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  timestamp: { type: String, default: 'Pending' },
  completed: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  escalated: { type: Boolean, default: false }
}, { _id: false });

const GrievanceSchema = new mongoose.Schema({
  referenceId: { type: String, required: true, unique: true, index: true },
  reference: { type: String, index: true }, // Alias for frontend compatibility
  title: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'Low', 'Medium', 'High'], default: 'Medium' },
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Escalated', 'Resolved', 'Resolution Proposed'],
    default: 'Submitted'
  },
  description: { type: String, required: true },
  location: { type: String, default: '' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  department: { type: String, default: '' },
  userId: { type: String, default: 'usr-1' },
  userName: { type: String, default: 'Demo User' },
  authorName: { type: String, default: 'Demo User' },
  authorEmail: { type: String, default: 'user@demo.com' },
  officerId: { type: String, default: 'usr-2' },
  officerName: { type: String, default: 'Officer Marcus Davis' },
  closedAt: { type: String, default: null },
  closedBy: { type: String, default: null },
  timeTaken: { type: String, default: null },
  attachmentName: { type: String, default: null },
  attachmentSize: { type: String, default: null },
  attachmentType: { type: String, default: null },
  attachmentData: { type: String, default: null },
  fileName: { type: String, default: null },
  rating: { type: Number, default: null },
  feedback: { type: String, default: '' },
  escalationReason: { type: String, default: '' },
  submittedDate: { type: String },
  lastUpdated: { type: String },
  timeline: [TimelineStepSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Grievance', GrievanceSchema);
