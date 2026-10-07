const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');

// @desc    Create a new support ticket (Student)
// @route   POST /api/support
// @access  Private
exports.createTicket = async (req, res) => {
  try {
    const { issueType, message } = req.body;
    
    const user = await require('../models/User').findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const ticket = new SupportTicket({
      studentId: req.user.userId,
      studentName: user.name,
      issueType,
      message
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error creating support ticket', error: error.message });
  }
};

// @desc    Get all support tickets for logged in student
// @route   GET /api/support/my
// @access  Private
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ studentId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
};

// @desc    Get all support tickets (Admin)
// @route   GET /api/support
// @access  Private/Admin
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/support/:id
// @access  Private
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    // Ensure student only sees their own ticket
    if (req.user.role === 'student' && ticket.studentId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
};

// @desc    Reply to a ticket and optionally update status (Admin)
// @route   PUT /api/support/:id/reply
// @access  Private/Admin
exports.replyToTicket = async (req, res) => {
  try {
    const { adminReply, status } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (adminReply) ticket.adminReply = adminReply;
    if (status) ticket.status = status;

    await ticket.save();

    // Create a notification for the student
    await Notification.create({
      userId: ticket.studentId,
      title: 'Support Ticket Reply',
      message: `Admin replied to your support request (${ticket.issueType}): "${adminReply.substring(0, 30)}${adminReply.length > 30 ? '...' : ''}"`,
      type: 'general',
      relatedId: ticket._id // Assuming relatedId can hold any ObjectId, even though ref is Complaint
    });

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error replying to ticket', error: error.message });
  }
};

// @desc    Update ticket status (Admin)
// @route   PUT /api/support/:id/status
// @access  Private/Admin
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket status', error: error.message });
  }
};
