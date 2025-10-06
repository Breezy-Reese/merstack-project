const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  content: {
    type: String,
    required: true
  },
  message_type: {
    type: String,
    enum: ['direct', 'project_group', 'general'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ sender_id: 1, receiver_id: 1, created_at: -1 });
messageSchema.index({ project_id: 1, created_at: -1 });

module.exports = mongoose.model('Message', messageSchema);
