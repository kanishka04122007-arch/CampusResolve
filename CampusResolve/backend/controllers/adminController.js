const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCoordinators = await User.countDocuments({ role: 'coordinator' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalRegisteredUsers = await User.countDocuments();
    
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: { $in: ['Submitted', 'Under Review', 'Assigned'] } });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const closedComplaints = await Complaint.countDocuments({ status: 'Closed' });

    // Today's complaints
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysComplaints = await Complaint.countDocuments({ createdAt: { $gte: startOfToday } });
    
    // Recently closed
    const recentlyClosed = await Complaint.countDocuments({ status: 'Closed', updatedAt: { $gte: startOfToday } });

    res.json({
      totalStudents,
      totalCoordinators,
      totalStaff,
      activeUsers,
      totalRegisteredUsers,
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      closedComplaints,
      todaysComplaints,
      recentlyClosed
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { role, department, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role, department, isActive },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const { status, department, priority, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (department) query.complaintDepartment = department;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } }
      ];
    }
    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email department registerNumber')
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getReports = async (req, res) => {
  try {
    const departmentWise = await Complaint.aggregate([
      { $group: { _id: "$complaintDepartment", count: { $sum: 1 }, pending: { $sum: { $cond: [{ $in: ["$status", ["Submitted", "Under Review", "Assigned", "In Progress"]] }, 1, 0] } }, resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } }, closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } } } }
    ]);
    
    const priorityDistribution = await Complaint.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const statusDistribution = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const monthlyComplaints = await Complaint.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      departmentWise,
      priorityDistribution,
      statusDistribution,
      monthlyComplaints
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50).populate('userId', 'name role');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllComplaints,
  getReports,
  getAdminNotifications
};
