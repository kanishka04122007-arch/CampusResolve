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

const priorityColors = { Low:'text-green-600', Medium:'text-yellow-600', High:'text-orange-600', Critical:'text-red-700' };

const CoordinatorComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action states
  const [actionLoading, setActionLoading] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [rejectRemark, setRejectRemark] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignRemark, setAssignRemark] = useState('');
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [verifyRemark, setVerifyRemark] = useState('');
  const [showVerifyPanel, setShowVerifyPanel] = useState(false);
  const [toast, setToast] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          axios.get(`${API_URL}/api/complaints/${id}`, { headers }),
          axios.get(`${API_URL}/api/coordinator/staff`, { headers }),
        ]);
        setComplaint(cRes.data);
        setStaffList(sRes.data);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load complaint.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      const res = await axios.put(`${API_URL}/api/coordinator/approve/${id}`, {}, { headers });
      setComplaint(res.data.complaint);
      showToast('✅ Complaint approved — status set to Under Review');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    try {
      const res = await axios.put(`${API_URL}/api/coordinator/reject/${id}`, { remark: rejectRemark }, { headers });
      setComplaint(res.data.complaint);
      setShowRejectModal(false);
      setRejectRemark('');
      showToast('❌ Complaint rejected');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleAssign = async () => {
    if (!selectedStaff) { alert('Please select a staff member.'); return; }
    setActionLoading('assign');
    try {
      const res = await axios.put(`${API_URL}/api/coordinator/assign/${id}`, { staffId: selectedStaff, remark: assignRemark }, { headers });
      setComplaint(res.data.complaint);
      setShowAssignPanel(false);
      setSelectedStaff('');
      setAssignRemark('');
      showToast('👤 Complaint assigned to staff successfully');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleAddRemark = async () => {
    if (!remarkText.trim()) return;
    setActionLoading('remark');
    try {
      const res = await axios.post(`${API_URL}/api/coordinator/remark/${id}`, { remark: remarkText }, { headers });
      setComplaint(res.data.complaint);
      setRemarkText('');
      showToast('💬 Remark added successfully');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleVerify = async (action) => {
    setActionLoading(`verify-${action}`);
    try {
      const res = await axios.put(`${API_URL}/api/coordinator/verify/${id}`, { action, remark: verifyRemark }, { headers });
      setComplaint(res.data.complaint);
      setVerifyRemark('');
      setShowVerifyPanel(false);
      showToast(action === 'accept' ? '✅ Complaint Closed' : '🔄 Complaint Reopened');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-24 text-slate-400">
      <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      Loading complaint...
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center p-24 text-slate-400">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="font-medium text-red-500">{error}</p>
      <Link to="/coordinator/complaints" className="mt-4 text-blue-600 hover:underline text-sm">← Back to Complaints</Link>
    </div>
  );

  const currentStep = complaint.status === 'Rejected' ? -1 : TIMELINE.indexOf(complaint.status);
  const canApprove = complaint.status === 'Submitted';
  const canReject = ['Submitted', 'Under Review'].includes(complaint.status);
  const canAssign = ['Submitted', 'Under Review'].includes(complaint.status);
  const canVerify = complaint.status === 'Resolved';

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/coordinator" className="hover:text-blue-600">Dashboard</Link>
        <span>/</span>
        <Link to="/coordinator/complaints" className="hover:text-blue-600">Complaints</Link>
        <span>/</span>
        <span className="text-slate-600">#{id.slice(-6).toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">

          {/* Complaint Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h1 className="text-xl font-bold text-slate-800">{complaint.title}</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Submitted on {new Date(complaint.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${statusColors[complaint.status] || 'bg-slate-100 text-slate-700'}`}>
                {complaint.status}
              </span>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 mb-0.5">Department</p>
                <p className="font-semibold text-slate-700">{complaint.complaintDepartment || complaint.department}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 mb-0.5">Priority</p>
                <p className={`font-bold ${priorityColors[complaint.priority]}`}>{complaint.priority}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 mb-0.5">Student</p>
                <p className="font-semibold text-slate-700">{complaint.createdBy?.name || 'N/A'}</p>
                <p className="text-xs text-slate-400">{complaint.createdBy?.email}</p>
              </div>
              {complaint.createdBy?.registerNumber && (
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 mb-0.5">Register No.</p>
                  <p className="font-semibold text-slate-700">{complaint.createdBy.registerNumber}</p>
                </div>
              )}
              {complaint.assignedTo && (
                <div className="bg-indigo-50 rounded-xl px-4 py-3 col-span-2">
                  <p className="text-xs text-indigo-400 mb-0.5">Assigned To</p>
                  <p className="font-semibold text-indigo-700">{complaint.assignedTo?.name || 'Staff Member'}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5 font-semibold uppercase">Description</p>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {complaint.attachment && (
              <div className="mt-5">
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">Attachment</p>
                <a href={`${API_URL}/${complaint.attachment}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-xl transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  View Attachment
                </a>
              </div>
            )}
          </div>

          {/* Coordinator Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Coordinator Actions</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {canApprove && (
                <button onClick={handleApprove} disabled={actionLoading === 'approve'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-60">
                  {actionLoading === 'approve'
                    ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Approving...</>
                    : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Approve</>
                  }
                </button>
              )}
              {canReject && (
                <button onClick={() => setShowRejectModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Reject
                </button>
              )}
              {canAssign && (
                <button onClick={() => setShowAssignPanel(p => !p)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Assign Staff
                </button>
              )}
            </div>

            {/* Assign Staff Panel */}
            {showAssignPanel && (
              <div className="border border-indigo-100 bg-indigo-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-indigo-800 mb-3">Select Staff Member</p>
                <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
                  className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">-- Select Staff --</option>
                  {staffList.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.department || 'General'})</option>
                  ))}
                </select>
                <textarea value={assignRemark} onChange={e => setAssignRemark(e.target.value)}
                  placeholder="Add assignment note (optional)..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleAssign} disabled={actionLoading === 'assign'}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                    {actionLoading === 'assign' ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                  <button onClick={() => setShowAssignPanel(false)}
                    className="px-4 py-2.5 border border-indigo-200 rounded-xl text-sm text-indigo-600 hover:bg-indigo-100 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Verification Panel */}
            {canVerify && (
              <div className="border border-green-100 bg-green-50 rounded-xl p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800">Verify Resolution</h3>
                    <p className="text-sm text-green-600 mt-0.5">Staff has marked this as resolved. Review and close, or reopen.</p>
                  </div>
                </div>
                
                {showVerifyPanel ? (
                  <div className="mt-4 border-t border-green-200 pt-4">
                    <textarea value={verifyRemark} onChange={e => setVerifyRemark(e.target.value)}
                      placeholder="Add an optional verification or reopen note..."
                      rows={2}
                      className="w-full px-4 py-2.5 border border-green-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => handleVerify('accept')} disabled={actionLoading.startsWith('verify')}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                        {actionLoading === 'verify-accept' ? 'Closing...' : 'Accept & Close'}
                      </button>
                      <button onClick={() => handleVerify('reopen')} disabled={actionLoading.startsWith('verify')}
                        className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                        {actionLoading === 'verify-reopen' ? 'Reopening...' : 'Reopen Issue'}
                      </button>
                    </div>
                    <button onClick={() => setShowVerifyPanel(false)} className="w-full mt-2 text-sm text-green-700 hover:underline">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowVerifyPanel(true)}
                    className="mt-2 w-full py-2.5 bg-white border border-green-200 text-green-700 hover:bg-green-100 text-sm font-semibold rounded-xl transition">
                    Review Actions
                  </button>
                )}
              </div>
            )}

            {/* Add Remark */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Add Remark</p>
              <textarea value={remarkText} onChange={e => setRemarkText(e.target.value)}
                placeholder="Write a remark or note for this complaint..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none mb-2" />
              <button onClick={handleAddRemark} disabled={!remarkText.trim() || actionLoading === 'remark'}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
                {actionLoading === 'remark' ? 'Adding...' : 'Post Remark'}
              </button>
            </div>
          </div>

          {/* Remarks History */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Remarks History</h2>
            {complaint.remarks && complaint.remarks.length > 0 ? (
              <div className="space-y-3">
                {complaint.remarks.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600 text-sm font-bold">
                      {r.addedBy?.name?.charAt(0) || '?'}
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-3 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-slate-700">{r.addedBy?.name || 'Staff'}</p>
                        <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-slate-600">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No remarks yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-4">
            <h2 className="font-semibold text-slate-800 mb-6">Status Timeline</h2>
            {complaint.status === 'Rejected' ? (
              <div className="flex flex-col items-center p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-700 font-bold">Complaint Rejected</p>
                <p className="text-red-500 text-xs mt-1">Rejected by coordinator.</p>
              </div>
            ) : (
              <div className="relative space-y-0">
                {TIMELINE.map((step, i) => {
                  const isDone = i < currentStep;
                  const isActive = i === currentStep;
                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          isDone ? 'bg-green-500 text-white' :
                          isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {isDone
                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            : <span className="text-xs font-bold">{i+1}</span>
                          }
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div className={`w-0.5 h-8 ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />
                        )}
                      </div>
                      <div className="pb-6 pt-1.5">
                        <p className={`text-sm font-semibold ${isDone ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-slate-400'}`}>{step}</p>
                        {isActive && <p className="text-xs text-blue-400 mt-0.5">Current Stage</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Complaint ID</h3>
            <p className="font-mono text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">{complaint._id}</p>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Reject Complaint</h3>
              <p className="text-slate-500 text-sm mt-1">Please provide a reason for rejection.</p>
            </div>
            <textarea value={rejectRemark} onChange={e => setRejectRemark(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading === 'reject'}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60">
                {actionLoading === 'reject' ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorComplaintDetail;
