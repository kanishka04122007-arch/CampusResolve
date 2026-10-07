const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  complaintDepartment: { 
    type: String, 
    enum: ['Hostel', 'Library', 'Transport', 'Academic', 'Examination', 'Placement', 'Infrastructure', 'IT Support', 'Water Facility', 'Electrical Maintenance', 'Cleaning Service'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'], 
    default: 'Submitted' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  resolvedAt: { type: Date },
  attachment: { type: String },
  proofImage: { type: String },
  remarks: [{ 
    text: { type: String }, 
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    date: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
