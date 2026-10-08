import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';

const STATUS_OPTIONS = ['All','Submitted','Under Review','Assigned','In Progress','Resolved','Closed','Rejected'];

const statusColors = {
  'Submitted':    'bg-yellow-100 text-yellow-800',
  'Under Review': 'bg-blue-100 text-blue-800',
  'Assigned':     'bg-indigo-100 text-indigo-800',
  'In Progress':  'bg-orange-100 text-orange-800',
  'Resolved':     'bg-green-100 text-green-800',
  'Closed':       'bg-slate-100 text-slate-700',
  'Rejected':     'bg-red-100 text-red-800',
};

const priorityColors = { Low:'text-green-600', Medium:'text-yellow-600', High:'text-orange-600', Critical:'text-red-700 font-bold' };

const PAGE_SIZE = 5;

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/complaints/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(prev => prev.filter(c => c._id !== id));
      setDeleteId(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  // Filter + Search + Sort
  let filtered = complaints
    .filter(c => statusFilter === 'All' || c.status === statusFilter)
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c._id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortOrder === 'desc'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Complaints</h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">Track and manage all your submitted complaints.</p>
        </div>
        <Link to="/complaints/new"
          className="w-full sm:w-auto text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-200 transition">
          + New Complaint
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or ID..."
            className="w-full pl-9 pr-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>

          <button onClick={() => setSortOrder(p => p === 'desc' ? 'asc' : 'desc')}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-600 hover:bg-slate-50 transition shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span className="hidden min-[400px]:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 sm:p-16 text-slate-400">
            <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading...
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center p-12 sm:p-16 text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium text-sm sm:text-base">No complaints found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap min-w-[640px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] sm:text-xs">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 sm:px-5 py-3 text-left font-semibold">Title</th>
                    <th className="px-4 sm:px-5 py-3 text-left font-semibold">Department</th>
                    <th className="px-4 sm:px-5 py-3 text-left font-semibold">Priority</th>
                    <th className="px-4 sm:px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 sm:px-5 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 sm:px-5 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map(c => (
                    <tr key={c._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 sm:px-5 py-3.5 font-mono text-xs text-slate-400">#{c._id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 sm:px-5 py-3.5 max-w-[180px] truncate">
                        <Link to={`/complaints/${c._id}`} className="font-medium text-slate-800 hover:text-blue-600 transition truncate block">{c.title}</Link>
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 text-slate-500">{c.complaintDepartment || c.department}</td>
                      <td className={`px-4 sm:px-5 py-3.5 font-semibold ${priorityColors[c.priority]}`}>{c.priority}</td>
                      <td className="px-4 sm:px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[c.status] || 'bg-slate-100 text-slate-700'}`}>{c.status}</span>
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 sm:px-5 py-3.5">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Link to={`/complaints/${c._id}`}
                            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">View</Link>
                          {c.status === 'Submitted' && (
                            <>
                              <Link to={`/complaints/${c._id}/edit`}
                                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">Edit</Link>
                              <button onClick={() => setDeleteId(c._id)}
                                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
                <p>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results</p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-2.5 sm:px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs sm:text-sm">← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i+1} onClick={() => setPage(i+1)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg border transition text-xs sm:text-sm ${page === i+1 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
                      {i+1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-2.5 sm:px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs sm:text-sm">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm">
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Delete Complaint</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Are you sure? This action cannot be undone.</p>
            </div>
            <div className="flex gap-2.5 sm:gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
