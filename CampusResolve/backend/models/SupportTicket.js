const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  issueType: {
    type: String,
    required: true,
    enum: ['Account Problem', 'Complaint Problem', 'Technical Issue', 'Other']
  },
  message: {
    type: String,
    required: true
  },
  adminReply: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
