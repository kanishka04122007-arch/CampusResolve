import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

const priorityColors = {
  Low: 'text-green-600', Medium: 'text-yellow-600',
  High: 'text-orange-600', Critical: 'text-red-700 font-bold'
};

const PAGE_SIZE = 8;

const CoordinatorComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState('');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/coordinator/complaints', { headers });
      setComplaints(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const quickApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await axios.put(`http://localhost:5000/api/coordinator/approve/${id}`, {}, { headers });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: 'Under Review' } : c));
    } catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(''); }
  };

  const quickReject = async (id) => {
    setActionLoading(id + '_reject');
    try {
      await axios.put(`http://localhost:5000/api/coordinator/reject/${id}`, {}, { headers });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: 'Rejected' } : c));
    } catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(''); }
  };

  // Filter + Search + Sort
  let filtered = complaints
    .filter(c => statusFilter === 'All' || c.status === statusFilter)
    .filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.createdBy?.name || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortOrder === 'desc'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    new: complaints.filter(c => c.status === 'Submitted').length,
    inProgress: complaints.filter(c => ['Under Review','Assigned','In Progress'].includes(c.status)).length,
    resolved: complaints.filter(c => ['Resolved','Closed'].includes(c.status)).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Department Complaints</h1>
          <p className="text-slate-500 mt-1">Review and manage all complaints in your department.</p>
        </div>
        <Link to="/coordinator"
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
          ← Dashboard
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'New / Pending', value: counts.new, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', dot: 'bg-yellow-400' },
          { label: 'In Progress', value: counts.inProgress, color: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-400' },
          { label: 'Resolved', value: counts.resolved, color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${s.color}`}>
            <div className={`w-3 h-3 rounded-full ${s.dot}`} />
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or student name..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
        </div>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>

        <button onClick={() => setSortOrder(p => p === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-slate-400">
            <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading complaints...
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center p-16 text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No complaints found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">ID</th>
                    <th className="px-5 py-3 text-left font-semibold">Title</th>
                    <th className="px-5 py-3 text-left font-semibold">Student</th>
                    <th className="px-5 py-3 text-left font-semibold">Priority</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Date</th>
                    <th className="px-5 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map(c => (
                    <tr key={c._id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{c._id.slice(-6).toUpperCase()}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800 max-w-[200px] truncate">{c.title}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-medium text-slate-700 text-xs">{c.createdBy?.name || 'N/A'}</p>
                          <p className="text-slate-400 text-xs">{c.createdBy?.email || ''}</p>
                        </div>
                      </td>
                      <td className={`px-5 py-3.5 font-semibold text-xs ${priorityColors[c.priority]}`}>{c.priority}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[c.status] || 'bg-slate-100 text-slate-700'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link to={`/coordinator/complaints/${c._id}`}
                            className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                            Review
                          </Link>
                          {c.status === 'Submitted' && (
                            <>
                              <button onClick={() => quickApprove(c._id)}
                                disabled={actionLoading === c._id + '_approve'}
                                className="px-2.5 py-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition disabled:opacity-50">
                                {actionLoading === c._id + '_approve' ? '...' : 'Approve'}
                              </button>
                              <button onClick={() => quickReject(c._id)}
                                disabled={actionLoading === c._id + '_reject'}
                                className="px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50">
                                {actionLoading === c._id + '_reject' ? '...' : 'Reject'}
                              </button>
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
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <p>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i+1} onClick={() => setPage(i+1)}
                      className={`px-3 py-1.5 rounded-lg border transition ${page === i+1 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
                      {i+1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoordinatorComplaints;
