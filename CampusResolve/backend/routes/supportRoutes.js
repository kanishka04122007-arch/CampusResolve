const express = require('express');
const router = express.Router();
const { 
  createTicket, 
  getMyTickets, 
  getAllTickets, 
  getTicketById, 
  replyToTicket, 
  updateTicketStatus 
} = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const protect = authMiddleware;
const admin = roleMiddleware(['admin']);

// Student routes
router.route('/')
  .post(protect, createTicket)
  .get(protect, admin, getAllTickets);

router.get('/my', protect, getMyTickets);

router.route('/:id')
  .get(protect, getTicketById);

// Admin routes
router.put('/:id/reply', protect, admin, replyToTicket);
router.put('/:id/status', protect, admin, updateTicketStatus);

module.exports = router;
