const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload         = require('../middleware/uploadMiddleware');
const {
  getStaffStats,
  getAssignedComplaints,
  getComplaintById,
  startWork,
  addRemark,
  resolveComplaint,
  getRecentResolved,
} = require('../controllers/staffController');

// All staff routes are protected + require staff role
router.use(authMiddleware);
router.use(roleMiddleware(['staff']));

router.get('/stats',              getStaffStats);
router.get('/complaints',         getAssignedComplaints);
router.get('/complaints/:id',     getComplaintById);
router.put('/start/:id',          startWork);
router.post('/remark/:id',        addRemark);
router.put('/resolve/:id',        upload.single('proofImage'), resolveComplaint);
router.get('/recent-resolved',    getRecentResolved);

module.exports = router;
