const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'officer', 'admin', 'user'], default: 'citizen' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  department: { type: String, default: '' },
  avatarInitial: { type: String, default: 'U' }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
