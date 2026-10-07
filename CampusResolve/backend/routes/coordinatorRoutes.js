const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getDepartmentComplaints,
  approveComplaint,
  rejectComplaint,
  assignComplaint,
  addRemark,
  getCoordinatorStats,
  getStaffList,
  verifyResolution
} = require('../controllers/coordinatorController');

// All coordinator routes are protected + require coordinator role
router.use(authMiddleware);
router.use(roleMiddleware(['coordinator']));

router.get('/stats', getCoordinatorStats);
router.get('/complaints', getDepartmentComplaints);
router.get('/staff', getStaffList);
router.put('/approve/:id', approveComplaint);
router.put('/reject/:id', rejectComplaint);
router.put('/assign/:id', assignComplaint);
router.post('/remark/:id', addRemark);
router.put('/verify/:id', verifyResolution);

module.exports = router;
