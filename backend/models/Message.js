const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  id: { type: String },
  grievanceId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['citizen', 'officer', 'admin', 'user'], default: 'citizen' },
  text: { type: String, required: true },
  timestamp: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);
