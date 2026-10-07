import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../../config/api';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [searchTerm, statusFilter, departmentFilter]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm, status: statusFilter, department: departmentFilter }
      });
      setComplaints(res.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (complaints.length === 0) return alert("No data to export.");
    const headers = ["ID", "Title", "Student", "Department", "Priority", "Status", "Date"];
    const csvRows = [headers.join(',')];
    
    complaints.forEach(c => {
      const row = [
        c.complaintId,
        `"${c.title.replace(/"/g, '""')}"`,
        `"${c.createdBy?.name || 'Unknown'}"`,
        c.complaintDepartment,
        c.priority,
        c.status,
        new Date(c.createdAt).toLocaleDateString()
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'complaints_report.csv');
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Complaint Management</h1>
          <p className="text-slate-500 mt-1">Monitor and manage all system complaints</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Search ID or Title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition shadow-sm flex items-center gap-2 justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Complaint Title</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status & Priority</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading complaints...</td></tr>
              ) : complaints.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No complaints found.</td></tr>
              ) : (
                complaints.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{c.complaintId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 truncate max-w-xs">{c.title}</div>
                      <div className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{c.createdBy?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{c.complaintDepartment}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">{c.status}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold 
                          ${c.priority === 'High' ? 'text-red-700 bg-red-50' : c.priority === 'Medium' ? 'text-yellow-700 bg-yellow-50' : 'text-blue-700 bg-blue-50'}`}>
                          {c.priority} Priority
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/complaints/${c._id}`} 
                        className="text-xs font-medium px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition inline-block"
                      >
                        View Details
                      </Link>
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

export default AdminComplaints;
