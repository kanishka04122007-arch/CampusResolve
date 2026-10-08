import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

const TIMELINE = ['Submitted','Under Review','Assigned','In Progress','Resolved','Closed'];

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
  High: 'text-orange-600', Critical: 'text-red-700'
};

const StaffComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [toast, setToast]         = useState('');
  const [actionLoading, setActionLoading] = useState('');

  // Remark form
  const [remarkText, setRemarkText] = useState('');

  // Resolve form
  const [resolveRemark, setResolveRemark] = useState('');
  const [proofFile, setProofFile]         = useState(null);
  const [showResolvePanel, setShowResolvePanel] = useState(false);

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    axios.get(`${API_URL}/api/staff/complaints/${id}`, { headers })
      .then(r => setComplaint(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load complaint.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStartWork = async () => {
    setActionLoading('start');
    try {
      const res = await axios.put(`${API_URL}/api/staff/start/${id}`, {}, { headers });
      setComplaint(res.data.complaint);
      showToast('⚙️ Work started — status is now In Progress');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleAddRemark = async () => {
    if (!remarkText.trim()) return;
    setActionLoading('remark');
    try {
      const res = await axios.post(`${API_URL}/api/staff/remark/${id}`, { remark: remarkText }, { headers });
      setComplaint(res.data.complaint);
      setRemarkText('');
      showToast('💬 Remark added');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleResolve = async () => {
    setActionLoading('resolve');
    try {
      const data = new FormData();
      if (resolveRemark.trim()) data.append('remark', resolveRemark);
      if (proofFile) data.append('proofImage', proofFile);

      const res = await axios.put(`${API_URL}/api/staff/resolve/${id}`, data, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      setComplaint(res.data.complaint);
      setShowResolvePanel(false);
      setResolveRemark('');
      setProofFile(null);
      showToast('✅ Complaint marked as Resolved!');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-16 sm:p-24 text-slate-400">
      <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Loading complaint...
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-24 text-slate-400 text-center">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="font-medium text-red-500 text-sm sm:text-base">{error}</p>
      <Link to="/staff/complaints" className="mt-4 text-green-600 hover:underline text-xs sm:text-sm">← Back</Link>
    </div>
  );

  const currentStep = TIMELINE.indexOf(complaint.status);
  const canStart    = complaint.status === 'Assigned';
  const canResolve  = ['Assigned', 'In Progress'].includes(complaint.status);

  return (
    <div className="w-full space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg text-xs sm:text-sm font-medium animate-pulse">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-slate-400">
        <Link to="/staff" className="hover:text-green-600">Dashboard</Link>
        <span>/</span>
        <Link to="/staff/complaints" className="hover:text-green-600">My Complaints</Link>
        <span>/</span>
        <span className="text-slate-600 font-mono">#{id.slice(-6).toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Main Content ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Complaint Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 break-words">{complaint.title}</h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Submitted {new Date(complaint.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap self-start sm:self-auto ${statusColors[complaint.status] || 'bg-slate-100 text-slate-700'}`}>
                {complaint.status}
              </span>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
              <div className="bg-slate-50 rounded-xl px-3.5 sm:px-4 py-3">
                <p className="text-[11px] sm:text-xs text-slate-400 mb-0.5">Department</p>
                <p className="font-semibold text-slate-700 text-xs sm:text-sm">{complaint.complaintDepartment || complaint.department}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3.5 sm:px-4 py-3">
                <p className="text-[11px] sm:text-xs text-slate-400 mb-0.5">Priority</p>
                <p className={`font-bold text-xs sm:text-sm ${priorityColors[complaint.priority]}`}>{complaint.priority}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3.5 sm:px-4 py-3">
                <p className="text-[11px] sm:text-xs text-slate-400 mb-0.5">Student</p>
                <p className="font-semibold text-slate-700 text-xs sm:text-sm">{complaint.createdBy?.name || 'N/A'}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate">{complaint.createdBy?.email}</p>
              </div>
              {complaint.createdBy?.registerNumber && (
                <div className="bg-slate-50 rounded-xl px-3.5 sm:px-4 py-3">
                  <p className="text-[11px] sm:text-xs text-slate-400 mb-0.5">Register No.</p>
                  <p className="font-semibold text-slate-700 text-xs sm:text-sm">{complaint.createdBy.registerNumber}</p>
                </div>
              )}
              {complaint.assignedAt && (
                <div className="bg-indigo-50 rounded-xl px-3.5 sm:px-4 py-3 sm:col-span-2">
                  <p className="text-[11px] sm:text-xs text-indigo-400 mb-0.5">Assigned to you on</p>
                  <p className="font-semibold text-indigo-700 text-xs sm:text-sm">
                    {new Date(complaint.assignedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
              {complaint.resolvedAt && (
                <div className="bg-green-50 rounded-xl px-3.5 sm:px-4 py-3 sm:col-span-2">
                  <p className="text-[11px] sm:text-xs text-green-400 mb-0.5">Resolved on</p>
                  <p className="font-semibold text-green-700 text-xs sm:text-sm">
                    {new Date(complaint.resolvedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-[11px] sm:text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Description</p>
              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Attachment */}
            {complaint.attachment && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] sm:text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Student Attachment</p>
                <a href={`${API_URL}/${complaint.attachment}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs sm:text-sm font-medium rounded-xl transition">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  View Attachment
                </a>
              </div>
            )}

            {/* Proof Image */}
            {complaint.proofImage && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] sm:text-xs text-green-600 mb-2 font-semibold uppercase tracking-wider">Your Proof Image</p>
                <a href={`${API_URL}/${complaint.proofImage}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 text-xs sm:text-sm font-medium rounded-xl transition">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  View Proof Image
                </a>
              </div>
            )}
          </div>

          {/* ── Action Panel ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
            <h2 className="font-semibold text-slate-800 text-sm sm:text-base mb-4">Actions</h2>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-6">
              {canStart && (
                <button onClick={handleStartWork} disabled={actionLoading === 'start'}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-60">
                  {actionLoading === 'start'
                    ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Starting...</>
                    : <><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Start Work</>
                  }
                </button>
              )}
              {canResolve && (
                <button onClick={() => setShowResolvePanel(p => !p)}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Mark as Resolved
                </button>
              )}
              {complaint.status === 'Resolved' && (
                <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-semibold rounded-xl">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Waiting Coordinator Verification
                </div>
              )}
            </div>

            {/* Resolve Panel */}
            {showResolvePanel && (
              <div className="border border-green-100 bg-green-50/60 rounded-xl p-3.5 sm:p-5 mb-6">
                <p className="text-xs sm:text-sm font-semibold text-green-900 mb-1">Complete Resolution</p>
                <p className="text-[11px] sm:text-xs text-green-700 mb-3">Provide a closing note and optional photo proof.</p>

                <textarea value={resolveRemark} onChange={e => setResolveRemark(e.target.value)}
                  placeholder="Describe the solution or action taken..."
                  rows={3}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-green-200 rounded-xl text-xs sm:text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none" />

                <div className="mb-4">
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1.5">Proof Image (Optional)</label>
                  <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-3 sm:file:mr-4 file:py-1.5 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-100 file:text-green-800 hover:file:bg-green-200" />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button onClick={handleResolve} disabled={actionLoading === 'resolve'}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition disabled:opacity-60">
                    {actionLoading === 'resolve' ? 'Submitting...' : 'Confirm Resolved'}
                  </button>
                  <button onClick={() => setShowResolvePanel(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-600 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Add remark */}
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">Add Remark</p>
              <textarea value={remarkText} onChange={e => setRemarkText(e.target.value)}
                placeholder="Write a progress update or internal note..."
                rows={3}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none mb-2" />
              <button onClick={handleAddRemark} disabled={!remarkText.trim() || actionLoading === 'remark'}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition disabled:opacity-50">
                {actionLoading === 'remark' ? 'Adding...' : 'Post Remark'}
              </button>
            </div>
          </div>

          {/* Remarks History */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
            <h2 className="font-semibold text-slate-800 text-sm sm:text-base mb-4">Remarks History</h2>
            {complaint.remarks && complaint.remarks.length > 0 ? (
              <div className="space-y-3">
                {complaint.remarks.map((r, i) => (
                  <div key={i} className="flex gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-700 text-xs sm:text-sm font-bold">
                      {r.addedBy?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="bg-slate-50 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-slate-700 truncate">{r.addedBy?.name || 'Staff'}</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 shrink-0">{new Date(r.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400 italic">No remarks yet.</p>
            )}
          </div>
        </div>

        {/* ── Status Timeline Sidebar ── */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 sticky top-4">
            <h2 className="font-semibold text-slate-800 text-sm sm:text-base mb-5 sm:mb-6">Status Timeline</h2>
            <div className="relative space-y-0">
              {TIMELINE.map((step, i) => {
                const isDone = i < currentStep;
                const isActive = i === currentStep;

                return (
                  <div key={step} className="flex gap-3 sm:gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isDone ? 'bg-green-500 text-white' :
                        isActive ? 'bg-green-600 text-white ring-4 ring-green-100' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {isDone ? (
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <span className="text-xs font-bold">{i+1}</span>
                        )}
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className={`w-0.5 h-7 sm:h-8 ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className="pb-5 sm:pb-6 pt-1">
                      <p className={`text-xs sm:text-sm font-semibold ${isDone ? 'text-green-600' : isActive ? 'text-green-700' : 'text-slate-400'}`}>{step}</p>
                      {isActive && <p className="text-[10px] sm:text-xs text-green-500 mt-0.5">Current Stage</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffComplaintDetail;
