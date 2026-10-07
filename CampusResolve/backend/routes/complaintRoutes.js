const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
  getRecentComplaints
} = require('../controllers/complaintController');

// All complaint routes are protected
router.use(authMiddleware);

router.post('/', upload.single('attachment'), createComplaint);
router.get('/my', getMyComplaints);
router.get('/stats', getComplaintStats);
router.get('/recent', getRecentComplaints);
router.get('/:id', getComplaintById);
router.put('/:id', upload.single('attachment'), updateComplaint);
router.delete('/:id', deleteComplaint);

module.exports = router;
