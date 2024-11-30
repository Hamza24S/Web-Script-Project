const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed'],
    default: 'open',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
});

module.exports = mongoose.model('Incident', incidentSchema);
