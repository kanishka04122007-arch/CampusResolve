const Complaint = require('../models/Complaint');
const User      = require('../models/User');
const Notification = require('../models/Notification');

// ── 1. Dashboard stats ───────────────────────────────────────────────────────
const getStaffStats = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user.userId });
    res.json({
      total:      complaints.length,
      assigned:   complaints.filter(c => c.status === 'Assigned').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved:   complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// ── 2. Get all assigned complaints ───────────────────────────────────────────
const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user.userId })
      .populate('createdBy', 'name email registerNumber')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// ── 3. Get single complaint detail ───────────────────────────────────────────
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy',        'name email registerNumber')
      .populate('assignedTo',       'name email')
      .populate('assignedBy',       'name')
      .populate('remarks.addedBy',  'name role');

    if (!complaint)
      return res.status(404).json({ message: 'Complaint not found' });

    // Staff may only see complaints assigned to them
    if (complaint.assignedTo?._id.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized to view this complaint' });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// ── 4. Start Work  (Assigned → In Progress) ──────────────────────────────────
const startWork = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.assignedTo?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });
    if (complaint.status !== 'Assigned')
      return res.status(400).json({ message: 'Complaint must be in Assigned status to start work' });

    complaint.status = 'In Progress';
    if (req.body.remark) {
      complaint.remarks.push({ text: req.body.remark, addedBy: req.user.userId, role: 'staff' });
    }
    await complaint.save();

    await Notification.create({
      userId: complaint.createdBy,
      title: 'Complaint In Progress',
      message: `Staff has started working on your complaint "${complaint.title}".`,
      type: 'complaint_in_progress',
      relatedId: complaint._id
    });

    res.json({ message: 'Work started — status set to In Progress', complaint });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// ── 5. Add remark ────────────────────────────────────────────────────────────
const addRemark = async (req, res) => {
  try {
    const { remark } = req.body;
    if (!remark?.trim())
      return res.status(400).json({ message: 'Remark text is required' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.assignedTo?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });

    complaint.remarks.push({ text: remark, addedBy: req.user.userId, role: 'staff' });
    await complaint.save();

    await Notification.create({
      userId: complaint.createdBy,
      title: 'New Remark Added',
      message: `A new remark was added to your complaint "${complaint.title}".`,
      type: 'remark_added',
      relatedId: complaint._id
    });

    // Return populated complaint
    const updated = await Complaint.findById(complaint._id)
      .populate('remarks.addedBy', 'name role');
    res.json({ message: 'Remark added', complaint: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// ── 6. Resolve complaint  (In Progress → Resolved) ───────────────────────────
const resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.assignedTo?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });
    if (!['In Progress', 'Assigned'].includes(complaint.status))
      return res.status(400).json({ message: 'Complaint must be In Progress or Assigned to resolve' });

    complaint.status     = 'Resolved';
    complaint.resolvedAt = new Date();

    if (req.file) {
      complaint.proofImage = req.file.path.replace(/\\/g, '/');
    }
    if (req.body.remark) {
      complaint.remarks.push({ text: req.body.remark, addedBy: req.user.userId, role: 'staff' });
    }
    await complaint.save();

    // Notify Student
    await Notification.create({
      userId: complaint.createdBy,
      title: 'Complaint Resolved',
      message: `Your complaint "${complaint.title}" has been marked as resolved.`,
      type: 'complaint_resolved',
      relatedId: complaint._id
    });

    // Notify Coordinator
    if (complaint.assignedBy) {
      await Notification.create({
        userId: complaint.assignedBy,
        title: 'Complaint Resolved by Staff',
        message: `Complaint "${complaint.title}" has been resolved by the assigned staff.`,
        type: 'complaint_resolved',
        relatedId: complaint._id
      });
    }

    res.json({ message: 'Complaint marked as Resolved', complaint });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// ── 7. Get recent resolved  (for dashboard) ──────────────────────────────────
const getRecentResolved = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedTo: req.user.userId,
      status: { $in: ['Resolved', 'Closed'] }
    })
      .populate('createdBy', 'name')
      .sort({ resolvedAt: -1 })
      .limit(5);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

module.exports = {
  getStaffStats,
  getAssignedComplaints,
  getComplaintById,
  startWork,
  addRemark,
  resolveComplaint,
  getRecentResolved,
};
