const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  registerNumber: { type: String }, // For students
  department: { type: String }, // For students & coordinators
  phone: { type: String },
  profilePicture: { type: String, default: '' },
  role: { 
    type: String, 
    enum: ['student', 'staff', 'coordinator', 'admin'], 
    default: 'student' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
