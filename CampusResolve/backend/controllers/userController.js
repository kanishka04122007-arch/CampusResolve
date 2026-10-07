const User = require('../models/User');
const Complaint = require('../models/Complaint');
const bcrypt = require('bcryptjs');

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate Complaint Statistics & Role-Specific Data
    let totalComplaints = 0, resolved = 0, pending = 0, rejected = 0;
    let recentComplaints = [];
    let managedStaff = [];
    let systemStats = null;
    
    // Normalize role to handle capitalized legacy DB entries
    const userRole = user.role ? user.role.toLowerCase() : 'student';
    
    if (userRole === 'student') {
      totalComplaints = await Complaint.countDocuments({ createdBy: user._id });
      resolved = await Complaint.countDocuments({ createdBy: user._id, status: { $in: ['Resolved', 'Closed'] } });
      pending = await Complaint.countDocuments({ createdBy: user._id, status: { $in: ['Pending', 'In Progress'] } });
      // We don't have a strict Rejected status yet, fallback to 0 or count Closed as Rejected if not resolved? 
      // Assuming 0 for now as per normal flow.
      rejected = 0; 
      recentComplaints = await Complaint.find({ createdBy: user._id }).sort({ createdAt: -1 }).limit(5);
    } 
    else if (userRole === 'coordinator') {
      totalComplaints = await Complaint.countDocuments({ complaintDepartment: user.department });
      resolved = await Complaint.countDocuments({ complaintDepartment: user.department, status: { $in: ['Resolved', 'Closed'] } });
      pending = totalComplaints - resolved;
      const assigned = await Complaint.countDocuments({ complaintDepartment: user.department, assignedTo: { $ne: null } });
      managedStaff = await User.find({ role: 'staff', department: user.department }).select('name email phone');
      
      // Override stats object for coordinator to include 'assigned'
      var customStats = { totalComplaints, assigned, resolved, pending };
    } 
    else if (userRole === 'staff') {
      const assigned = await Complaint.countDocuments({ assignedTo: user._id });
      resolved = await Complaint.countDocuments({ assignedTo: user._id, status: { $in: ['Resolved', 'Closed'] } });
      pending = assigned - resolved;
      recentComplaints = await Complaint.find({ assignedTo: user._id }).sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name');
      
      var customStats = { assigned, resolved, pending };
    } 
    else if (userRole === 'admin') {
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalCoordinators = await User.countDocuments({ role: 'coordinator' });
      const totalStaff = await User.countDocuments({ role: 'staff' });
      
      totalComplaints = await Complaint.countDocuments();
      resolved = await Complaint.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });
      pending = totalComplaints - resolved;

      systemStats = { totalStudents, totalCoordinators, totalStaff, totalComplaints, resolved, pending };
    }

    res.json({
      ...user.toObject(),
      role: userRole,
      stats: systemStats ? systemStats : (customStats || { totalComplaints, resolved, pending, rejected }),
      recentComplaints,
      managedStaff
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update Profile Information
const updateProfile = async (req, res) => {
  try {
    const { name, phone, email, department } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if new email already exists for another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'Email already in use' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    if (department !== undefined) user.department = department;
    
    // Fix any capitalized roles causing validation errors on save
    if (user.role) {
      user.role = user.role.toLowerCase();
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update Profile Picture
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePicture = req.file.path.replace(/\\/g, '/');
    await user.save();
    
    res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Remove Profile Picture
const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePicture = '';
    await user.save();

    res.json({ message: 'Profile picture removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfilePicture,
  removeProfilePicture,
  changePassword
};
