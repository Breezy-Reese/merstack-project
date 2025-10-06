const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tech_stack: [{
    type: String
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed', 'Archived'],
    default: 'Planning'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
