import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

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

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplaint(res.data);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load complaint.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center p-24 text-slate-400">
      <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      Loading...
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center p-24 text-slate-400">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="font-medium text-red-500">{error}</p>
      <Link to="/complaints/my" className="mt-4 text-blue-600 hover:underline text-sm">← Back to My Complaints</Link>
    </div>
  );

  const currentStep = complaint.status === 'Rejected' ? -1 : TIMELINE.indexOf(complaint.status);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/student" className="hover:text-blue-600">Dashboard</Link>
        <span>/</span>
        <Link to="/complaints/my" className="hover:text-blue-600">My Complaints</Link>
        <span>/</span>
        <span className="text-slate-600">#{id.slice(-6).toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
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

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 mb-0.5">Department</p>
                <p className="font-semibold text-slate-700">{complaint.complaintDepartment || complaint.department}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 mb-0.5">Priority</p>
                <p className={`font-bold ${priorityColors[complaint.priority]}`}>{complaint.priority}</p>
              </div>
              {complaint.assignedTo && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 col-span-2">
                  <p className="text-xs text-slate-400 mb-0.5">Assigned To</p>
                  <p className="font-semibold text-slate-700">{complaint.assignedTo?.name || 'Staff Member'}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5 font-semibold uppercase">Description</p>
              <p className="text-slate-700 leading-relaxed text-sm">{complaint.description}</p>
            </div>

            {complaint.attachment && (
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">Attachment</p>
                <a href={`http://localhost:5000/${complaint.attachment}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-xl transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  View Attachment
                </a>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Coordinator / Staff Remarks</h2>
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
              <p className="text-sm text-slate-400 italic">No remarks added yet. Check back after the coordinator reviews your complaint.</p>
            )}
          </div>
        </div>

        {/* Sidebar - Status Timeline */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-0">
            <h2 className="font-semibold text-slate-800 mb-6">Status Timeline</h2>

            {complaint.status === 'Rejected' ? (
              <div className="flex flex-col items-center p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-700 font-bold">Complaint Rejected</p>
                <p className="text-red-500 text-xs mt-1">Your complaint was rejected by the coordinator.</p>
              </div>
            ) : (
              <div className="relative space-y-0">
                {TIMELINE.map((step, i) => {
                  const isDone = i < currentStep;
                  const isActive = i === currentStep;
                  const isPending = i > currentStep;

                  return (
                    <div key={step} className="flex gap-4">
                      {/* Connector Line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          isDone ? 'bg-green-500 text-white' :
                          isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {isDone ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className="text-xs font-bold">{i+1}</span>
                          )}
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
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
