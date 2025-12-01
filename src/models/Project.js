const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft','submitted','approved','rejected'], default: 'draft' },
  attachments: [{ type: String }], // store file paths / URLs
  // On-chain integration fields
  chainProjectId: { type: String }, // bytes32 string used on-chain
  contractAddress: { type: String }, // manager contract address if specific per-project
  tokenAddress: { type: String },
  totalSubsidy: { type: Number },
  milestones: [{
    name: String,
    requiredProduction: Number,
    percent: Number,
    manualVerification: Boolean,
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  enrolledProducers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
