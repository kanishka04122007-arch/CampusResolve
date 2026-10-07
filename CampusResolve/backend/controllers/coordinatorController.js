const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');

// 1. Get all complaints for coordinator's department
const getDepartmentComplaints = async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId);
    const complaints = await Complaint.find({
      complaintDepartment: { $regex: new RegExp(`^${coordinator.department}$`, 'i') }
    })
      .populate('createdBy', 'name email registerNumber')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. Approve complaint (set status to Under Review)
const approveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = 'Under Review';
    if (req.body.remark) {
      complaint.remarks.push({ text: req.body.remark, addedBy: req.user.userId });
    }
    await complaint.save();

    await Notification.create({
      userId: complaint.createdBy,
      title: 'Complaint Approved',
      message: `Your complaint "${complaint.title}" has been approved and is under review.`,
      type: 'complaint_approved',
      relatedId: complaint._id
    });

    res.json({ message: 'Complaint approved and set to Under Review', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. Reject complaint
const rejectComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = 'Rejected';
    if (req.body.remark) {
      complaint.remarks.push({ text: req.body.remark, addedBy: req.user.userId });
    }
    await complaint.save();

    await Notification.create({
      userId: complaint.createdBy,
      title: 'Complaint Rejected',
      message: `Your complaint "${complaint.title}" was rejected. Reason: ${req.body.remark || 'N/A'}`,
      type: 'complaint_rejected',
      relatedId: complaint._id
    });

    res.json({ message: 'Complaint rejected', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 4. Assign complaint to staff
const assignComplaint = async (req, res) => {
  try {
    const { staffId, remark } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({ message: 'Invalid staff member' });
    }

    complaint.assignedTo = staffId;
    complaint.assignedBy = req.user.userId;
    complaint.assignedAt = new Date();
    complaint.status = 'Assigned';
    if (remark) {
      complaint.remarks.push({ text: remark, addedBy: req.user.userId });
    }
    await complaint.save();

    // Notify Staff
    await Notification.create({
      userId: staffId,
      title: 'Complaint Assigned',
      message: `A new complaint "${complaint.title}" has been assigned to you.`,
      type: 'complaint_assigned',
      relatedId: complaint._id
    });

    // Notify Student
    await Notification.create({
      userId: complaint.createdBy,
      title: 'Complaint Assigned to Staff',
      message: `Your complaint "${complaint.title}" has been assigned to ${staff.name} for resolution.`,
      type: 'complaint_assigned',
      relatedId: complaint._id
    });

    res.json({ message: `Complaint assigned to ${staff.name}`, complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 5. Add remark
const addRemark = async (req, res) => {
  try {
    const { remark } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.remarks.push({ text: remark, addedBy: req.user.userId });
    await complaint.save();
    res.json({ message: 'Remark added', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 6. Get coordinator stats
const getCoordinatorStats = async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId);
    const complaints = await Complaint.find({
      complaintDepartment: { $regex: new RegExp(`^${coordinator.department}$`, 'i') }
    });

    const stats = {
      total: complaints.length,
      newComplaints: complaints.filter(c => c.status === 'Submitted').length,
      pending: complaints.filter(c => ['Under Review', 'Assigned', 'In Progress'].includes(c.status)).length,
      resolved: complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length,
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 7. Get staff list for assignment dropdown
const getStaffList = async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId);
    const staff = await User.find({
      role: { $regex: /^staff$/i },
      department: { $regex: new RegExp(`^${coordinator.department}$`, 'i') }
    }).select('name email department');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 8. Verify Resolution (Accept -> Closed, Reopen -> In Progress)
const verifyResolution = async (req, res) => {
  try {
    const { action, remark } = req.body; // action can be 'accept' or 'reopen'
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Complaint must be in Resolved status to verify' });
    }

    if (action === 'accept') {
      complaint.status = 'Closed';
      if (remark) complaint.remarks.push({ text: remark, addedBy: req.user.userId, role: 'coordinator' });
      
      await Notification.create({
        userId: complaint.createdBy,
        title: 'Complaint Closed',
        message: `Your complaint "${complaint.title}" has been verified and closed by the coordinator.`,
        type: 'complaint_closed',
        relatedId: complaint._id
      });
    } else if (action === 'reopen') {
      complaint.status = 'In Progress';
      if (remark) complaint.remarks.push({ text: remark, addedBy: req.user.userId, role: 'coordinator' });
      
      // Notify staff that it was reopened
      if (complaint.assignedTo) {
        await Notification.create({
          userId: complaint.assignedTo,
          title: 'Complaint Reopened',
          message: `The complaint "${complaint.title}" was reopened by the coordinator. Reason: ${remark || 'Needs more work'}`,
          type: 'complaint_reopened',
          relatedId: complaint._id
        });
      }
      
      // Notify student
      await Notification.create({
        userId: complaint.createdBy,
        title: 'Complaint Reopened',
        message: `Your complaint "${complaint.title}" has been reopened for further work.`,
        type: 'complaint_reopened',
        relatedId: complaint._id
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "reopen".' });
    }

    await complaint.save();
    res.json({ message: `Complaint ${action === 'accept' ? 'closed' : 'reopened'} successfully`, complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getDepartmentComplaints,
  approveComplaint,
  rejectComplaint,
  assignComplaint,
  addRemark,
  getCoordinatorStats,
  getStaffList,
  verifyResolution
};
