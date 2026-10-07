const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');

// 1. Create Complaint
const createComplaint = async (req, res) => {
  try {
    console.log('📥 CREATE COMPLAINT - body:', req.body);
    console.log('👤 AUTH USER:', req.user);

    const { title, description, complaintDepartment, priority } = req.body;
    let attachmentPath = '';
    if (req.file) {
      attachmentPath = req.file.path.replace(/\\/g, '/');
    }

    if (!title || !description || !complaintDepartment) {
      return res.status(400).json({ message: 'Title, description, and complaint department are required.' });
    }

    const complaintId = 'CMP-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);

    const complaint = new Complaint({
      complaintId,
      title,
      description,
      complaintDepartment,
      priority,
      attachment: attachmentPath,
      createdBy: req.user.userId
    });

    await complaint.save();

    // Create notifications for coordinators in the same department
    const coordinators = await User.find({ 
      role: { $regex: /^coordinator$/i }, 
      department: complaintDepartment 
    });
    const notifications = coordinators.map(coord => ({
      userId: coord._id,
      title: 'New Complaint Submitted',
      message: `A new complaint "${title}" has been submitted in your department.`,
      type: 'new_complaint',
      relatedId: complaint._id
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: 'Complaint Submitted Successfully', complaint });
  } catch (error) {
    console.error('❌ CREATE COMPLAINT ERROR:', error.message);
    // Return validation errors clearly
    if (error.name === 'ValidationError') {
      const fields = Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`);
      return res.status(400).json({ message: 'Validation Error', errors: fields });
    }
    res.status(500).json({ message: error.message });
  }
};


// 2. Get My Complaints
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. Get Complaint By ID
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name')
      .populate('remarks.addedBy', 'name role');
      
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    // Ensure the student can only view their own complaint, unless they are staff/coordinator/admin
    if (req.user.role === 'student' && complaint.createdBy._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 4. Update Complaint
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }

    if (complaint.status !== 'Submitted') {
      return res.status(400).json({ message: 'Cannot edit complaint after it has been reviewed or assigned' });
    }

    const { title, description, complaintDepartment, priority } = req.body;
    complaint.title = title || complaint.title;
    complaint.description = description || complaint.description;
    complaint.complaintDepartment = complaintDepartment || complaint.complaintDepartment;
    complaint.priority = priority || complaint.priority;

    if (req.file) {
      complaint.attachment = req.file.path.replace(/\\/g, '/');
    }

    await complaint.save();
    res.json({ message: 'Complaint Updated Successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 5. Delete Complaint
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this complaint' });
    }

    if (complaint.status !== 'Submitted') {
      return res.status(400).json({ message: 'Cannot delete complaint after it has been reviewed or assigned' });
    }

    await complaint.deleteOne();
    res.json({ message: 'Complaint Deleted Successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 6. Get Complaint Stats
const getComplaintStats = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.userId });
    
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)).length,
      resolved: complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length,
      rejected: complaints.filter(c => c.status === 'Rejected').length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 7. Get Recent Complaints
const getRecentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
  getRecentComplaints
};
