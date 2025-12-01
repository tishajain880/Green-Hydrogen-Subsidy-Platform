const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  // Expand roles to match frontend values and keep backwards-compatible admin/user
  role: {
    type: String,
    enum: ['GOV', 'PRODUCER', 'AUDITOR', 'MILESTONE_EDITOR', 'BANK', 'admin', 'user'],
    default: 'PRODUCER',
  },
  // Notification preferences
  notifications: {
    milestones: { type: Boolean, default: true },
    disbursements: { type: Boolean, default: true },
    schemes: { type: Boolean, default: false },
    audit: { type: Boolean, default: true },
    productionUpdates: { type: Boolean, default: true }
  },
  walletAddress: { type: String },
  walletNonce: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(plain) {
  return await bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
