const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'MilestoneSubmission' },
  amount: { type: Number },
  tx: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
