import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'past'],
    default: 'upcoming'
  },
  // Add Google form URL field
  registrationFormUrl: {
    type: String,
    default: null,
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if value is provided (not null/empty)
        if (!v) return true;
        // Basic URL validation
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Please provide a valid URL for the registration form'
    }
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    default: null
  },
  feedback: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Event', eventSchema);