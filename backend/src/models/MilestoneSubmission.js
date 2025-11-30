const mongoose = require('mongoose');

const MilestoneSubmissionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  milestoneIndex: { type: Number, required: true },
  producer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachments: [{ type: String }],
  productionValue: { type: Number },
  productionDate: { type: Date },
  status: { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
  verifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  txHash: { type: String },
  settlementRequired: { type: Boolean, default: false },
  settled: { type: Boolean, default: false },
  settledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  settlementTx: { type: String },
  settlementAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

MilestoneSubmissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MilestoneSubmission', MilestoneSubmissionSchema);
