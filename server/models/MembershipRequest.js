import mongoose from 'mongoose';

const membershipRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestMessage: {
    type: String,
    trim: true,
    maxlength: 500
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: 500
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate requests
membershipRequestSchema.index({ userId: 1, clubId: 1 }, { unique: true });

export default mongoose.model('MembershipRequest', membershipRequestSchema);
