const express = require('express');
const { 
  getDashboardStats, 
  getUsers, 
  getAllComplaints, 
  getReports, 
  getAdminNotifications, 
  updateUser, 
  deleteUser 
} = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/complaints', getAllComplaints);
router.get('/reports', getReports);
router.get('/notifications', getAdminNotifications);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
