import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm, role: roleFilter }
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/admin/users/${id}`, { isActive: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">View and manage all system users</p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 px-3.5 sm:px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white"
          />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 sm:px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left whitespace-nowrap text-xs sm:text-sm min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] sm:text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Name</th>
                <th className="px-4 sm:px-6 py-3.5">Email</th>
                <th className="px-4 sm:px-6 py-3.5">Role</th>
                <th className="px-4 sm:px-6 py-3.5">Department</th>
                <th className="px-4 sm:px-6 py-3.5">Status</th>
                <th className="px-4 sm:px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="font-medium text-slate-800">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.phone || 'No phone'}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-slate-600">{u.email}</td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold capitalize
                        ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 
                          u.role === 'coordinator' ? 'bg-purple-100 text-purple-700' : 
                          u.role === 'staff' ? 'bg-green-100 text-green-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-slate-600">{u.department || '-'}</td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold ${u.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-right space-x-1.5 sm:space-x-2">
                      <button 
                        onClick={() => handleDeactivate(u._id, u.isActive !== false)}
                        className={`text-xs font-medium px-2.5 sm:px-3 py-1 rounded-lg transition ${u.isActive !== false ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      >
                        {u.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDelete(u._id)}
                        className="text-xs font-medium px-2.5 sm:px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
