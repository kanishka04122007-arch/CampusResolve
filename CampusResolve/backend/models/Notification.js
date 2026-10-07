const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type: {
    type: String,
    enum: [
      'complaint_submitted', 'complaint_approved', 'complaint_rejected',
      'complaint_assigned',  'complaint_in_progress', 'complaint_resolved',
      'complaint_closed',    'complaint_reopened',
      'new_complaint', 'remark_added', 'general'
    ],
    default: 'general'
  },
  read:      { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
