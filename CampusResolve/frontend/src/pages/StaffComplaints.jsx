import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const STATUS_FILTER = ['All', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

const statusColors = {
  'Assigned':    'bg-indigo-100 text-indigo-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  'Resolved':    'bg-green-100 text-green-800',
  'Closed':      'bg-slate-100 text-slate-700',
};

const priorityColors = {
  Low: 'text-green-600', Medium: 'text-yellow-600',
  High: 'text-orange-600', Critical: 'text-red-700 font-bold'
};

const PAGE_SIZE = 8;

const StaffComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('All');
  const [sortOrder, setSortOrder]   = useState('desc');
  const [page, setPage]             = useState(1);
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('http://localhost:5000/api/staff/complaints', { headers })
      .then(r => setComplaints(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  let filtered = complaints
    .filter(c => filter === 'All' || c.status === filter)
    .filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.createdBy?.name || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortOrder === 'desc'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Assigned Complaints</h1>
          <p className="text-slate-500 mt-1">All complaints assigned to you for resolution.</p>
        </div>
        <Link to="/staff"
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
          ← Dashboard
        </Link>
      </div>

      {/* Quick count chips */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label: 'Needs Start', count: complaints.filter(c => c.status === 'Assigned').length,    color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'In Progress', count: complaints.filter(c => c.status === 'In Progress').length,  color: 'bg-orange-50 text-orange-700 border-orange-200' },
          { label: 'Resolved',    count: complaints.filter(c => c.status === 'Resolved').length,    color: 'bg-green-50  text-green-700  border-green-200'  },
        ].map(s => (
          <span key={s.label} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${s.color}`}>
            {s.label}: {s.count}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or student name..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition">
          {STATUS_FILTER.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => setSortOrder(p => p === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
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
                        <p className="font-medium text-slate-800 max-w-[180px] truncate">{c.title}</p>
                        <p className="text-xs text-slate-400">{c.complaintDepartment || c.department}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{c.createdBy?.name || 'N/A'}</td>
                      <td className={`px-5 py-3.5 font-semibold text-xs ${priorityColors[c.priority]}`}>{c.priority}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[c.status] || 'bg-slate-100 text-slate-700'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <Link to={`/staff/complaints/${c._id}`}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                            c.status === 'Assigned'    ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' :
                            c.status === 'In Progress' ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' :
                            'text-green-600 bg-green-50 hover:bg-green-100'
                          }`}>
                          {c.status === 'Assigned' ? 'Start' : c.status === 'In Progress' ? 'Continue' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <p>Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i+1} onClick={() => setPage(i+1)}
                      className={`px-3 py-1.5 rounded-lg border transition ${page===i+1 ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 hover:bg-slate-50'}`}>
                      {i+1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffComplaints;
