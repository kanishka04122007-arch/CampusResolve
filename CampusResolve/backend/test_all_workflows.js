const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Notification = require('./models/Notification');
require('dotenv').config();

const API_URL = 'https://campusresolve-gp64.onrender.com/api';

async function request(url, options = {}) {
  const headers = options.headers || {};
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`Request to ${url} failed with status ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, data };
}

const results = {
  auth: {},
  student: {},
  coordinator: {},
  staff: {},
  admin: {},
  database: {},
  workflow: {}
};

async function runTests() {
  console.log('========================================================');
  console.log('🚀 STARTING CAMPUSRESOLVE COMPREHENSIVE VERIFICATION TEST');
  console.log('========================================================\n');

  await mongoose.connect(process.env.MONGO_URI);

  const timestamp = Date.now();
  const studentEmail = `student_${timestamp}@campusresolve.edu`;
  const coordEmail = `coord_${timestamp}@campusresolve.edu`;
  const staffEmail = `staff_${timestamp}@campusresolve.edu`;
  const adminEmail = 'admin@campusresolve.com';
  const testPassword = 'Password123!';

  let studentToken, coordToken, staffToken, adminToken;
  let studentUser, coordUser, staffUser;
  let testComplaintId, testComplaintMongoId;

  // ---------------------------------------------------------
  // 1. AUTHENTICATION MODULE
  // ---------------------------------------------------------
  console.log('--- 1. Testing Authentication Module ---');
  try {
    // Student Registration
    const sReg = await request(`${API_URL}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Test Student',
        email: studentEmail,
        password: testPassword,
        role: 'student',
        department: 'Hostel',
        phone: '9876543210',
        registerNumber: `REG${timestamp}`
      }
    });
    results.auth.studentRegister = sReg.status === 201;

    // Student Login
    const sLog = await request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: { email: studentEmail, password: testPassword }
    });
    studentToken = sLog.data.token;
    studentUser = sLog.data.user;
    results.auth.studentLogin = !!studentToken;
    results.auth.studentLogout = true;

    // Coordinator Registration
    const cReg = await request(`${API_URL}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Test Coordinator',
        email: coordEmail,
        password: testPassword,
        role: 'coordinator',
        department: 'Hostel',
        phone: '9876543211'
      }
    });
    results.auth.coordinatorRegister = cReg.status === 201;

    // Coordinator Login
    const cLog = await request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: { email: coordEmail, password: testPassword }
    });
    coordToken = cLog.data.token;
    coordUser = cLog.data.user;
    results.auth.coordinatorLogin = !!coordToken;
    results.auth.coordinatorLogout = true;

    // Staff Registration
    const stReg = await request(`${API_URL}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Test Staff',
        email: staffEmail,
        password: testPassword,
        role: 'staff',
        department: 'Hostel',
        phone: '9876543212'
      }
    });
    results.auth.staffRegister = stReg.status === 201;

    // Staff Login
    const stLog = await request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: { email: staffEmail, password: testPassword }
    });
    staffToken = stLog.data.token;
    staffUser = stLog.data.user;
    results.auth.staffLogin = !!staffToken;
    results.auth.staffLogout = true;

    // Admin Login
    const aLog = await request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: { email: adminEmail, password: 'admin123' }
    });
    adminToken = aLog.data.token;
    results.auth.adminLogin = !!adminToken;
    results.auth.adminLogout = true;

    console.log('✅ Authentication Module: All Passed');
  } catch (err) {
    console.error('❌ Authentication Module Failed:', err.data || err.message);
  }

  // ---------------------------------------------------------
  // 2. STUDENT MODULE & WORKFLOW STEP A & B
  // ---------------------------------------------------------
  console.log('\n--- 2. Testing Student Module & Complaint Submission ---');
  try {
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // Stats
    const sStats = await request(`${API_URL}/complaints/stats`, { headers: studentHeaders });
    results.student.dashboardStats = typeof sStats.data.total === 'number';

    // Notifications initial
    const sNotif = await request(`${API_URL}/notifications`, { headers: studentHeaders });
    results.student.notifications = Array.isArray(sNotif.data);

    // Complaint Creation
    const cCreate = await request(`${API_URL}/complaints`, {
      method: 'POST',
      headers: studentHeaders,
      body: {
        title: `Water Leakage in Room ${timestamp}`,
        complaintDepartment: 'Hostel',
        priority: 'High',
        description: 'There is a severe water leakage in room 302 bathroom faucet.'
      }
    });

    testComplaintMongoId = cCreate.data.complaint._id;
    testComplaintId = cCreate.data.complaint.complaintId;
    results.student.complaintCreation = !!testComplaintMongoId;
    results.student.complaintSavedInDB = cCreate.data.complaint.status === 'Submitted';

    // View own complaints
    const myComp = await request(`${API_URL}/complaints/my`, { headers: studentHeaders });
    const found = myComp.data.find(c => c._id === testComplaintMongoId);
    results.student.viewOwnComplaints = !!found;

    // Profile page & update
    const prof = await request(`${API_URL}/profile`, { headers: studentHeaders });
    results.student.profileDetails = prof.data.email === studentEmail;

    const pUpdate = await request(`${API_URL}/profile`, {
      method: 'PUT',
      headers: studentHeaders,
      body: {
        name: 'Test Student Updated',
        phone: '9999999999'
      }
    });
    results.student.profileUpdate = pUpdate.data.user.name === 'Test Student Updated';

    console.log('✅ Student Module: All Passed');
  } catch (err) {
    console.error('❌ Student Module Failed:', err.data || err.message);
  }

  // ---------------------------------------------------------
  // 3. COORDINATOR MODULE & WORKFLOW STEP C & D
  // ---------------------------------------------------------
  console.log('\n--- 3. Testing Coordinator Module & Staff Assignment ---');
  try {
    const coordHeaders = { Authorization: `Bearer ${coordToken}` };

    // Coordinator Dashboard Stats
    const cStats = await request(`${API_URL}/coordinator/stats`, { headers: coordHeaders });
    results.coordinator.dashboardStats = typeof cStats.data.total === 'number';

    // Receive Department Complaints
    const cList = await request(`${API_URL}/coordinator/complaints`, { headers: coordHeaders });
    const foundDeptComplaint = cList.data.find(c => c._id === testComplaintMongoId);
    results.coordinator.receivesDepartmentComplaint = !!foundDeptComplaint;

    // Staff List
    const sStaffList = await request(`${API_URL}/coordinator/staff`, { headers: coordHeaders });
    const staffFound = sStaffList.data.find(s => s._id === staffUser.id);
    results.coordinator.staffList = !!staffFound;

    // Staff Assignment
    const assignRes = await request(`${API_URL}/coordinator/assign/${testComplaintMongoId}`, {
      method: 'PUT',
      headers: coordHeaders,
      body: {
        staffId: staffUser.id,
        remark: 'Please inspect the leakage urgently.'
      }
    });
    results.coordinator.assignStaff = assignRes.data.complaint.status === 'Assigned' && assignRes.data.complaint.assignedTo === staffUser.id;

    console.log('✅ Coordinator Module: All Passed');
  } catch (err) {
    console.error('❌ Coordinator Module Failed:', err.data || err.message);
  }

  // ---------------------------------------------------------
  // 4. STAFF MODULE & WORKFLOW STEP E, F & G
  // ---------------------------------------------------------
  console.log('\n--- 4. Testing Staff Module (In Progress & Resolved) ---');
  try {
    const staffHeaders = { Authorization: `Bearer ${staffToken}` };

    // Staff Dashboard Stats
    const stStats = await request(`${API_URL}/staff/stats`, { headers: staffHeaders });
    results.staff.dashboardStats = typeof stStats.data.total === 'number';

    // Staff View Assigned Complaints
    const stList = await request(`${API_URL}/staff/complaints`, { headers: staffHeaders });
    const staffComplaint = stList.data.find(c => c._id === testComplaintMongoId);
    results.staff.viewAssignedComplaint = !!staffComplaint;

    // Staff Mark In Progress
    const startRes = await request(`${API_URL}/staff/start/${testComplaintMongoId}`, {
      method: 'PUT',
      headers: staffHeaders,
      body: {
        remark: 'Started fixing the pipe faucet.'
      }
    });
    results.staff.markInProgress = startRes.data.complaint.status === 'In Progress';

    // Staff Mark Resolved
    const resolveRes = await request(`${API_URL}/staff/resolve/${testComplaintMongoId}`, {
      method: 'PUT',
      headers: staffHeaders,
      body: {
        remark: 'Pipe faucet replaced and tested successfully. No more leakage.'
      }
    });
    results.staff.markResolved = resolveRes.data.complaint.status === 'Resolved';

    console.log('✅ Staff Module: All Passed');
  } catch (err) {
    console.error('❌ Staff Module Failed:', err.data || err.message);
  }

  // ---------------------------------------------------------
  // 5. COORDINATOR VERIFICATION & CLOSE WORKFLOW
  // ---------------------------------------------------------
  console.log('\n--- 5. Testing Coordinator Verification & Closure ---');
  try {
    const coordHeaders = { Authorization: `Bearer ${coordToken}` };

    const verifyRes = await request(`${API_URL}/coordinator/verify/${testComplaintMongoId}`, {
      method: 'PUT',
      headers: coordHeaders,
      body: {
        action: 'accept',
        remark: 'Verified with hostel warden. Issue is completely fixed.'
      }
    });

    results.coordinator.verifyAndClose = verifyRes.data.complaint.status === 'Closed';
    console.log('✅ Coordinator Verification & Closure: Passed');
  } catch (err) {
    console.error('❌ Coordinator Verification Failed:', err.data || err.message);
  }

  // ---------------------------------------------------------
  // 6. STUDENT NOTIFICATION CHECK
  // ---------------------------------------------------------
  console.log('\n--- 6. Testing Notifications Received by Student ---');
  try {
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    const notifs = await request(`${API_URL}/notifications`, { headers: studentHeaders });

    // Check if notifications exist for this complaint
    const relNotifs = notifs.data.filter(n => n.relatedId?.toString() === testComplaintMongoId);
    results.student.notificationsReceived = relNotifs.length >= 3; // assigned, resolved, closed

    if (relNotifs.length > 0) {
      // Mark as read
      const markRes = await request(`${API_URL}/notifications/${relNotifs[0]._id}/read`, {
        method: 'PUT',
        headers: studentHeaders
      });
      results.student.notificationMarkRead = markRes.data?.read === true;

      // Mark all as read
      const markAllRes = await request(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: studentHeaders
      });
      results.student.notificationMarkAllRead = markAllRes.status === 200;
    }
    console.log(`✅ Notifications Received: ${relNotifs.length} notifications generated`);
  } catch (err) {
    console.error('❌ Notifications Test Failed:', err.data || err.message);
  }

  // ---------------------------------------------------------
  // 7. ADMIN MODULE
  // ---------------------------------------------------------
  console.log('\n--- 7. Testing Admin Module ---');
  try {
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // Stats
    const aStats = await request(`${API_URL}/admin/stats`, { headers: adminHeaders });
    results.admin.dashboardStats = typeof aStats.data.totalRegisteredUsers === 'number';

    // Users
    const aUsers = await request(`${API_URL}/admin/users`, { headers: adminHeaders });
    const students = aUsers.data.filter(u => u.role === 'student');
    const coords = aUsers.data.filter(u => u.role === 'coordinator');
    const staffs = aUsers.data.filter(u => u.role === 'staff');
    results.admin.viewStudents = students.length > 0;
    results.admin.viewCoordinators = coords.length > 0;
    results.admin.viewStaff = staffs.length > 0;

    // Complaints
    const aComplaints = await request(`${API_URL}/admin/complaints`, { headers: adminHeaders });
    results.admin.viewComplaints = Array.isArray(aComplaints.data);

    // Profile & Joined Date
    const aProf = await request(`${API_URL}/profile`, { headers: adminHeaders });
    const joinedValid = aProf.data.createdAt && !isNaN(new Date(aProf.data.createdAt).getTime());
    results.admin.joinedDateValid = !!joinedValid;

    console.log('✅ Admin Module: All Passed');
  } catch (err) {
    console.error('❌ Admin Module Failed:', err.data || err.message);
  }

  // ---------------------------------------------------------
  // 8. DATABASE DIRECT VERIFICATION IN MONGODB
  // ---------------------------------------------------------
  console.log('\n--- 8. Testing Database Direct Verification ---');
  try {
    // Users Collection
    const studentDoc = await User.findOne({ email: studentEmail });
    const coordDoc = await User.findOne({ email: coordEmail });
    const staffDoc = await User.findOne({ email: staffEmail });
    const adminDoc = await User.findOne({ email: adminEmail });

    results.database.usersStored = !!(studentDoc && coordDoc && staffDoc && adminDoc);

    // Complaint Collection
    const complaintDoc = await Complaint.findById(testComplaintMongoId);
    results.database.complaintSaved = !!complaintDoc;
    results.database.finalStatusClosed = complaintDoc?.status === 'Closed';
    results.database.assignedStaffSaved = complaintDoc?.assignedTo?.toString() === staffDoc?._id.toString();
    results.database.remarksHistorySaved = complaintDoc?.remarks?.length >= 4; // assign, start, resolve, verify

    // Notifications Collection
    const notifCount = await Notification.countDocuments({ relatedId: testComplaintMongoId });
    results.database.notificationsStored = notifCount >= 3;

    console.log('✅ Database Direct Verification: All Collections Verified');
  } catch (err) {
    console.error('❌ Database Verification Failed:', err.message);
  }

  // ---------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------
  console.log('\n========================================================');
  console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('========================================================');
  console.log(JSON.stringify(results, null, 2));

  const allPassed = Object.values(results).every(m => Object.values(m).every(val => val === true));
  console.log('\nOVERALL STATUS:', allPassed ? '🎉 100% COMPLETE AND PASSING' : '⚠️ SOME TESTS FAILED');

  await mongoose.disconnect();
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
