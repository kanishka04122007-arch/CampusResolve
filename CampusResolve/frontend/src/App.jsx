import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login               from './pages/Login';
import Register            from './pages/Register';
import DashboardLayout     from './components/DashboardLayout';
import StudentDashboard    from './pages/StudentDashboard';
import CoordinatorDashboard    from './pages/CoordinatorDashboard';
import CoordinatorComplaints   from './pages/CoordinatorComplaints';
import CoordinatorComplaintDetail from './pages/CoordinatorComplaintDetail';
import CoordinatorStaff        from './pages/CoordinatorStaff';
import StaffDashboard          from './pages/StaffDashboard';
import StaffComplaints         from './pages/StaffComplaints';
import StaffComplaintDetail    from './pages/StaffComplaintDetail';
import CreateComplaint     from './pages/CreateComplaint';
import MyComplaints        from './pages/MyComplaints';
import ComplaintDetails    from './pages/ComplaintDetails';
import EditComplaint       from './pages/EditComplaint';
import Notifications       from './pages/Notifications';
import AdminOverview       from './pages/admin/AdminOverview';
import AdminUsers          from './pages/admin/AdminUsers';
import AdminComplaints     from './pages/admin/AdminComplaints';
import Profile             from './pages/Profile';
import MySupportTickets    from './pages/MySupportTickets';
import AdminSupportTickets from './pages/AdminSupportTickets';
import { AuthContext }     from './context/AuthContext';

const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
    <p className="text-4xl mb-3">🚧</p>
    <p className="text-lg font-semibold text-slate-600">{title}</p>
    <p className="text-sm mt-1">Coming soon...</p>
  </div>
);

const normalizeRole = (role) => {
  if (!role) return 'student';
  const r = String(role).toLowerCase().trim();
  if (r.includes('admin')) return 'admin';
  if (r.includes('coord')) return 'coordinator';
  if (r.includes('staff')) return 'staff';
  return 'student';
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-slate-400">
      <svg className="w-8 h-8 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Loading...
    </div>
  );

  const role = user?.role ? normalizeRole(user.role) : null;
  const rolePath = role ? `/${role}` : '/login';

  return (
    <Routes>
      <Route path="/"         element={<Navigate to={user ? rolePath : '/login'} replace />} />
      <Route path="/login"    element={user ? <Navigate to={rolePath} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={rolePath} replace /> : <Register />} />

      {/* ── Protected Layout ── */}
      <Route element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}>

        {/* Student */}
        <Route path="/student" element={role === 'student' ? <StudentDashboard /> : <Navigate to={rolePath} replace />} />
        <Route path="/support/my" element={role === 'student' ? <MySupportTickets /> : <Navigate to={rolePath} replace />} />

        {/* Coordinator */}
        <Route path="/coordinator"                element={role === 'coordinator' ? <CoordinatorDashboard />       : <Navigate to={rolePath} replace />} />
        <Route path="/coordinator/complaints"      element={role === 'coordinator' ? <CoordinatorComplaints />      : <Navigate to={rolePath} replace />} />
        <Route path="/coordinator/complaints/:id"  element={role === 'coordinator' ? <CoordinatorComplaintDetail /> : <Navigate to={rolePath} replace />} />
        <Route path="/coordinator/staff"           element={role === 'coordinator' ? <CoordinatorStaff />           : <Navigate to={rolePath} replace />} />

        {/* Staff */}
        <Route path="/staff"                element={role === 'staff' ? <StaffDashboard />       : <Navigate to={rolePath} replace />} />
        <Route path="/staff/complaints"     element={role === 'staff' ? <StaffComplaints />      : <Navigate to={rolePath} replace />} />
        <Route path="/staff/complaints/:id" element={role === 'staff' ? <StaffComplaintDetail /> : <Navigate to={rolePath} replace />} />

        <Route path="/admin"             element={role === 'admin' ? <AdminOverview />    : <Navigate to={rolePath} replace />} />
        <Route path="/admin/users"       element={role === 'admin' ? <AdminUsers />       : <Navigate to={rolePath} replace />} />
        <Route path="/admin/complaints"  element={role === 'admin' ? <AdminComplaints />  : <Navigate to={rolePath} replace />} />
        <Route path="/admin/support"     element={role === 'admin' ? <AdminSupportTickets /> : <Navigate to={rolePath} replace />} />

        {/* Shared Complaint Routes */}
        <Route path="/complaints/new"      element={<CreateComplaint />} />
        <Route path="/complaints/my"       element={<MyComplaints />} />
        <Route path="/complaints/:id"      element={<ComplaintDetails />} />
        <Route path="/complaints/:id/edit" element={<EditComplaint />} />

        {/* Shared misc */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile"       element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? rolePath : '/login'} replace />} />
    </Routes>
  );
}

export default App;
