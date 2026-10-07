import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FiCamera, FiEdit3, FiLock, FiMail, FiUser, FiPhone, FiCheck, FiX, 
  FiActivity, FiCheckCircle, FiClock, FiTrash2, FiUsers, FiBriefcase, FiAlertTriangle 
} from 'react-icons/fi';

const Profile = () => {
  const { user: authUser, login } = useContext(AuthContext); // Assuming login updates context, else just reload context if needed. Actually context reads from localStorage, we might need a way to refresh context. For now, we update local state.
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  
  // Change Password Modal State
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  // Feedback Messages
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile Picture Upload
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEditForm({ name: res.data.name, phone: res.data.phone || '', email: res.data.email });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handlePwdChange = (e) => setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/profile', editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, ...res.data.user });
      setIsEditing(false);
      showMessage('success', 'Profile updated successfully!');
      
      // Update local storage so context picks it up on refresh (optional, depends on auth context impl)
      let storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser = { ...storedUser, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(storedUser));
      
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return showMessage('error', 'New passwords do not match!');
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/profile/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowPwdModal(false);
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', 'Password changed successfully!');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);
    setUploadingImage(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/profile/upload-image', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setProfile({ ...profile, profilePicture: res.data.profilePicture });
      showMessage('success', 'Profile picture updated!');
      
      let storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.profilePicture = res.data.profilePicture;
      localStorage.setItem('user', JSON.stringify(storedUser));
    } catch (err) {
      showMessage('error', 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/profile/remove-image', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, profilePicture: '' });
      showMessage('success', 'Profile picture removed!');
      
      let storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.profilePicture = '';
      localStorage.setItem('user', JSON.stringify(storedUser));
    } catch (err) {
      showMessage('error', 'Failed to remove image.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full min-h-[60vh]">
      <svg className="w-10 h-10 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  const getProfileImageUrl = () => {
    if (profile?.profilePicture) {
      return `http://localhost:5000/${profile.profilePicture}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=3B82F6&color=fff&size=150`;
  };

  // -------------------------------------------------------------
  // Role-Specific Sub-components
  // -------------------------------------------------------------

  const StudentStats = () => (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FiActivity className="text-blue-600"/> Complaint Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox title="Total" value={profile.stats?.totalComplaints || 0} icon={<FiBriefcase />} color="blue" />
          <StatBox title="Resolved" value={profile.stats?.resolved || 0} icon={<FiCheckCircle />} color="green" />
          <StatBox title="Pending" value={profile.stats?.pending || 0} icon={<FiClock />} color="orange" />
          <StatBox title="Rejected" value={profile.stats?.rejected || 0} icon={<FiX />} color="red" />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FiClock className="text-blue-600"/> Recent Complaints</h3>
        <div className="space-y-3">
          {profile.recentComplaints?.length > 0 ? profile.recentComplaints.map(c => (
            <div key={c._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-sm text-slate-800">{c.title}</p>
                <p className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
          )) : <p className="text-sm text-slate-500">No recent complaints found.</p>}
        </div>
      </div>
    </>
  );

  const CoordinatorStats = () => (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FiActivity className="text-blue-600"/> Department Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox title="Received" value={profile.stats?.totalComplaints || 0} icon={<FiBriefcase />} color="blue" />
          <StatBox title="Assigned" value={profile.stats?.assigned || 0} icon={<FiUsers />} color="purple" />
          <StatBox title="Resolved" value={profile.stats?.resolved || 0} icon={<FiCheckCircle />} color="green" />
          <StatBox title="Pending" value={profile.stats?.pending || 0} icon={<FiClock />} color="orange" />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FiUsers className="text-blue-600"/> Managed Staff List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.managedStaff?.length > 0 ? profile.managedStaff.map(staff => (
            <div key={staff._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {staff.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">{staff.name}</p>
                <p className="text-xs text-slate-500">{staff.phone || 'No phone'}</p>
              </div>
            </div>
          )) : <p className="text-sm text-slate-500">No staff found in your department.</p>}
        </div>
      </div>
    </>
  );

  const StaffStats = () => (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FiActivity className="text-blue-600"/> Work Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBox title="Assigned" value={profile.stats?.assigned || 0} icon={<FiBriefcase />} color="blue" />
          <StatBox title="Completed" value={profile.stats?.resolved || 0} icon={<FiCheckCircle />} color="green" />
          <StatBox title="Pending Tasks" value={profile.stats?.pending || 0} icon={<FiAlertTriangle />} color="orange" />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FiClock className="text-blue-600"/> Recent Assigned Complaints</h3>
        <div className="space-y-3">
          {profile.recentComplaints?.length > 0 ? profile.recentComplaints.map(c => (
            <div key={c._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-sm text-slate-800">{c.title}</p>
                <p className="text-xs text-slate-500">From: {c.createdBy?.name || 'Unknown'}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
          )) : <p className="text-sm text-slate-500">No recent assignments.</p>}
        </div>
      </div>
    </>
  );

  const AdminStats = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FiActivity className="text-blue-600"/> System Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatBox title="Total Students" value={profile.stats?.totalStudents || 0} icon={<FiUsers />} color="blue" />
        <StatBox title="Total Coordinators" value={profile.stats?.totalCoordinators || 0} icon={<FiUsers />} color="purple" />
        <StatBox title="Total Staff" value={profile.stats?.totalStaff || 0} icon={<FiUsers />} color="teal" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox title="Total Complaints" value={profile.stats?.totalComplaints || 0} icon={<FiBriefcase />} color="indigo" />
        <StatBox title="Resolved" value={profile.stats?.resolved || 0} icon={<FiCheckCircle />} color="green" />
        <StatBox title="Pending" value={profile.stats?.pending || 0} icon={<FiClock />} color="orange" />
      </div>
    </div>
  );

  // Helper Components
  const StatBox = ({ title, value, icon, color }) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600',
      red: 'bg-red-50 text-red-600',
      purple: 'bg-purple-50 text-purple-600',
      teal: 'bg-teal-50 text-teal-600',
      indigo: 'bg-indigo-50 text-indigo-600'
    };
    return (
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    let style = "bg-slate-100 text-slate-600";
    if (status === 'Resolved' || status === 'Closed') style = "bg-green-100 text-green-700";
    if (status === 'In Progress') style = "bg-blue-100 text-blue-700";
    if (status === 'Pending') style = "bg-orange-100 text-orange-700";
    
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>{status}</span>;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Toast Messages */}
      {message.text && (
        <div className={`fixed top-8 right-8 px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 transition-all animate-in slide-in-from-top-4 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.type === 'error' ? <FiX className="text-lg" /> : <FiCheck className="text-lg" />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your personal information and account security.</p>
          </div>
          <button onClick={() => setShowPwdModal(true)} className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm">
            <FiLock className="w-4 h-4 text-slate-400" /> Change Password
          </button>
        </div>

        {/* Profile Card (Minimalist) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            
            {/* Minimalist Profile Picture */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 rounded-full border border-slate-200 shadow-sm overflow-hidden bg-slate-100">
                <img src={getProfileImageUrl()} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <label className="absolute bottom-1 right-1 bg-white text-slate-600 p-2 rounded-full shadow-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                {uploadingImage ? <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <FiCamera className="w-4 h-4" />}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 font-medium text-xs rounded-md">
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </span>
                    {profile.role !== 'admin' && profile.department && (
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <FiBriefcase className="w-4 h-4"/> {profile.department}
                      </span>
                    )}
                    {profile.registerNumber && (
                      <span className="text-sm text-slate-500">
                        ID: {profile.registerNumber}
                      </span>
                    )}
                  </div>
                </div>
                
                {profile.profilePicture && (
                  <button onClick={handleRemoveImage} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-red-50">
                    <FiTrash2 className="w-4 h-4" /> Remove Photo
                  </button>
                )}
              </div>

              {/* Clean Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-100 text-left">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><FiMail className="w-3.5 h-3.5"/> Email</p>
                  <p className="text-sm font-medium text-slate-800">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><FiPhone className="w-3.5 h-3.5"/> Phone</p>
                  <p className="text-sm font-medium text-slate-800">{profile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><FiClock className="w-3.5 h-3.5"/> Joined Date</p>
                  <p className="text-sm font-medium text-slate-800">
                    {profile.createdAt && !isNaN(new Date(profile.createdAt).getTime()) ? new Date(profile.createdAt).toLocaleDateString('en-GB') : 'Not Available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Edit Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                <button 
                  onClick={() => { setIsEditing(!isEditing); setEditForm({ name: profile.name, phone: profile.phone || '', email: profile.email }); }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" name="name" value={isEditing ? editForm.name : profile.name} onChange={handleEditChange} disabled={!isEditing} required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" name="email" value={isEditing ? editForm.email : profile.email} onChange={handleEditChange} disabled={!isEditing} required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <input type="tel" name="phone" value={isEditing ? editForm.phone : (profile.phone || '')} onChange={handleEditChange} disabled={!isEditing}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all" />
                </div>
                
                {isEditing && (
                  <div className="pt-2">
                    <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm">
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: Role Specific Stats */}
          <div className="lg:col-span-2 space-y-6">
            {profile.role === 'student' && <StudentStats />}
            {profile.role === 'coordinator' && <CoordinatorStats />}
            {profile.role === 'staff' && <StaffStats />}
            {profile.role === 'admin' && <AdminStats />}
          </div>
        </div>

      </div>

      {/* Change Password Modal (Minimalist) */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowPwdModal(false)}></div>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full relative z-10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-900 text-base">Change Password</h3>
              <button onClick={() => setShowPwdModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                <input type="password" name="currentPassword" value={pwdForm.currentPassword} onChange={handlePwdChange} required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input type="password" name="newPassword" value={pwdForm.newPassword} onChange={handlePwdChange} required minLength={6}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={pwdForm.confirmPassword} onChange={handlePwdChange} required minLength={6}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowPwdModal(false)} className="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm shadow-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
